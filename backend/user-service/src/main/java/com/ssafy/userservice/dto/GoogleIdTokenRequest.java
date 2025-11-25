package com.ssafy.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "구글 ID 토큰 로그인 요청 (모바일 앱 전용)")
public record GoogleIdTokenRequest(
        @Schema(description = "Google ID Token", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...")
        @NotBlank(message = "ID token is required")
        String idToken,

        @Schema(description = "플랫폼 타입", example = "anroid", allowableValues = {"web", "android", "ios"})
        @NotBlank(message = "Platform is required")
        String platform
) {
}
