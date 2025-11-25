package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.service.SequenceGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NodeEventConsumer {

    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;
    private final SequenceGeneratorService sequenceGeneratorService;

    @KafkaListener(topics = "${kafka.topics.node-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeNodeEvents(String message) {
        try {
            log.debug("Received Kafka message: {}", message);

            List<Map<String, Object>> events = objectMapper.readValue(message, List.class);
            log.info("Processing {} node events", events.size());

            BulkOperations bulkOps = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, MindmapNode.class);

            for (Map<String, Object> event : events) {
                String operation = (String) event.get("operation");

                Object workspaceIdObj = event.get("workspaceId");
                Long workspaceId = getLong(workspaceIdObj);

                switch (operation) {
                    case "ADD": {
                        Object nodeIdObj = event.get("nodeId");
                        Long nodeId = getLongOrNull(nodeIdObj); // null 허용 버전

                        if (nodeId == null) {
                            // 🔥 여기서 시퀀스로 새로운 nodeId 생성
                            nodeId = sequenceGeneratorService.generateNextNodeId(workspaceId);
                            log.debug("Generated nodeId {} for ADD without nodeId. workspaceId={}", nodeId, workspaceId);
                        }

                        Object parentIdObj = event.get("parentId");
                        Long parentId = safeGetLongOrNull(parentIdObj, "parentId", workspaceId);

                        LocalDateTime now = LocalDateTime.now();

                        Query addQuery = new Query(
                                Criteria.where("workspaceId").is(workspaceId)
                                        .and("nodeId").is(nodeId)
                        );

                        Update addUpdate = new Update()
                                .set("parentId", parentId)
                                .set("type", event.get("type"))
                                .set("keyword", event.get("keyword"))
                                .set("memo", event.get("memo"))
                                .set("x", getDouble(event.get("x")))
                                .set("y", getDouble(event.get("y")))
                                .set("color", event.get("color"))
                                .set("analysisStatus", MindmapNode.AnalysisStatus.NONE)
                                .set("updatedAt", now)
                                .setOnInsert("workspaceId", workspaceId)
                                .setOnInsert("nodeId", nodeId)
                                .setOnInsert("createdAt", now);

                        bulkOps.upsert(addQuery, addUpdate);
                        break;
                    }



                    case "UPDATE": {
                        Object nodeIdObj = event.get("nodeId");
                        Long nodeId = getLong(nodeIdObj);  // ✅ UPDATE에서만

                        Query query = new Query(Criteria.where("nodeId").is(nodeId)
                                .and("workspaceId").is(workspaceId));
                        Update update = new Update();

                        if (event.containsKey("keyword")) {
                            update.set("keyword", event.get("keyword"));
                        }
                        if (event.containsKey("memo")) {
                            update.set("memo", event.get("memo"));
                        }
                        if (event.containsKey("x")) {
                            update.set("x", getDouble(event.get("x")));
                        }
                        if (event.containsKey("y")) {
                            update.set("y", getDouble(event.get("y")));
                        }
                        if (event.containsKey("color")) {
                            update.set("color", event.get("color"));
                        }
                        if (event.containsKey("parentId")) {
                            Object updateParentIdObj = event.get("parentId");
                            Long updateParentId = safeGetLongOrNull(updateParentIdObj, "parentId", workspaceId);
                            update.set("parentId", updateParentId);
                        }
                        if (event.containsKey("contentUrl")) {
                            update.set("contentUrl", event.get("contentUrl"));
                        }

                        update.set("updatedAt", LocalDateTime.now());
                        bulkOps.updateOne(query, update);
                        break;
                    }

                    case "DELETE": {
                        Object nodeIdObj = event.get("nodeId");
                        Long nodeId = getLong(nodeIdObj);  // ✅ DELETE에서도 숫자만 허용

                        Query deleteQuery = new Query(Criteria.where("nodeId").is(nodeId)
                                .and("workspaceId").is(workspaceId));
                        bulkOps.remove(deleteQuery);
                        break;
                    }

                    default:
                        log.warn("Unknown operation: {}", operation);
                }
            }

            bulkOps.execute();
            log.info("Successfully processed {} node events", events.size());

        } catch (Exception e) {
            log.error("Failed to process Kafka message", e);
        }
    }


    private Double getDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof String) return Double.parseDouble((String) value);
        return null;
    }

    private Long getLong(Object value) {
        if (value == null) return null;

        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof String) return Long.parseLong((String) value);

        throw new IllegalArgumentException(
                "Cannot convert value to Long: " + value + " (" + value.getClass() + ")"
        );
    }

    private Long safeGetLongOrNull(Object value, String fieldName, Long workspaceId) {
        if (value == null) return null;

        try {
            return getLong(value);
        } catch (NumberFormatException ex) {
            log.warn("Non-numeric {} value in Kafka event. workspaceId={}, value={}",
                    fieldName, workspaceId, value);
            return null; // Mongo _id 같은 거 날아오면 그냥 null로 저장
        }
    }

    private Long getLongOrNull(Object value) {
        if (value == null) return null;

        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof String) return Long.parseLong((String) value);

        // 이상한 타입이면 그냥 예외 던져서 상위 try-catch에서 잡게
        throw new IllegalArgumentException(
                "Cannot convert value to Long: " + value + " (" + value.getClass() + ")"
        );
    }



}
