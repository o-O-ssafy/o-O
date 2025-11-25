package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NodeSyncProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.node-sync-events}")
    private String nodeSyncTopic;

    /**
     * 도메인 nodeId가 확정된 뒤, Node.js(Y.Doc) 쪽으로 동기화 이벤트 전송
     *
     * @param clientKey  Y.Doc에서 쓰던 id (프론트 임시 키, event.get("id"))
     * @param node       DB에 저장된 MindmapNode 엔티티
     */
    public void sendNodeCreatedSync(String clientKey, MindmapNode node) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("operation", "ADD");
            payload.put("workspaceId", node.getWorkspaceId());
            payload.put("clientKey", clientKey);     // 🔥 Y.Doc key
            payload.put("nodeId", node.getNodeId()); // 🔥 확정된 도메인 nodeId
            payload.put("parentId", node.getParentId());
            payload.put("keyword", node.getKeyword());
            payload.put("memo", node.getMemo());
            payload.put("x", node.getX());
            payload.put("y", node.getY());
            payload.put("color", node.getColor());
            payload.put("analysisStatus", node.getAnalysisStatus().name());
            payload.put("createdAt", node.getCreatedAt().toString());
            payload.put("updatedAt", node.getUpdatedAt().toString());

            String json = objectMapper.writeValueAsString(payload);

            kafkaTemplate.send(nodeSyncTopic,
                    String.valueOf(node.getWorkspaceId()), json);

            log.info("[NodeSyncProducer] Sent node sync event: {}", json);
        } catch (Exception e) {
            log.error("[NodeSyncProducer] Failed to send node sync event", e);
        }
    }
}
