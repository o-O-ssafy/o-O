package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NodeRestructureProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.node-restructure:mindmap.restructure.update}")
    private String topic;

    private void sendPayload(Long workspaceId, Map<String, Object> payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(topic, workspaceId.toString(), json);
            log.info("[Restructure] Sent payload: workspaceId={}, eventType={}",
                    workspaceId, payload.get("eventType"));
        } catch (Exception e) {
            log.error("[Restructure] Failed to send message", e);
        }
    }

    /** 1) 정리 시작: lock 걸기 */
    public void sendLock(Long workspaceId) {
        sendPayload(workspaceId, Map.of(
                "workspaceId", workspaceId,
                "eventType", "LOCK"
        ));
    }

    /** 2) 정리 결과 적용: 노드 전체 + unlock */
    public void sendApply(Long workspaceId, List<MindmapNode> nodes) {
        sendPayload(workspaceId, Map.of(
                "workspaceId", workspaceId,
                "eventType", "APPLY",
                "nodes", nodes
        ));
    }

    public void sendFail(Long workspaceId, String reason) {
        // 필요하면 reason 너무 길면 잘라서 보내도 됨
        sendPayload(workspaceId, Map.of(
                "workspaceId", workspaceId,
                "eventType", "FAIL",
                "reason", reason
        ));
    }
}


