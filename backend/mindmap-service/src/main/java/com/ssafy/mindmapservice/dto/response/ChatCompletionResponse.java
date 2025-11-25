package com.ssafy.mindmapservice.dto.response;

import com.ssafy.mindmapservice.dto.request.ChatMessage;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ChatCompletionResponse {

    @Getter
    @NoArgsConstructor
    public static class Choice {
        private int index;
        private ChatMessage message;
        // finish_reason 등 필요하면 추가
    }

    private String id;
    private String model;
    private List<Choice> choices;
}