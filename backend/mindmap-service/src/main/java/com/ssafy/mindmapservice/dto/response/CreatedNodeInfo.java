package com.ssafy.mindmapservice.dto.response;

import com.ssafy.mindmapservice.domain.MindmapNode;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * WebSocket으로 전송할 생성된 노드 정보
 */
@Schema(description = "생성된 노드 정보 (WebSocket 전송용)")
public record CreatedNodeInfo(

        // ✅ 새로 추가되는 필드들
        @Schema(description = "MongoDB 문서 ID", example = "6925561abe8c3779a677d754")
        String id,

        @Schema(description = "노드 ID", example = "10")
        Long nodeId,

        @Schema(description = "워크스페이스 ID", example = "69")
        Long workspaceId,

        @Schema(description = "부모 노드 ID", example = "3")
        Long parentId,

        @Schema(description = "노드 타입", example = "text")
        String type,

        @Schema(description = "키워드", example = "맛집 검색")
        String keyword,

        @Schema(description = "메모", example = "사용자 위치 기반으로 주변 맛집을 검색하는 기능")
        String memo,

        @Schema(description = "노드 색상", example = "#FFE5E5")
        String color,

        @Schema(description = "X 좌표 (null 가능)", example = "100.0")
        Double x,

        @Schema(description = "Y 좌표 (null 가능)", example = "200.0")
        Double y,

        @Schema(description = "분석 상태", example = "NONE")
        String analysisStatus,

        @Schema(description = "생성 시각", example = "2025-11-25T16:09:14.408")
        String createdAt,

        @Schema(description = "수정 시각", example = "2025-11-25T16:10:54.029")
        String updatedAt
) {

    /**
     * 기존 코드 호환용 생성자
     *
     * 예전에 이렇게 쓰던 코드:
     *   new CreatedNodeInfo(nodeId, parentId, type, keyword, memo, color, x, y)
     * 그대로 컴파일/실행 되도록 유지
     */
    public CreatedNodeInfo(
            Long nodeId,
            Long parentId,
            String type,
            String keyword,
            String memo,
            String color,
            Double x,
            Double y
    ) {
        this(
                null,              // id
                nodeId,
                null,              // workspaceId
                parentId,
                type,
                keyword,
                memo,
                color,
                x,
                y,
                null,              // analysisStatus
                null,              // createdAt
                null               // updatedAt
        );
    }

    /**
     * MindmapNode 엔티티를 CreatedNodeInfo DTO로 변환
     */
    public static CreatedNodeInfo from(MindmapNode node) {
        return new CreatedNodeInfo(
                node.getId(),                             // MongoDB _id
                node.getNodeId(),
                node.getWorkspaceId(),
                node.getParentId(),
                node.getType(),
                node.getKeyword(),
                node.getMemo(),
                node.getColor(),
                node.getX(),
                node.getY(),
                node.getAnalysisStatus() != null
                        ? node.getAnalysisStatus().name()
                        : null,
                node.getCreatedAt() != null
                        ? node.getCreatedAt().toString()
                        : null,
                node.getUpdatedAt() != null
                        ? node.getUpdatedAt().toString()
                        : null
        );
    }

    /**
     * 이미지 URL을 keyword 대신 넣어서 보내는 버전
     */
    public static CreatedNodeInfo fromContainImage(MindmapNode node, String imageUrl) {
        return new CreatedNodeInfo(
                node.getId(),
                node.getNodeId(),
                node.getWorkspaceId(),
                node.getParentId(),
                node.getType(),            // 필요하면 "image" 같은 타입으로 바꿔도 OK
                imageUrl,                  // keyword 자리에 imageUrl
                node.getMemo(),
                node.getColor(),
                node.getX(),
                node.getY(),
                node.getAnalysisStatus() != null
                        ? node.getAnalysisStatus().name()
                        : null,
                node.getCreatedAt() != null
                        ? node.getCreatedAt().toString()
                        : null,
                node.getUpdatedAt() != null
                        ? node.getUpdatedAt().toString()
                        : null
        );
    }
}
