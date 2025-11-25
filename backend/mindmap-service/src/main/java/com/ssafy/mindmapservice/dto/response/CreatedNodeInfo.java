package com.ssafy.mindmapservice.dto.response;

import com.ssafy.mindmapservice.domain.MindmapNode;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * WebSocket으로 전송할 생성된 노드 정보
 */
@Schema(description = "생성된 노드 정보 (WebSocket 전송용)")
public record CreatedNodeInfo(
        @Schema(description = "노드 ID", example = "10")
        Long nodeId,

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
        Double y
) {
    /**
     * MindmapNode 엔티티를 CreatedNodeInfo DTO로 변환
     */
    public static CreatedNodeInfo from(MindmapNode node) {
        return new CreatedNodeInfo(
                node.getNodeId(),
                node.getParentId(),
                node.getType(),
                node.getKeyword(),
                node.getMemo(),
                node.getColor(),
                node.getX(),
                node.getY()
        );
    }

    public static CreatedNodeInfo fromContainImage(MindmapNode node, String imageUrl) {
        return new CreatedNodeInfo(
                node.getNodeId(),
                node.getParentId(),
                node.getType(),
                imageUrl,
                node.getMemo(),
                node.getColor(),
                node.getX(),
                node.getY()
        );
    }
}
