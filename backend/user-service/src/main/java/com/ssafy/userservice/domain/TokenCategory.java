package com.ssafy.userservice.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TokenCategory {
    ACCESS("access"),
    REFRESH("refresh"),
    WEBSOCKET("websocket");

    private final String value;
}
