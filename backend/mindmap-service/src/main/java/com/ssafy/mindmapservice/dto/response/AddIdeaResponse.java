package com.ssafy.mindmapservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * 아이디어 추가 응답 DTO
 */
@Schema(description = "아이디어 추가 응답")
public record AddIdeaResponse(
        @Schema(description = "워크스페이스 ID", example = "123")
        Long workspaceId,

        @Schema(description = "생성된 키워드 노드 개수", example = "5")
        int createdNodeCount,

        @Schema(description = "생성된 노드 ID 리스트", example = "[10, 11, 12, 13, 14]")
        List<Long> createdNodeIds,

        @Schema(description = "응답 메시지", example = "아이디어가 추가되었습니다.")
        String message
) {}
