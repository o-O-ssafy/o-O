package com.ssafy.trendservice.scheduler;

import com.ssafy.trendservice.service.TrendBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 트렌드 집계 스케줄러
 * - Redis → DB 집계
 * - ZSET 캐시 리빌드
 * - 오래된 데이터 정리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TrendAggregationScheduler {

    private final TrendBatchService batchService;

    /**
     * Redis → DB 집계
     * 매 10분마다 실행
     */
    @Scheduled(cron = "${trend.batch.aggregation-cron}")
    public void aggregateDailyData() {
        try {
            log.info("Starting scheduled daily aggregation...");
            batchService.aggregateDailyData();
        } catch (Exception e) {
            log.error("Error during scheduled aggregation", e);
        }
    }

    /**
     * ZSET 캐시 리빌드
     * 매 5분마다 실행
     */
    @Scheduled(cron = "${trend.batch.cache-rebuild-cron}")
    public void rebuildCache() {
        try {
            log.info("Starting scheduled cache rebuild...");
            batchService.rebuildZsetCache();
        } catch (Exception e) {
            log.error("Error during scheduled cache rebuild", e);
        }
    }

    /**
     * 오래된 데이터 정리
     * 매일 새벽 2시 실행
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldData() {
        try {
            log.info("Starting scheduled data cleanup...");
            batchService.cleanupOldData();
        } catch (Exception e) {
            log.error("Error during scheduled cleanup", e);
        }
    }
}