package com.ssafy.userservice.dto;

import com.ssafy.userservice.domain.ProfileImage;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "사용자 정보 수정 요청")
public record UserUpdateRequest(
        @Schema(description = "사용자 닉네임", example = "새닉네임")
        String nickname,

        @Schema(description = "프로필 이미지 (popo1, popo2, popo3, popo4 중 선택)", example = "popo1", allowableValues = {"popo1", "popo2", "popo3", "popo4"})
        ProfileImage profileImage
) {
}
