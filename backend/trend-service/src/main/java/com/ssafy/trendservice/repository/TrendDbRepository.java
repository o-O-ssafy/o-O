package com.ssafy.trendservice.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PostgreSQL 접근 레포지토리
 * - 배치 UPSERT
 * - 7/30일 집계 계산
 * - 트렌드 스코어 조회
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class TrendDbRepository {

    private final JdbcTemplate jdbcTemplate;

    // ================== 일별 원본 데이터 UPSERT ==================

    /**
     * trend_edge_daily 테이블에 배치 UPSERT
     * ON CONFLICT UPDATE로 중복 처리
     */
    @Transactional
    public void upsertDailyEdges(LocalDate date, Map<String, Map<String, Long>> addCounts,
                                 Map<String, Map<String, Long>> viewCounts) {
        // 모든 parent-child 조합 수집
        Map<String, Map<String, CountPair>> mergedData = new HashMap<>();

        // Add counts
        for (Map.Entry<String, Map<String, Long>> parentEntry : addCounts.entrySet()) {
            String parent = parentEntry.getKey();
            mergedData.putIfAbsent(parent, new HashMap<>());

            for (Map.Entry<String, Long> childEntry : parentEntry.getValue().entrySet()) {
                String child = childEntry.getKey();
                mergedData.get(parent).putIfAbsent(child, new CountPair());
                mergedData.get(parent).get(child).addCnt = childEntry.getValue();
            }
        }

        // View counts
        for (Map.Entry<String, Map<String, Long>> parentEntry : viewCounts.entrySet()) {
            String parent = parentEntry.getKey();
            mergedData.putIfAbsent(parent, new HashMap<>());

            for (Map.Entry<String, Long> childEntry : parentEntry.getValue().entrySet()) {
                String child = childEntry.getKey();
                mergedData.get(parent).putIfAbsent(child, new CountPair());
                mergedData.get(parent).get(child).viewCnt = childEntry.getValue();
            }
        }

        // 배치 UPSERT
        String sql = """
            INSERT INTO trend_edge_daily (d, parent_kw, child_kw, add_cnt, view_cnt)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (d, parent_kw, child_kw)
            DO UPDATE SET
                add_cnt = EXCLUDED.add_cnt,
                view_cnt = EXCLUDED.view_cnt,
                updated_at = CURRENT_TIMESTAMP
        """;

        List<Object[]> batchArgs = mergedData.entrySet().stream()
                .flatMap(parentEntry ->
                        parentEntry.getValue().entrySet().stream()
                                .map(childEntry -> new Object[] {
                                        date,
                                        parentEntry.getKey(),
                                        childEntry.getKey(),
                                        childEntry.getValue().addCnt,
                                        childEntry.getValue().viewCnt
                                })
                ).toList();

        if (!batchArgs.isEmpty()) {
            jdbcTemplate.batchUpdate(sql, batchArgs);
            log.info("Upserted {} daily edges for date: {}", batchArgs.size(), date);
        }
    }

    private static class CountPair {
        long addCnt = 0;
        long viewCnt = 0;
    }

    // ================== 집계 스코어 계산 및 저장 ==================

    /**
     * 7일/30일 집계 계산 및 trend_edge_score 업데이트
     * 가중치: add_cnt * 3 + view_cnt * 1
     */
    @Transactional
    public void rebuildAggregatedScores() {
        LocalDate today = LocalDate.now();
        LocalDate date7d = today.minusDays(6); // 오늘 포함 7일
        LocalDate date30d = today.minusDays(29); // 오늘 포함 30일

        String sql = """
            INSERT INTO trend_edge_score (parent_kw, child_kw, score_7d, score_30d)
            SELECT
                parent_kw,
                child_kw,
                COALESCE(SUM(CASE WHEN d >= ? THEN (add_cnt * 3 + view_cnt) ELSE 0 END), 0) AS score_7d,
                COALESCE(SUM(CASE WHEN d >= ? THEN (add_cnt * 3 + view_cnt) ELSE 0 END), 0) AS score_30d
            FROM trend_edge_daily
            WHERE d >= ?
            GROUP BY parent_kw, child_kw
            ON CONFLICT (parent_kw, child_kw)
            DO UPDATE SET
                score_7d = EXCLUDED.score_7d,
                score_30d = EXCLUDED.score_30d,
                last_updated_at = CURRENT_TIMESTAMP
        """;

        int updated = jdbcTemplate.update(sql, date7d, date30d, date30d);
        log.info("Rebuilt aggregated scores: {} edges updated", updated);
    }

    // ================== 트렌드 조회 ==================

    /**
     * 특정 부모의 자식 트렌드 조회 (7일 기준)
     */
    public Map<String, Double> getParentTrend7d(String parentKw, int limit) {
        String sql = """
            SELECT child_kw, score_7d
            FROM trend_edge_score
            WHERE parent_kw = ?
            ORDER BY score_7d DESC
            LIMIT ?
        """;

        return queryToMap(sql, parentKw, limit);
    }

    /**
     * 특정 부모의 자식 트렌드 조회 (30일 기준)
     */
    public Map<String, Double> getParentTrend30d(String parentKw, int limit) {
        String sql = """
            SELECT child_kw, score_30d
            FROM trend_edge_score
            WHERE parent_kw = ?
            ORDER BY score_30d DESC
            LIMIT ?
        """;

        return queryToMap(sql, parentKw, limit);
    }

    /**
     * 글로벌 트렌드 조회 (7일 기준)
     */
    public Map<String, Double> getGlobalTrend7d(int limit) {
        LocalDate today = LocalDate.now();
        LocalDate date7d = today.minusDays(6); // 오늘 포함 7일

        String sql = """
        WITH base AS (
            -- 기존 글로벌 점수: child_kw 기준 합산
            SELECT child_kw, SUM(score_7d) AS base_score
            FROM trend_edge_score
            GROUP BY child_kw
        ),
        child_stats AS (
            -- 최근 7일 동안 parent로 쓰인 키워드의 자식 개수
            SELECT parent_kw AS kw,
                   COUNT(DISTINCT child_kw) AS child_cnt
            FROM trend_edge_daily
            WHERE d >= ?
            GROUP BY parent_kw
        )
        SELECT
            b.child_kw,
            -- 자식 수에 따른 가중치 적용
            b.base_score * (1 + LN(1 + COALESCE(c.child_cnt, 0))) AS final_score
        FROM base b
        LEFT JOIN child_stats c ON c.kw = b.child_kw
        -- 자식 없는 키워드 아예 빼고 싶으면 아래 주석 풀기
        -- WHERE COALESCE(c.child_cnt, 0) > 0
        ORDER BY final_score DESC
        LIMIT ?
        """;

        return queryToMap(sql, date7d, limit);
    }


    /**
     * 글로벌 트렌드 조회 (30일 기준)
     */
    public Map<String, Double> getGlobalTrend30d(int limit) {
        LocalDate today = LocalDate.now();
        LocalDate date30d = today.minusDays(29); // 오늘 포함 30일

        String sql = """
        WITH base AS (
            SELECT child_kw, SUM(score_30d) AS base_score
            FROM trend_edge_score
            GROUP BY child_kw
        ),
        child_stats AS (
            SELECT parent_kw AS kw,
                   COUNT(DISTINCT child_kw) AS child_cnt
            FROM trend_edge_daily
            WHERE d >= ?
            GROUP BY parent_kw
        )
        SELECT
            b.child_kw,
            b.base_score * (1 + LN(1 + COALESCE(c.child_cnt, 0))) AS final_score
        FROM base b
        LEFT JOIN child_stats c ON c.kw = b.child_kw
        -- WHERE COALESCE(c.child_cnt, 0) > 0
        ORDER BY final_score DESC
        LIMIT ?
        """;

        return queryToMap(sql, date30d, limit);
    }


    /**
     * 키워드 검색 (LIKE 검색)
     */
    public Map<String, Double> searchTrend(String keyword, String period, int limit) {
        String scoreColumn = "7d".equals(period) ? "score_7d" : "score_30d";

        String sql = String.format("""
            SELECT child_kw, SUM(%s) as total_score
            FROM trend_edge_score
            WHERE child_kw LIKE ?
            GROUP BY child_kw
            ORDER BY total_score DESC
            LIMIT ?
        """, scoreColumn);

        return queryToMap(sql, "%" + keyword + "%", limit);
    }

    // ================== 배치 커서 관리 ==================

    /**
     * 마지막 처리된 커서 조회
     */
    public String getLastProcessedCursor(String batchType) {
        String sql = "SELECT last_processed_key FROM trend_batch_cursor WHERE batch_type = ?";

        try {
            return jdbcTemplate.queryForObject(sql, String.class, batchType);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 배치 커서 업데이트
     */
    @Transactional
    public void updateBatchCursor(String batchType, String lastKey) {
        String sql = """
            INSERT INTO trend_batch_cursor (batch_type, last_processed_key, last_run_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (batch_type)
            DO UPDATE SET
                last_processed_key = EXCLUDED.last_processed_key,
                last_run_at = CURRENT_TIMESTAMP
        """;

        jdbcTemplate.update(sql, batchType, lastKey);
    }

    // ================== Helpers ==================

    private Map<String, Double> queryToMap(String sql, Object... args) {
        Map<String, Double> result = new HashMap<>();

        jdbcTemplate.query(sql, rs -> {
            String keyword = rs.getString(1);
            Double score = rs.getDouble(2);
            result.put(keyword, score);
        }, args);

        return result;
    }


    public List<String> getRandomKeywords(int limit) {
        String sql = """
        SELECT child_kw
        FROM trend_edge_score
        ORDER BY random()
        LIMIT ?
        """;

        return jdbcTemplate.queryForList(sql, String.class, limit);
    }
}