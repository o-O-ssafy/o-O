package com.ssafy.trendservice.dto.es;

import lombok.Data;

import java.time.Instant;

@Data
public class PublicNodeDocument {
    private Long workspaceId;
    private Long nodeId;
    private Long parentNodeId;
    private String keyword;
    private String parentKeyword;
    private String type;
    private Instant createdAt;
    private Instant updatedAt;
}