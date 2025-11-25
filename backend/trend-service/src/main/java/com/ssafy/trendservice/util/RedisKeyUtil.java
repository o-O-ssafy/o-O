package com.ssafy.trendservice.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Redis 키 생성 유틸리티
 */
public class RedisKeyUtil {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    // 일별 해시 키
    public static String dailyAddKey(LocalDate date, String parentKw) {
        return String.format("h:addkw:%s:%s", date.format(DATE_FORMATTER), parentKw);
    }

    public static String dailyViewKey(LocalDate date, String parentKw) {
        return String.format("h:viewkw:%s:%s", date.format(DATE_FORMATTER), parentKw);
    }

    // 실시간 버킷 키 (분 단위)
    public static String realtimeAddKey(LocalDateTime datetime, String parentKw) {
        return String.format("h:addkw:rt:%s:%s", datetime.format(DATETIME_FORMATTER), parentKw);
    }

    public static String realtimeViewKey(LocalDateTime datetime, String parentKw) {
        return String.format("h:viewkw:rt:%s:%s", datetime.format(DATETIME_FORMATTER), parentKw);
    }

    // ZSET 캐시 키
    public static String zsetParentKey(String parentKw, String period) {
        return String.format("z:parent:%s:%s", parentKw, period);
    }

    public static String zsetGlobalKey(String period) {
        return String.format("z:global:%s", period);
    }

    // 분산 락 키
    public static String batchLockKey(String batchType) {
        return String.format("lock:batch:%s", batchType);
    }

    // 일별 키 패턴 (SCAN용)
    public static String dailyAddPattern(LocalDate date) {
        return String.format("h:addkw:%s:*", date.format(DATE_FORMATTER));
    }

    public static String dailyViewPattern(LocalDate date) {
        return String.format("h:viewkw:%s:*", date.format(DATE_FORMATTER));
    }

    // 실시간 버킷 패턴
    public static String realtimeAddPattern(LocalDateTime datetime) {
        return String.format("h:addkw:rt:%s:*", datetime.format(DATETIME_FORMATTER));
    }

    public static String realtimeViewPattern(LocalDateTime datetime) {
        return String.format("h:viewkw:rt:%s:*", datetime.format(DATETIME_FORMATTER));
    }
}