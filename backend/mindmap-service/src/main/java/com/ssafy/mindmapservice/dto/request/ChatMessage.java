package com.ssafy.mindmapservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String role;    // "user" / "system" / "assistant" / "developer"
    private String content;
}