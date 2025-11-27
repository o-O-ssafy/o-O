package com.ssafy.workspaceservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record WorkspaceThemeChangeRequest(
        @Schema(description = "변경할 테마", example = "PASTEL")
        String theme
) {
}
