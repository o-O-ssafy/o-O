package com.ssafy.mindmapservice.dto.kafka;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * CONTEXTUAL 분석 요청 시 조상 노드 정보를 전달하기 위한 DTO
 * AI 서버에 문맥 정보를 제공하여 맥락 기반 노드 확장을 지원합니다.
 */
@Schema(description = "노드 컨텍스트 DTO (CONTEXTUAL 분석용, 조상 노드 정보)")
public record NodeContextDto(

        @Schema(description = "노드 ID", example = "15", required = true)
        Long nodeId,

        @Schema(description = "부모 노드 ID (루트 노드인 경우 null)", example = "4", nullable = true)
        Long parentId,

        @Schema(description = "노드 키워드", example = "고기", required = true)
        String keyword,

        @Schema(description = "노드 메모", example = "고기 종류", required = true)
        String memo
) {
}
