package com.ssafy.mindmapservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 초기 마인드맵 생성 응답 DTO
 */
@Schema(description = "초기 마인드맵 생성 응답 DTO")
public record InitialMindmapResponse(

        @Schema(description = "생성된 워크스페이스 ID", example = "123")
        Long workspaceId,

        @Schema(description = "생성된 첫 노드 ID", example = "1")
        Long nodeId,

        @Schema(description = "노드 키워드", example = "고기 요리")
        String keyword,

        @Schema(description = "노드 메모", example = "")
        String memo,

        @Schema(description = "AI 분석 상태", example = "PENDING", allowableValues = {"PENDING", "PROCESSING", "DONE", "FAILED"})
        String analysisStatus,

        @Schema(description = "메시지", example = "마인드맵이 생성되었습니다. AI 분석이 진행 중입니다.")
        String message
) {
}
