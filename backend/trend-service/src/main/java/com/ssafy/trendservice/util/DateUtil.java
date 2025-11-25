package com.ssafy.trendservice.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * 날짜 유틸리티
 */
public class DateUtil {

    /**
     * 과거 N일간의 날짜 리스트 반환 (오늘 포함)
     */
    public static List<LocalDate> getLastNDays(int days) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 0; i < days; i++) {
            dates.add(today.minusDays(i));
        }
        return dates;
    }

    /**
     * 분 단위로 내림 (초, 나노초 제거)
     */
    public static LocalDateTime truncateToMinute(LocalDateTime datetime) {
        return datetime.truncatedTo(ChronoUnit.MINUTES);
    }

    /**
     * 현재 시각의 분 단위 버킷
     */
    public static LocalDateTime getCurrentMinuteBucket() {
        return truncateToMinute(LocalDateTime.now());
    }

    /**
     * N분 전의 버킷 리스트 반환
     */
    public static List<LocalDateTime> getLastNMinutes(int minutes) {
        List<LocalDateTime> buckets = new ArrayList<>();
        LocalDateTime current = getCurrentMinuteBucket();
        for (int i = 0; i < minutes; i++) {
            buckets.add(current.minusMinutes(i));
        }
        return buckets;
    }
}