package com.ssafy.trendservice.service;

import com.ssafy.trendservice.repository.TrendDbRepository;
import com.ssafy.trendservice.repository.TrendRedisRepository;
import com.ssafy.trendservice.util.DateUtil;
import com.ssafy.trendservice.util.RedisKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 트렌드 배치 집계 서비스
 * - Redis → DB 데이터 이관
 * - 7/30일 집계 계산
 * - ZSET 캐시 리빌드
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrendBatchService {

    private final TrendRedisRepository redisRepository;
    private final TrendDbRepository dbRepository;

    @Value("${trend.batch.scan-count}")
    private int scanCount;

    @Value("${trend.batch.lock-timeout}")
    private long lockTimeout;

    @Value("${trend.redis.ttl.zset-cache}")
    private long zsetCacheTtl;

    private static final String LOCK_AGGREGATION = "aggregate";
    private static final String LOCK_CACHE_REBUILD = "cache-rebuild";

    // ================== Redis → DB 집계 ==================

    /**
     * 일별 데이터를 Redis에서 DB로 UPSERT
     * 분산 락으로 중복 실행 방지
     */
    public void aggregateDailyData() {
        String lockKey = RedisKeyUtil.batchLockKey(LOCK_AGGREGATION);
        String lockValue = UUID.randomUUID().toString();

        if (!redisRepository.tryLock(lockKey, lockValue, lockTimeout)) {
            log.warn("Another aggregation process is running. Skipping...");
            return;
        }

        try {
            log.info("Starting daily data aggregation...");

            // 최근 8일치 데이터 집계 (TTL 범위 내)
            List<LocalDate> dates = DateUtil.getLastNDays(8);

            for (LocalDate date : dates) {
                aggregateDateData(date);
            }

            log.info("Daily data aggregation completed");

        } catch (Exception e) {
            log.error("Error during daily aggregation", e);
            throw e;
        } finally {
            redisRepository.releaseLock(lockKey, lockValue);
        }
    }

    /**
     * 특정 날짜의 데이터 집계
     */
    private void aggregateDateData(LocalDate date) {
        // Add counts
        Map<String, Map<String, Long>> addCounts =
                redisRepository.scanDailyAddKeys(date, scanCount);

        // View counts
        Map<String, Map<String, Long>> viewCounts =
                redisRepository.scanDailyViewKeys(date, scanCount);

        if (!addCounts.isEmpty() || !viewCounts.isEmpty()) {
            dbRepository.upsertDailyEdges(date, addCounts, viewCounts);
            log.info("Aggregated {} add and {} view entries for date: {}",
                    addCounts.size(), viewCounts.size(), date);
        }
    }

    // ================== ZSET 캐시 리빌드 ==================

    /**
     * DB 기준 ZSET 캐시 재구성 + 실시간 델타 적용
     */
    public void rebuildZsetCache() {
        String lockKey = RedisKeyUtil.batchLockKey(LOCK_CACHE_REBUILD);
        String lockValue = UUID.randomUUID().toString();

        if (!redisRepository.tryLock(lockKey, lockValue, lockTimeout)) {
            log.warn("Another cache rebuild process is running. Skipping...");
            return;
        }

        try {
            log.info("Starting ZSET cache rebuild...");

            // 1. DB 기준 스코어 계산
            dbRepository.rebuildAggregatedScores();

            // 2. 글로벌 트렌드 ZSET 리빌드
            rebuildGlobalZsets();

            // 3. 실시간 델타 적용 (최근 30분 버킷)
            applyRealtimeDelta();

            log.info("ZSET cache rebuild completed");

        } catch (Exception e) {
            log.error("Error during cache rebuild", e);
            throw e;
        } finally {
            redisRepository.releaseLock(lockKey, lockValue);
        }
    }

    /**
     * 글로벌 트렌드 ZSET 리빌드
     */
    private void rebuildGlobalZsets() {
        // 7일 글로벌
        Map<String, Double> global7d = dbRepository.getGlobalTrend7d(1000);
        String key7d = RedisKeyUtil.zsetGlobalKey("7d");
        redisRepository.zsetRebuild(key7d, global7d, zsetCacheTtl);
        log.info("Rebuilt global 7d ZSET: {} members", global7d.size());

        // 30일 글로벌
        Map<String, Double> global30d = dbRepository.getGlobalTrend30d(1000);
        String key30d = RedisKeyUtil.zsetGlobalKey("30d");
        redisRepository.zsetRebuild(key30d, global30d, zsetCacheTtl);
        log.info("Rebuilt global 30d ZSET: {} members", global30d.size());
    }

    /**
     * 실시간 버킷 데이터를 ZSET에 델타로 적용
     * 최근 30분의 버킷을 ZINCRBY로 오버레이
     */
    private void applyRealtimeDelta() {
        List<LocalDateTime> recentBuckets = DateUtil.getLastNMinutes(30);

        for (LocalDateTime bucket : recentBuckets) {
            // Add counts
            Map<String, Map<String, Long>> addCounts =
                    redisRepository.scanRealtimeAddKeys(bucket, scanCount);

            // View counts
            Map<String, Map<String, Long>> viewCounts =
                    redisRepository.scanRealtimeViewKeys(bucket, scanCount);

            // 글로벌 ZSET에 델타 적용
            applyDeltaToGlobal(addCounts, viewCounts);

            // 부모별 ZSET에 델타 적용
            applyDeltaToParents(addCounts, viewCounts);
        }

        log.info("Applied realtime delta for last 30 minutes");
    }

    /**
     * 글로벌 ZSET에 델타 적용
     */
    private void applyDeltaToGlobal(Map<String, Map<String, Long>> addCounts,
                                    Map<String, Map<String, Long>> viewCounts) {
        String key7d = RedisKeyUtil.zsetGlobalKey("7d");
        String key30d = RedisKeyUtil.zsetGlobalKey("30d");

        // Add counts (가중치 3)
        for (Map<String, Long> childCounts : addCounts.values()) {
            for (Map.Entry<String, Long> entry : childCounts.entrySet()) {
                double delta = entry.getValue() * 3.0;
                redisRepository.zsetIncrBy(key7d, entry.getKey(), delta);
                redisRepository.zsetIncrBy(key30d, entry.getKey(), delta);
            }
        }

        // View counts (가중치 1)
        for (Map<String, Long> childCounts : viewCounts.values()) {
            for (Map.Entry<String, Long> entry : childCounts.entrySet()) {
                double delta = entry.getValue() * 1.0;
                redisRepository.zsetIncrBy(key7d, entry.getKey(), delta);
                redisRepository.zsetIncrBy(key30d, entry.getKey(), delta);
            }
        }
    }

    /**
     * 부모별 ZSET에 델타 적용
     */
    private void applyDeltaToParents(Map<String, Map<String, Long>> addCounts,
                                     Map<String, Map<String, Long>> viewCounts) {
        // Add counts
        for (Map.Entry<String, Map<String, Long>> parentEntry : addCounts.entrySet()) {
            String parent = parentEntry.getKey();
            String key7d = RedisKeyUtil.zsetParentKey(parent, "7d");
            String key30d = RedisKeyUtil.zsetParentKey(parent, "30d");

            for (Map.Entry<String, Long> childEntry : parentEntry.getValue().entrySet()) {
                double delta = childEntry.getValue() * 3.0;
                redisRepository.zsetIncrBy(key7d, childEntry.getKey(), delta);
                redisRepository.zsetIncrBy(key30d, childEntry.getKey(), delta);
            }
        }

        // View counts
        for (Map.Entry<String, Map<String, Long>> parentEntry : viewCounts.entrySet()) {
            String parent = parentEntry.getKey();
            String key7d = RedisKeyUtil.zsetParentKey(parent, "7d");
            String key30d = RedisKeyUtil.zsetParentKey(parent, "30d");

            for (Map.Entry<String, Long> childEntry : parentEntry.getValue().entrySet()) {
                double delta = childEntry.getValue() * 1.0;
                redisRepository.zsetIncrBy(key7d, childEntry.getKey(), delta);
                redisRepository.zsetIncrBy(key30d, childEntry.getKey(), delta);
            }
        }
    }

    // ================== TTL 관리 ==================

    /**
     * 오래된 데이터 정리 (8일 이상 된 일별 키)
     */
    public void cleanupOldData() {
        LocalDate cutoffDate = LocalDate.now().minusDays(8);

        for (int i = 0; i < 30; i++) {
            LocalDate oldDate = cutoffDate.minusDays(i);
            String addPattern = RedisKeyUtil.dailyAddPattern(oldDate);
            String viewPattern = RedisKeyUtil.dailyViewPattern(oldDate);

            redisRepository.deleteKeysByPattern(addPattern);
            redisRepository.deleteKeysByPattern(viewPattern);
        }

        log.info("Cleaned up data older than 8 days");
    }
}