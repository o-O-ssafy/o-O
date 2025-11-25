package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

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
     * @param nodeInfo  ADD 이벤트에서 만든 Map<String, Object>
     *                  (workspaceId, clientKey, nodeId, parentId, ... 포함)
     */
    public void sendNodeCreatedSync(Map<String, Object> nodeInfo) {
        try {
            // 🔥 혹시 operation 안 넣었으면 기본으로 ADD 세팅
            nodeInfo.putIfAbsent("operation", "ADD");

            Object workspaceIdObj = nodeInfo.get("workspaceId");
            if (workspaceIdObj == null) {
                log.warn("[NodeSyncProducer] Missing workspaceId in nodeInfo: {}", nodeInfo);
                return;
            }

            String workspaceKey = String.valueOf(workspaceIdObj);

            String json = objectMapper.writeValueAsString(nodeInfo);

            kafkaTemplate.send(nodeSyncTopic, workspaceKey, json);

            log.info("[NodeSyncProducer] Sent node sync event: {}", json);
        } catch (Exception e) {
            log.error("[NodeSyncProducer] Failed to send node sync event", e);
        }
    }
}
