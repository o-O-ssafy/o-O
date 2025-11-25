package com.ssafy.userservice.dto;

import com.ssafy.userservice.domain.ProfileImage;
import com.ssafy.userservice.domain.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "사용자 정보 응답")
public record UserResponse(
        @Schema(description = "이메일", example = "user@example.com")
        String email,

        @Schema(description = "닉네임", example = "홍길동")
        String nickname,

        @Schema(description = "프로필 이미지", example = "popo1")
        String profileImage
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage() != null ? user.getProfileImage().getValue() : null
        );
    }
}
