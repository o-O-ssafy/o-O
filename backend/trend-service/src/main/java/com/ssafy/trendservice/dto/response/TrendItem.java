package com.ssafy.trendservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 트렌드 아이템 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendItem {

    private String keyword;
    private Long score;
    private Integer rank;
}