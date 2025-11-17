package com.ssafy.mindmapservice.dto.response;

import com.ssafy.mindmapservice.domain.MindmapNode;

import java.time.LocalDateTime;

/**
 * 마인드맵 노드 응답 DTO
 * image 타입의 경우 keyword에 presigned URL이 포함됨
 */
public record NodeResponse(
        String id,
        Long nodeId,
        Long workspaceId,
        Long parentId,
        String type,
        String keyword,
        String memo,
        String analysisStatus,
        Double x,
        Double y,
        String color,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static NodeResponse from(MindmapNode node, String resolvedKeyword) {
        return new NodeResponse(
                node.getId(),
                node.getNodeId(),
                node.getWorkspaceId(),
                node.getParentId(),
                node.getType(),
                resolvedKeyword,  // image 타입이면 presigned URL, 아니면 원래 keyword
                node.getMemo(),
                node.getAnalysisStatus() != null ? node.getAnalysisStatus().name() : null,
                node.getX(),
                node.getY(),
                node.getColor(),
                node.getCreatedAt(),
                node.getUpdatedAt()
        );
    }
}