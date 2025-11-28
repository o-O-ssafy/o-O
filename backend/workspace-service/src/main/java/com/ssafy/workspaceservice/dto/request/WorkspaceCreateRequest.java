package com.ssafy.workspaceservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record WorkspaceCreateRequest(
        @Schema(description = "워크스페이스 제목 (트렌드 복제 시 루트 키워드)", example = "애플리케이션")
        String title,

        @Schema(description = "워크스페이스 타입", example = "PERSONAL", allowableValues = {"PERSONAL", "TEAM"})
        String type,

        @Schema(description = "공개 여부", example = "PRIVATE", allowableValues = {"PUBLIC", "PRIVATE"})
        String visibility,

        @Schema(description = "복제된 키워드 목록 (트렌드 복제 시)", example = "[\"모바일\", \"웹\", \"API\"]")
        List<String> keywords
) {
    /**
     * startPrompt 생성
     * title이 있으면 그대로 사용
     * 일반 생성 시: null
     */
    public String toStartPrompt() {
        return title;
    }
}
