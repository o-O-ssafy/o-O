package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.dto.kafka.AiContextualSuggestion;
import com.ssafy.mindmapservice.dto.response.AiTrendSuggestionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiSuggestionProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.ai-suggestion}")
    private String aiSuggestionTopic;

    /**
     * CONTEXTUAL 분석 결과를 프론트용 추천 이벤트로 전송합니다.
     * - MongoDB에는 새 노드를 만들지 않고
     * - WebSocket 서버가 이 토픽을 구독해서 클라이언트에 뿌리도록 사용
     */
    public void sendContextualSuggestion(AiTrendSuggestionResponse payload) {
        try {
            String message = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(aiSuggestionTopic, payload.getWorkspaceId().toString(), message);

            log.info("AI + Trend suggestion sent: workspaceId={}, targetNodeId={}",
                    payload.getWorkspaceId(), payload.getTargetNodeId());
        } catch (Exception e) {
            log.error("Failed to send AI+Trend suggestion", e);
        }
    }

}
