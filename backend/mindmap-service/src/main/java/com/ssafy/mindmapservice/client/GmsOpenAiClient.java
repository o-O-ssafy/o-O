package com.ssafy.mindmapservice.client;


import com.ssafy.mindmapservice.config.GmsOpenAiFeignConfig;
import com.ssafy.mindmapservice.dto.request.ChatCompletionRequest;
import com.ssafy.mindmapservice.dto.response.ChatCompletionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "gmsOpenAiClient",
        url = "${gms.base-url}",    // https://gms.ssafy.io/gmsapi
        configuration = GmsOpenAiFeignConfig.class
)
public interface GmsOpenAiClient {

    @PostMapping("/api.openai.com/v1/chat/completions")
    ChatCompletionResponse createChatCompletion(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ChatCompletionRequest request
    );
}