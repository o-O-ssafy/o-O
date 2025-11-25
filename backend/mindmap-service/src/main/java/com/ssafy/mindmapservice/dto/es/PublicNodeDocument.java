package com.ssafy.mindmapservice.dto.es;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
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
