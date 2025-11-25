package com.ssafy.userservice.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProfileImage {
    POPO1("popo1"),
    POPO2("popo2"),
    POPO3("popo3"),
    POPO4("popo4");

    private final String value;

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProfileImage fromString(String value) {
        if (value == null) {
            return null;
        }

        for (ProfileImage profileImage : ProfileImage.values()) {
            if (profileImage.value.equalsIgnoreCase(value)) {
                return profileImage;
            }
        }

        throw new IllegalArgumentException("Invalid profile image: " + value + ". Available options: popo1, popo2, popo3, popo4");
    }

    @Override
    public String toString() {
        return value;
    }
}