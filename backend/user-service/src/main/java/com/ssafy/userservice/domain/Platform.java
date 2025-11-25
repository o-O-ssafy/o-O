package com.ssafy.userservice.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Platform {
    WEB("web"),
    ANDROID("android"),
    IOS("ios");

    private final String value;

    public static Platform fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Platform cannot be null or blank");
        }

        for (Platform platform : Platform.values()) {
            if (platform.value.equalsIgnoreCase(value)) {
                return platform;
            }
        }

        throw new IllegalArgumentException("Invalid platform: " + value + ". Allowed values: web, android, ios");
    }
}
