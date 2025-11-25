package com.ssafy.userservice.dto;

import com.ssafy.userservice.domain.User;
import com.ssafy.userservice.domain.ProfileImage;

public record UserProfileDto(
        Long id,
        String profileImage   // "popo1", "popo2" ...
) {
    public static UserProfileDto from(User user) {
        ProfileImage img = user.getProfileImage();

        return new UserProfileDto(
                user.getId(),
                img != null ? img.getValue() : null   // enum → "popo1" 같은 문자열
        );
    }
}