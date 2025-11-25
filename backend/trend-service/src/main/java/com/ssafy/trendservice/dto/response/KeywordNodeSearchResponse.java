package com.ssafy.trendservice.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class KeywordNodeSearchResponse {
    private List<KeywordNode> nodes;
    private Integer totalCount;
}