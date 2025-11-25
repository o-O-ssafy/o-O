package com.ssafy.mindmapservice.dto.kafka;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * AI가 반환하는 개별 노드 정보
 * INITIAL: tempId, parentId, keyword, memo 모두 포함
 * CONTEXTUAL: keyword, memo만 포함 (tempId, parentId는 null)
 */
@Schema(description = "AI 생성 노드 DTO")
public record AiNodeResult(

        @Schema(description = "임시 ID (INITIAL 전용, 예: 'temp-1')", example = "temp-1", nullable = true)
        String tempId,

        @Schema(description = "부모 노드 ID (INITIAL 전용, 숫자 문자열 또는 tempId)", example = "1", nullable = true)
        String parentId,

        @Schema(description = "노드 키워드", example = "소고기 요리")
        String keyword,

        @Schema(description = "노드 메모 (키워드 설명)", example = "고급 레스토랑 중심의 메뉴 아이디어")
        String memo
) {}
