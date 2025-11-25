package com.ssafy.trendservice.dto.response;

import lombok.Data;

@Data
public class KeywordNode {
    private Long workspaceId;
    private Long parentId;
    private Long nodeId;
    private String parentKeyword;
    private String keyword;
}