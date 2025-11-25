package com.ssafy.trendservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 트렌드 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendResponse {

    private String period;        // "7d" or "30d"
    private String parentKeyword; // null이면 글로벌
    private Integer totalCount;
    private List<TrendItem> items;
}