package com.ssafy.trendservice.repository;

import com.ssafy.trendservice.util.RedisKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Redis 접근 레포지토리
 * - Hash 기반 카운팅
 * - ZSET 캐시 관리
 * - 분산 락
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class TrendRedisRepository {

    private final StringRedisTemplate redisTemplate;

    // ================== 카운트 증가 ==================

    /**
     * 일별 + 실시간 버킷에 add count 증가
     */
    public void incrementAddCount(String parentKw, String childKw, LocalDateTime timestamp, long ttlSeconds) {
        LocalDate date = timestamp.toLocalDate();
        LocalDateTime minuteBucket = timestamp.truncatedTo(java.time.temporal.ChronoUnit.MINUTES);

        // 일별 해시
        String dailyKey = RedisKeyUtil.dailyAddKey(date, parentKw);
        redisTemplate.opsForHash().increment(dailyKey, childKw, 1);
        redisTemplate.expire(dailyKey, Duration.ofSeconds(ttlSeconds));

        // 실시간 버킷
        String rtKey = RedisKeyUtil.realtimeAddKey(minuteBucket, parentKw);
        redisTemplate.opsForHash().increment(rtKey, childKw, 1);
        redisTemplate.expire(rtKey, Duration.ofSeconds(7200)); // 2시간
    }

    /**
     * 일별 + 실시간 버킷에 view count 증가
     */
    public void incrementViewCount(String parentKw, String childKw, LocalDateTime timestamp, long ttlSeconds) {
        LocalDate date = timestamp.toLocalDate();
        LocalDateTime minuteBucket = timestamp.truncatedTo(java.time.temporal.ChronoUnit.MINUTES);

        String dailyKey = RedisKeyUtil.dailyViewKey(date, parentKw);
        redisTemplate.opsForHash().increment(dailyKey, childKw, 1);
        redisTemplate.expire(dailyKey, Duration.ofSeconds(ttlSeconds));

        String rtKey = RedisKeyUtil.realtimeViewKey(minuteBucket, parentKw);
        redisTemplate.opsForHash().increment(rtKey, childKw, 1);
        redisTemplate.expire(rtKey, Duration.ofSeconds(7200));
    }

    // ================== SCAN 기반 배치 처리 ==================

    /**
     * 특정 날짜의 일별 키들을 SCAN으로 조회
     * @return Map<parent, Map<child, count>>
     */
    public Map<String, Map<String, Long>> scanDailyAddKeys(LocalDate date, int scanCount) {
        String pattern = RedisKeyUtil.dailyAddPattern(date);
        return scanHashKeys(pattern, scanCount);
    }

    public Map<String, Map<String, Long>> scanDailyViewKeys(LocalDate date, int scanCount) {
        String pattern = RedisKeyUtil.dailyViewPattern(date);
        return scanHashKeys(pattern, scanCount);
    }

    /**
     * 실시간 버킷 SCAN
     */
    public Map<String, Map<String, Long>> scanRealtimeAddKeys(LocalDateTime bucket, int scanCount) {
        String pattern = RedisKeyUtil.realtimeAddPattern(bucket);
        return scanHashKeys(pattern, scanCount);
    }

    public Map<String, Map<String, Long>> scanRealtimeViewKeys(LocalDateTime bucket, int scanCount) {
        String pattern = RedisKeyUtil.realtimeViewPattern(bucket);
        return scanHashKeys(pattern, scanCount);
    }

    /**
     * 패턴 매칭 키들을 SCAN하고 각 해시의 내용을 조회
     */
    private Map<String, Map<String, Long>> scanHashKeys(String pattern, int scanCount) {
        Map<String, Map<String, Long>> result = new HashMap<>();

        ScanOptions options = ScanOptions.scanOptions()
                .match(pattern)
                .count(scanCount)
                .build();

        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                Map<Object, Object> hashEntries = redisTemplate.opsForHash().entries(key);

                // parent 추출 (키 포맷: h:addkw:{date}:{parent})
                String parent = extractParentFromKey(key);

                Map<String, Long> childCounts = new HashMap<>();
                for (Map.Entry<Object, Object> entry : hashEntries.entrySet()) {
                    String child = (String) entry.getKey();
                    Long count = Long.valueOf((String) entry.getValue());
                    childCounts.put(child, count);
                }

                result.put(parent, childCounts);
            }
        } catch (Exception e) {
            log.error("Error scanning keys with pattern: {}", pattern, e);
        }

        return result;
    }

    private String extractParentFromKey(String key) {
        // 키 포맷: h:addkw:{date}:{parent} 또는 h:addkw:rt:{datetime}:{parent}
        String[] parts = key.split(":");
        return parts[parts.length - 1];
    }

    // ================== ZSET 캐시 관리 ==================

    /**
     * ZSET에 멤버 추가/업데이트
     */
    public void zsetAdd(String key, String member, double score, long ttlSeconds) {
        redisTemplate.opsForZSet().add(key, member, score);
        redisTemplate.expire(key, Duration.ofSeconds(ttlSeconds));
    }

    /**
     * ZSET 스코어 증가
     */
    public void zsetIncrBy(String key, String member, double delta) {
        redisTemplate.opsForZSet().incrementScore(key, member, delta);
    }

    /**
     * ZSET TOP N 조회 (내림차순)
     */
    public Set<ZSetOperations.TypedTuple<String>> zsetRangeWithScores(String key, int limit) {
        return redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, limit - 1);
    }

    /**
     * ZSET 전체 삭제 후 재구성
     */
    public void zsetRebuild(String key, Map<String, Double> members, long ttlSeconds) {
        redisTemplate.delete(key);
        if (!members.isEmpty()) {
            Set<ZSetOperations.TypedTuple<String>> tuples = new HashSet<>();
            for (Map.Entry<String, Double> entry : members.entrySet()) {
                tuples.add(ZSetOperations.TypedTuple.of(entry.getKey(), entry.getValue()));
            }
            redisTemplate.opsForZSet().add(key, tuples);
            redisTemplate.expire(key, Duration.ofSeconds(ttlSeconds));
        }
    }

    /**
     * ZSET 키 존재 여부
     */
    public boolean zsetExists(String key) {
        Long size = redisTemplate.opsForZSet().size(key);
        return size != null && size > 0;
    }

    // ================== 분산 락 ==================

    /**
     * 분산 락 획득 시도 (SETNX 기반)
     */
    public boolean tryLock(String lockKey, String lockValue, long timeoutSeconds) {
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, Duration.ofSeconds(timeoutSeconds));
        return Boolean.TRUE.equals(acquired);
    }

    /**
     * 분산 락 해제
     */
    public void releaseLock(String lockKey, String lockValue) {
        String currentValue = redisTemplate.opsForValue().get(lockKey);
        if (lockValue.equals(currentValue)) {
            redisTemplate.delete(lockKey);
        }
    }

    // ================== 키 삭제 ==================

    /**
     * 특정 패턴의 키들 삭제
     */
    public void deleteKeysByPattern(String pattern) {
        ScanOptions options = ScanOptions.scanOptions()
                .match(pattern)
                .count(100)
                .build();

        List<String> keysToDelete = new ArrayList<>();
        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                keysToDelete.add(cursor.next());
            }
        }

        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
            log.info("Deleted {} keys matching pattern: {}", keysToDelete.size(), pattern);
        }
    }
}