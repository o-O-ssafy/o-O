package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.client.TrendServiceClient;
import com.ssafy.mindmapservice.client.WorkspaceServiceClient;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.kafka.AiAnalysisResult;
import com.ssafy.mindmapservice.dto.kafka.AiContextualSuggestion;
import com.ssafy.mindmapservice.dto.kafka.AiSuggestionNode;
import com.ssafy.mindmapservice.dto.response.AiTrendSuggestionResponse;
import com.ssafy.mindmapservice.dto.response.TrendResponse;
import com.ssafy.mindmapservice.repository.NodeRepository;
import com.ssafy.mindmapservice.service.NodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiAnalysisConsumer {

    private final NodeRepository nodeRepository;
    private final NodeUpdateProducer nodeUpdateProducer;
    private final NodeService nodeService;
    private final ObjectMapper objectMapper;
    private final WorkspaceServiceClient workspaceServiceClient;
    private final AiSuggestionProducer aiSuggestionProducer;
    private final TrendServiceClient trendServiceClient;

    /**
     * AI 서버로부터 분석 결과를 받아서 처리합니다.
     * INITIAL: aiSummary를 원본 노드의 memo에 업데이트하고, 계층 구조 노드 생성
     * CONTEXTUAL: 부모 노드 아래에 3개의 자식 노드 생성
     *
     * 1. AI가 생성한 노드들을 MongoDB에 저장
     * 2. 원본 노드의 분석 상태를 DONE으로 변경
     * 3. mindmap.node.update 토픽으로 변경사항 발행 (y.js 서버 → 웹소켓 클라이언트)
     */
    @KafkaListener(topics = "${kafka.topics.ai-analysis-result}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeAnalysisResult(String message) {
        try {
            log.info("🎯 [KAFKA RECEIVED] AI analysis result received from topic 'ai-analysis-result'");
            log.debug("📨 Raw message: {}", message);

            AiAnalysisResult result = objectMapper.readValue(message, AiAnalysisResult.class);

            // 분석 타입 판별: aiSummary가 있으면 INITIAL, nodeId가 있으면 CONTEXTUAL
            boolean isInitial = result.aiSummary() != null;
            String analysisType = isInitial ? "INITIAL" : "CONTEXTUAL";

            log.info("📊 [PARSED RESULT] workspaceId={}, analysisType={}, status={}, title={}, aiSummary={}, nodeCount={}",
                    result.workspaceId(), analysisType, result.status(),
                    result.title(), result.aiSummary() != null ? "present" : "null",
                    result.nodes() != null ? result.nodes().size() : 0);

            // 원본 노드 ID 결정
            Long originalNodeId;
            if (isInitial) {
                // INITIAL: nodes[0]의 parentId가 원본 노드 ID
                if (result.nodes() == null || result.nodes().isEmpty()) {
                    log.error("INITIAL analysis result has no nodes: workspaceId={}", result.workspaceId());
                    return;
                }
                try {
                    originalNodeId = Long.parseLong(result.nodes().getFirst().parentId());
                } catch (NumberFormatException e) {
                    log.error("Failed to parse parentId as nodeId in INITIAL result: {}", result.nodes().getFirst().parentId());
                    return;
                }
            } else {
                // CONTEXTUAL: result.nodeId 사용
                originalNodeId = result.nodeId();
            }

            // 1. 상태 확인
            if (!"SUCCESS".equals(result.status())) {
                log.error("AI analysis failed: workspaceId={}, nodeId={}, status={}, type={}",
                        result.workspaceId(), originalNodeId, result.status(), analysisType);
                updateNodeAnalysisStatus(result.workspaceId(), originalNodeId,
                        MindmapNode.AnalysisStatus.FAILED);
                return;
            }

            // 2. INITIAL인 경우 원본 노드의 memo에 aiSummary 업데이트 및 워크스페이스 title 업데이트
            if (isInitial) {
                updateNodeMemo(result.workspaceId(), originalNodeId, result.aiSummary(), result.keyword());
                log.info("Updated original node memo with AI summary: workspaceId={}, nodeId={}",
                        result.workspaceId(), originalNodeId);

                // 워크스페이스 title 업데이트 (내부 API 사용 - userId 불필요)
                if (result.title() != null && !result.title().isBlank()) {
                    workspaceServiceClient.updateWorkspaceTitleInternal(result.workspaceId(), result.title());
                    log.info("Updated workspace title: workspaceId={}, title={}",
                            result.workspaceId(), result.title());
                }
            }

// 3. AI가 생성한 노드들 처리
            if (result.nodes() != null && !result.nodes().isEmpty()) {
                log.info("🔥 [AI Node Creation START] workspaceId={}, originalNodeId={}, analysisType={}, nodeCount={}",
                        result.workspaceId(), originalNodeId, analysisType, result.nodes().size());

                for (int i = 0; i < result.nodes().size(); i++) {
                    var aiNode = result.nodes().get(i);
                    log.info("  📝 AI Node #{}: tempId={}, parentId={}, keyword={}, memo={}",
                            i + 1, aiNode.tempId(), aiNode.parentId(), aiNode.keyword(),
                            aiNode.memo() != null ? aiNode.memo().substring(0, Math.min(50, aiNode.memo().length())) + "..." : "null");
                }

                if (isInitial) {
                    // ✅ INITIAL: 실제 노드 생성 + MongoDB 저장
                    List<MindmapNode> createdNodes = nodeService.createNodesFromAiResult(
                            result.workspaceId(),
                            result.nodes(),
                            originalNodeId,
                            analysisType
                    );

                    log.info("✅ [AI Node Creation SUCCESS] Created {} nodes from AI result: workspaceId={}, type={}",
                            createdNodes.size(), result.workspaceId(), analysisType);

                    for (MindmapNode node : createdNodes) {
                        log.info("  ✨ Created Node: nodeId={}, parentId={}, keyword={}, type={}, x={}, y={}",
                                node.getNodeId(), node.getParentId(), node.getKeyword(),
                                node.getType(), node.getX(), node.getY());
                    }

                } else {
                    // ✅ CONTEXTUAL: MongoDB 저장 없음. AI + 트렌드 합쳐서 보내기
                    log.info("🧪 [CONTEXTUAL RESULT] Skip MongoDB node creation. Sending AI + Trend suggestions only.");

                    // 1) AI 추천 리스트
                    var aiNodes = result.nodes().stream()
                            .map(n -> new AiSuggestionNode(
                                    n.tempId(),
                                    parseLongSafe(n.parentId()),
                                    n.keyword(),
                                    n.memo()
                            ))
                            .toList();

                    // 2) TrendService 호출
                    //    기준 키워드는 "확장한 노드의 keyword" 사용하는 게 자연스럽다
                    MindmapNode baseNode = nodeRepository.findByWorkspaceIdAndNodeId(
                            result.workspaceId(), originalNodeId
                    ).orElseThrow(() -> new IllegalArgumentException(
                            "Base node not found: workspaceId=" + result.workspaceId() + ", nodeId=" + originalNodeId));

                    String parentKeyword = baseNode.getKeyword();

                    TrendResponse trend = trendServiceClient.getParentTrend(
                            parentKeyword, // 부모 키워드
                            "7d",          // 집계 기간
                            3              // 상위 3개만
                    );

                    // 3) 최종 WebSocket 전송 payload (AI 리스트 + Trend 리스트)
                    AiTrendSuggestionResponse merged = AiTrendSuggestionResponse.builder()
                            .workspaceId(result.workspaceId())
                            .targetNodeId(originalNodeId)
                            .aiList(aiNodes)
                            .trendList(trend.getItems()) // TrendItem 그대로
                            .build();

                    // 4) Node.js로 브로드캐스트 (Kafka 통해)
                    aiSuggestionProducer.sendContextualSuggestion(merged);
                }
            } else {
                log.warn("⚠️ [NO NODES] AI result has no nodes to create: workspaceId={}, nodes={}",
                        result.workspaceId(), result.nodes());
            }



            // 5. 원본 노드의 분석 상태를 DONE으로 변경
            updateNodeAnalysisStatus(result.workspaceId(), originalNodeId,
                    MindmapNode.AnalysisStatus.DONE);

            log.info("Successfully processed AI analysis result: workspaceId={}, nodeId={}, type={}",
                    result.workspaceId(), originalNodeId, analysisType);

            nodeUpdateProducer.sendNodeUpdate(result.workspaceId());
            log.info("✅ [Kafka Topic Send Success: mindmap.node.update]");

        } catch (Exception e) {
            log.error("Failed to process AI analysis result", e);
        }
    }

    /**
     * 노드의 memo를 AI Summary로 업데이트합니다 (INITIAL 분석 전용)
     */
    private void updateNodeMemo(Long workspaceId, Long nodeId, String aiSummary, String keyword) {
        try {
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Node not found: workspaceId=" + workspaceId + ", nodeId=" + nodeId));

            node.setMemo(aiSummary);
            node.setUpdatedAt(LocalDateTime.now());

            if(node.getType().equals("text")) {
                node.setKeyword(keyword);
            }

            nodeRepository.save(node);

        } catch (Exception e) {
            log.error("Failed to update node memo: workspaceId={}, nodeId={}",
                    workspaceId, nodeId, e);
        }
    }

    /**
     * 노드의 분석 상태를 업데이트합니다.
     */
    private void updateNodeAnalysisStatus(Long workspaceId, Long nodeId,
                                          MindmapNode.AnalysisStatus status) {
        try {
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Node not found: workspaceId=" + workspaceId + ", nodeId=" + nodeId));

            node.setAnalysisStatus(status);
            node.setUpdatedAt(LocalDateTime.now());
            nodeRepository.save(node);

            log.debug("Updated node analysis status: workspaceId={}, nodeId={}, status={}",
                    workspaceId, nodeId, status);

        } catch (Exception e) {
            log.error("Failed to update node analysis status: workspaceId={}, nodeId={}, status={}",
                    workspaceId, nodeId, status, e);
        }
    }

    private Long parseLongSafe(String value) {
        try {
            return value != null ? Long.parseLong(value) : null;
        } catch (NumberFormatException e) {
            log.warn("Failed to parse long from value='{}'", value);
            return null;
        }
    }

}
