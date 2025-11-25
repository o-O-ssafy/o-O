package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.dto.request.AiAnalysisRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiAnalysisProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.ai-analysis-request}")
    private String aiRequestTopic;

    /**
     * AI 서버로 분석 요청을 전송합니다.
     * @param request AI 분석 요청 정보
     */
    public void sendAnalysisRequest(AiAnalysisRequest request) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(request);

            // workspaceId를 키로 사용하여 같은 워크스페이스는 같은 파티션으로
            kafkaTemplate.send(aiRequestTopic, request.workspaceId().toString(), jsonMessage);

            log.info("Sent AI analysis request to Kafka: workspaceId={}, nodeId={}, contentType={}",
                    request.workspaceId(), request.nodeId(), request.contentType());

        } catch (Exception e) {
            log.error("Failed to send AI analysis request to Kafka", e);
            throw new RuntimeException("AI 분석 요청 전송 실패", e);
        }
    }
}
