package com.ssafy.mindmapservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 기존 워크스페이스에 아이디어 추가 요청 DTO
 */
@Schema(description = "기존 워크스페이스에 아이디어 추가 요청")
public record AddIdeaRequest(
        @Schema(description = "사용자가 입력한 아이디어 텍스트", example = "삼겹살 맛집 추천 앱을 만들고 싶어", required = true)
        String idea
) {
    public AddIdeaRequest {
        if (idea == null || idea.isBlank()) {
            throw new IllegalArgumentException("아이디어는 비어 있을 수 없습니다.");
        }
    }
}
