package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.response.CreatedNodeInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class NodeUpdateProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.node-update}")
    private String nodeUpdateTopic;

    public void sendNodeUpdate(Long workspaceId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("workspaceId", workspaceId);
            message.put("message", "노드 분석 후 업데이트를 완료했습니다.");

            String jsonMessage = objectMapper.writeValueAsString(message);

            kafkaTemplate.send(nodeUpdateTopic, workspaceId.toString(), jsonMessage);
            log.info("Sent node update to Kafka: workspaceId={}, message={}", workspaceId, message.get("message"));

        } catch (Exception e) {
            log.error("Failed to send node update to Kafka", e);
        }
    }

    /**
     * 생성된 노드 전체 정보와 함께 업데이트 알림 전송
     * 아이디어 추가 등에서 사용
     *
     * @param workspaceId 워크스페이스 ID
     * @param createdNodes 생성된 노드 엔티티 리스트
     */
    public void sendNodeUpdateWithNodes(Long workspaceId, List<MindmapNode> createdNodes) {
        try {
            // MindmapNode 엔티티를 DTO로 변환
            List<CreatedNodeInfo> nodeInfos = createdNodes.stream()
                    .map(CreatedNodeInfo::from)
                    .collect(Collectors.toList());

            Map<String, Object> message = new HashMap<>();
            message.put("workspaceId", workspaceId);
            message.put("message", "새로운 노드가 추가되었습니다.");
            message.put("nodes", nodeInfos);  // 전체 노드 정보
            message.put("nodeCount", nodeInfos.size());

            String jsonMessage = objectMapper.writeValueAsString(message);

            kafkaTemplate.send(nodeUpdateTopic, workspaceId.toString(), jsonMessage);
            log.info("Sent node update with {} created nodes to Kafka: workspaceId={}",
                    nodeInfos.size(), workspaceId);

        } catch (Exception e) {
            log.error("Failed to send node update with nodes to Kafka", e);
        }
    }
}
