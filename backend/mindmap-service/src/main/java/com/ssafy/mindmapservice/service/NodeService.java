package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.WorkspaceServiceClientAdapter;
import com.ssafy.mindmapservice.domain.InitialColor;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.request.AiAnalysisRequest;
import com.ssafy.mindmapservice.dto.kafka.AiNodeResult;
import com.ssafy.mindmapservice.dto.request.InitialMindmapRequest;
import com.ssafy.mindmapservice.dto.request.NodePositionUpdateRequest;
import com.ssafy.mindmapservice.dto.response.InitialMindmapResponse;
import com.ssafy.mindmapservice.dto.kafka.NodeContextDto;
import com.ssafy.mindmapservice.dto.response.NodeSimpleResponse;
import com.ssafy.mindmapservice.dto.response.NodeResponse;
import com.ssafy.mindmapservice.dto.request.ImageNodeCreateRequest;
import com.ssafy.mindmapservice.kafka.AiAnalysisProducer;
import com.ssafy.mindmapservice.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final WorkspaceServiceClientAdapter workspaceServiceClientAdapter;
    private final AiAnalysisProducer aiAnalysisProducer;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final TrendEventPublisher trendEventPublisher;
    private final PublicIndexSyncService publicIndexSyncService;
    private final ImageService imageService;

    public List<MindmapNode> getNodesByWorkspace(Long workspaceId) {
        log.info("Getting all nodes for workspace: {}", workspaceId);
        return nodeRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * 워크스페이스의 모든 노드를 조회하고, image 타입 노드의 경우 presigned URL로 변환합니다.
     * - image 타입: keyword (S3 key) → presigned URL로 변환
     * - video 타입: keyword (유튜브 링크) 그대로 사용
     * - text 타입: keyword (텍스트) 그대로 사용
     *
     * @param workspaceId 워크스페이스 ID
     * @return 노드 응답 리스트 (image 타입은 presigned URL 포함)
     */
    public List<NodeResponse> getNodesWithPresignedUrls(Long workspaceId) {
        log.info("Getting all nodes with presigned URLs for workspace: {}", workspaceId);
        List<MindmapNode> nodes = nodeRepository.findByWorkspaceId(workspaceId);

        return nodes.stream()
                .map(node -> {
                    String resolvedKeyword = node.getKeyword();

                    // image 타입인 경우 S3 key를 presigned URL로 변환
                    if ("image".equals(node.getType()) && node.getKeyword() != null && !node.getKeyword().isBlank()) {
                        try {
                            resolvedKeyword = imageService.generateImagePresignedUrl(
                                    node.getKeyword(),
                                    Duration.ofHours(1)
                            );
                            log.debug("Generated presigned URL for image node: nodeId={}", node.getNodeId());
                        } catch (Exception e) {
                            log.error("Failed to generate presigned URL for nodeId={}", node.getNodeId(), e);
                        }
                    }

                    return NodeResponse.from(node, resolvedKeyword);
                })
                .toList();
    }

    /**
     * 워크스페이스의 노드 간단 정보 조회 (nodeId, keyword만 포함)
     * 캘린더 등에서 경량화된 응답이 필요할 때 사용
     */
    public List<NodeSimpleResponse> getSimpleNodesByWorkspace(Long workspaceId) {
        log.debug("Getting simple nodes for workspace: {}", workspaceId);
        List<MindmapNode> nodes = nodeRepository.findByWorkspaceId(workspaceId);
        return nodes.stream()
                .map(NodeSimpleResponse::from)
                .toList();
    }

    /**
     * 여러 워크스페이스의 모든 키워드를 일괄 조회 (평면 리스트)
     * workspace-service의 캘린더 기능에서 사용
     */
    public List<String> getKeywordsByWorkspaces(List<Long> workspaceIds) {
        log.debug("Getting keywords for {} workspaces", workspaceIds.size());

        if (workspaceIds.isEmpty()) {
            return List.of();
        }

        List<MindmapNode> nodes = nodeRepository.findByWorkspaceIdIn(workspaceIds);

        // type이 "text"인 노드의 키워드만 추출 (null이 아닌 것만)
        return nodes.stream()
                .filter(node -> "text".equals(node.getType()))
                .map(MindmapNode::getKeyword)
                .filter(Objects::nonNull)
                .filter(keyword -> !keyword.isBlank())
                .toList();
    }

    /**
     * 여러 워크스페이스에 노드가 존재하는지 일괄 확인
     * workspace-service의 캘린더 기능에서 사용 (노드가 없는 워크스페이스 필터링용)
     *
     * @param workspaceIds 확인할 워크스페이스 ID 목록
     * @return 노드가 하나라도 존재하는 워크스페이스 ID 목록
     */
    public List<Long> getWorkspaceIdsWithNodes(List<Long> workspaceIds) {
        log.debug("Checking node existence for {} workspaces", workspaceIds.size());

        if (workspaceIds.isEmpty()) {
            return List.of();
        }

        // 각 워크스페이스별로 노드 존재 여부를 확인
        List<MindmapNode> nodes = nodeRepository.findByWorkspaceIdIn(workspaceIds);

        // 노드가 있는 워크스페이스 ID만 중복 제거하여 반환
        List<Long> result = nodes.stream()
                .map(MindmapNode::getWorkspaceId)
                .distinct()
                .toList();

        log.debug("Found {} workspaces with nodes out of {}", result.size(), workspaceIds.size());
        return result;
    }

    public MindmapNode getNode(Long workspaceId, Long nodeId) {
        log.debug("Getting node: workspaceId={}, nodeId={}", workspaceId, nodeId);
        return nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));
    }

    public MindmapNode createNode(MindmapNode node) {
        log.info("Creating node: workspaceId={}", node.getWorkspaceId());

        // 1) nodeId 자동 생성 (워크스페이스별로 1부터 증가)
        Long workspaceId = node.getWorkspaceId();
        Long nextNodeId = sequenceGeneratorService.generateNextNodeId(workspaceId);
        node.setNodeId(nextNodeId);

        node.setCreatedAt(LocalDateTime.now());
        node.setUpdatedAt(LocalDateTime.now());

        if (node.getAnalysisStatus() == null) {
            node.setAnalysisStatus(MindmapNode.AnalysisStatus.NONE);
        }

        MindmapNode saved = nodeRepository.save(node);

        log.info("Created node with auto-generated nodeId: workspaceId={}, nodeId={}",
                saved.getWorkspaceId(), saved.getNodeId());

        // 2) 여기서 한 번만 PUBLIC 여부 조회
        boolean isPublic = workspaceServiceClientAdapter.isPublic(workspaceId);

        // 3) 트렌드 집계 이벤트 발행 (PUBLIC인 경우에만)
        try {
            String childKeyword = saved.getKeyword();

            // 부모 키워드 계산
            String parentKeyword;
            if (saved.getParentId() == null) {
                parentKeyword = "__root__";
            } else {
                MindmapNode parent = nodeRepository
                        .findByWorkspaceIdAndNodeId(workspaceId, saved.getParentId())
                        .orElse(null);

                if (parent != null) {
                    parentKeyword = parent.getKeyword();
                } else {
                    parentKeyword = "__root__";
                }
            }

            trendEventPublisher.publishRelationAdd(workspaceId, parentKeyword, childKeyword, isPublic);
            log.debug("Published trend relation add event: ws={}, parent={}, child={}, isPublic={}",
                    workspaceId, parentKeyword, childKeyword, isPublic);

        } catch (Exception e) {
            log.error("Failed to publish trend relation add event for nodeId={}", saved.getNodeId(), e);
        }

        // 4) ES 인덱싱 (PUBLIC일 때만)
        publicIndexSyncService.indexNodeIfWorkspacePublic(saved, isPublic);

        return saved;
    }

    /**
     * 이미지 파일을 업로드하고 이미지 노드를 생성합니다.
     * 1. S3에 이미지 파일 업로드
     * 2. S3 key를 keyword에 저장하여 노드 생성
     *
     * @param workspaceId 워크스페이스 ID
     * @param file 업로드할 이미지 파일
     * @param request 노드 생성 정보 (parentId, memo, x, y, color)
     * @return 생성된 이미지 노드
     */
    public MindmapNode createImageNode(Long workspaceId, MultipartFile file, ImageNodeCreateRequest request) {
        log.info("Creating image node: workspaceId={}, fileName={}", workspaceId, file.getOriginalFilename());

        // 1. 이미지 S3 업로드
        String imageKey = imageService.uploadImage(file);
        log.debug("Image uploaded to S3: key={}", imageKey);

        // 2. 이미지 노드 생성
        MindmapNode node = MindmapNode.builder()
                .workspaceId(workspaceId)
                .parentId(request.parentId())
                .type("image")
                .keyword(imageKey)  // S3 key 저장
                .memo(request.memo())
                .x(request.x())
                .y(request.y())
                .color(request.color())
                .build();

        MindmapNode created = createNode(node);
        log.info("Image node created: workspaceId={}, nodeId={}, imageKey={}",
                workspaceId, created.getNodeId(), imageKey);

        return created;
    }

    /**
     * 이미지 파일을 업로드하고 초기 마인드맵을 생성합니다.
     * 컨트롤러에서 이미지 업로드를 담당하는 경우 사용
     *
     * @param file 업로드할 이미지 파일
     * @param userId 사용자 ID
     * @param startPrompt 사용자 프롬프트
     * @return 생성된 워크스페이스 및 노드 정보
     */
    @Transactional
    public InitialMindmapResponse createInitialMindmapWithImageFile(MultipartFile file, Long userId, String startPrompt) {
        log.info("Creating initial mindmap with image file: userId={}, fileName={}",
                userId, file.getOriginalFilename());

        // 1. 이미지 S3 업로드
        String imageKey = imageService.uploadImage(file);
        log.debug("Image uploaded to S3: key={}", imageKey);

        // 2. 기존 메서드 재사용
        return createInitialMindmapWithImage(userId, imageKey, startPrompt);
    }


    public MindmapNode updateNode(Long workspaceId, Long nodeId, MindmapNode updates) {
        log.debug("Updating node: workspaceId={}, nodeId={}", workspaceId, nodeId);

        MindmapNode existingNode = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        if (updates.getKeyword() != null) {
            existingNode.setKeyword(updates.getKeyword());
        }
        if (updates.getMemo() != null) {
            existingNode.setMemo(updates.getMemo());
        }
        if (updates.getX() != null) {
            existingNode.setX(updates.getX());
        }
        if (updates.getY() != null) {
            existingNode.setY(updates.getY());
        }
        if (updates.getColor() != null) {
            existingNode.setColor(updates.getColor());
        }
        if (updates.getParentId() != null) {
            existingNode.setParentId(updates.getParentId());
        }
        if (updates.getAnalysisStatus() != null) {
            existingNode.setAnalysisStatus(updates.getAnalysisStatus());
        }

        existingNode.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(existingNode);
    }

    /**
     * 여러 노드의 좌표 및 색상을 일괄 업데이트합니다.
     * 모바일에서 STT 아이디어 확장 후 레이아웃 계산 결과를 반영할 때 사용됩니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param positions   업데이트할 노드 좌표 및 색상 리스트
     */
    @Transactional
    public void batchUpdatePositions(Long workspaceId, List<NodePositionUpdateRequest> positions) {
        log.info("Batch updating positions: workspaceId={}, count={}", workspaceId, positions.size());

        int updatedCount = 0;

        for (NodePositionUpdateRequest position : positions) {
            try {
                MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, position.nodeId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Node not found: workspaceId=" + workspaceId + ", nodeId=" + position.nodeId()));

                node.setX(position.x());
                node.setY(position.y());

                node.setUpdatedAt(LocalDateTime.now());

                nodeRepository.save(node);
                updatedCount++;

                log.debug("Updated position for node: nodeId={}, x={}, y={}",
                        position.nodeId(), position.x(), position.y());

            } catch (Exception e) {
                log.error("Failed to update position for node: nodeId={}", position.nodeId(), e);
                throw new RuntimeException("Failed to update position for nodeId: " + position.nodeId(), e);
            }
        }

        log.info("Successfully updated {} node positions", updatedCount);
    }

    @Transactional
    public void deleteNode(Long workspaceId, Long nodeId) {
        log.debug("Deleting node: workspaceId={}, nodeId={}", workspaceId, nodeId);
        nodeRepository.deleteByWorkspaceIdAndNodeId(workspaceId, nodeId);
    }

    @Transactional
    public void deleteAllNodes(Long workspaceId) {
        log.debug("Deleting all nodes for workspace: {}", workspaceId);
        nodeRepository.deleteByWorkspaceId(workspaceId);
    }

    @Transactional
    public List<MindmapNode> cloneWorkspace(Long userId, Long sourceWorkspaceId, String newWorkspaceName, String newWorkspaceDescription) {
        log.info("Cloning workspace: userId={}, source={}, newName={}", userId, sourceWorkspaceId, newWorkspaceName);

        List<MindmapNode> sourceNodes = nodeRepository.findByWorkspaceId(sourceWorkspaceId);

        if (sourceNodes.isEmpty()) {
            throw new IllegalArgumentException("Source workspace is empty: " + sourceWorkspaceId);
        }

        Long newWorkspaceId = workspaceServiceClientAdapter.createWorkspace(userId, newWorkspaceName);
        log.info("Created new workspace with ID: {}", newWorkspaceId);

        List<MindmapNode> clonedNodes = sourceNodes.stream()
                .map(node -> MindmapNode.builder()
                        .nodeId(node.getNodeId())
                        .workspaceId(newWorkspaceId)
                        .parentId(node.getParentId())
                        .type(node.getType())
                        .keyword(node.getKeyword())
                        .memo(node.getMemo())
                        .analysisStatus(node.getAnalysisStatus())
                        .x(node.getX())
                        .y(node.getY())
                        .color(node.getColor())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
                .toList();

        List<MindmapNode> savedNodes = nodeRepository.saveAll(clonedNodes);
        log.info("Cloned {} nodes to workspace {}", savedNodes.size(), newWorkspaceId);

        return savedNodes;
    }

    /**
     * 노드의 조상 경로를 수집합니다 (CONTEXTUAL 분석용)
     * nodeId부터 루트까지의 모든 노드 정보를 수집하여 반환합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param nodeId 시작 노드 ID
     * @return 조상 노드들의 컨텍스트 정보 (루트부터 현재 노드까지)
     */
    public List<NodeContextDto> getAncestorContext(Long workspaceId, Long nodeId) {
        log.debug("Collecting ancestor context: workspaceId={}, startNodeId={}", workspaceId, nodeId);

        List<NodeContextDto> context = new ArrayList<>();
        Long currentNodeId = nodeId;
        int depth = 0;
        final int MAX_DEPTH = 100; // 순환 참조 방지

        while (currentNodeId != null && depth < MAX_DEPTH) {
            final Long finalNodeId = currentNodeId; // final 변수로 선언
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, finalNodeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Node not found: workspaceId=" + workspaceId + ", nodeId=" + finalNodeId));

            context.add(new NodeContextDto(
                    node.getNodeId(),
                    node.getParentId(),
                    node.getKeyword(),
                    node.getMemo()
            ));

            currentNodeId = node.getParentId();
            depth++;
        }

        // 루트부터 현재 노드까지 순서로 정렬
        Collections.reverse(context);

        log.debug("Collected {} ancestor nodes for context", context.size());
        return context;
    }

    /**
     * AI 분석 결과로부터 노드들을 생성합니다.
     * tempId를 실제 nodeId로 매핑하며, 계층 구조를 유지합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param aiNodes AI가 생성한 노드 정보 리스트
     * @param parentNodeId 부모 노드 ID (CONTEXTUAL일 때 사용, INITIAL일 때 null)
     * @param analysisType "INITIAL" or "CONTEXTUAL"
     * @return 생성된 노드 리스트
     */
    @Transactional
    public List<MindmapNode> createNodesFromAiResult(
            Long workspaceId,
            List<AiNodeResult> aiNodes,
            Long parentNodeId,
            String analysisType) {

        log.info("Creating nodes from AI result: workspaceId={}, type={}, nodeCount={}",
                workspaceId, analysisType, aiNodes.size());

        // tempId → realId 매핑 맵
        Map<String, Long> tempIdToRealIdMap = new HashMap<>();
        List<MindmapNode> createdNodes = new ArrayList<>();

        if ("INITIAL".equals(analysisType)) {
            // INITIAL: 계층 구조를 유지하며 순차 생성
            // 1. 먼저 parentId가 null인 루트 레벨 노드들 생성
            for (AiNodeResult aiNode : aiNodes) {
                if (aiNode.parentId() == null) {
                    // INITIAL의 경우 최초 요청 노드가 부모
                    MindmapNode node = createNodeFromAiDto(workspaceId, aiNode, parentNodeId);
                    tempIdToRealIdMap.put(aiNode.tempId(), node.getNodeId());
                    createdNodes.add(node);
                    log.debug("Created root-level node: tempId={}, realId={}", aiNode.tempId(), node.getNodeId());
                }
            }

            // 2. 부모가 tempId인 노드들 생성 (여러 레벨이 있을 수 있음)
            boolean hasUnprocessed = true;
            int maxIterations = 10; // 무한 루프 방지
            int iteration = 0;

            while (hasUnprocessed && iteration < maxIterations) {
                hasUnprocessed = false;
                iteration++;

                for (AiNodeResult aiNode : aiNodes) {
                    // 이미 처리된 노드는 스킵
                    if (tempIdToRealIdMap.containsKey(aiNode.tempId())) {
                        continue;
                    }

                    if (aiNode.parentId() != null) {
                        // parentId가 숫자 문자열인 경우
                        Long realParentId = null;

                        try {
                            // 숫자로 파싱 시도 (기존 노드 ID)
                            realParentId = Long.parseLong(aiNode.parentId());
                        } catch (NumberFormatException e) {
                            // tempId인 경우 매핑에서 찾기
                            realParentId = tempIdToRealIdMap.get(aiNode.parentId());
                        }

                        if (realParentId != null) {
                            MindmapNode node = createNodeFromAiDto(workspaceId, aiNode, realParentId);
                            tempIdToRealIdMap.put(aiNode.tempId(), node.getNodeId());
                            createdNodes.add(node);
                            log.debug("Created child node: tempId={}, realId={}, parentId={}",
                                    aiNode.tempId(), node.getNodeId(), realParentId);
                        } else {
                            // 부모가 아직 생성되지 않음
                            hasUnprocessed = true;
                            log.debug("Skipping node (parent not ready): tempId={}, parentId={}",
                                    aiNode.tempId(), aiNode.parentId());
                        }
                    }
                }
            }

            if (hasUnprocessed) {
                log.warn("Some nodes could not be created due to unresolved parent references");
            }

        } else if ("CONTEXTUAL".equals(analysisType)) {
            // CONTEXTUAL: 모든 노드가 parentNodeId를 부모로 가짐
            for (AiNodeResult aiNode : aiNodes) {
                MindmapNode node = createNodeFromAiDto(workspaceId, aiNode, parentNodeId);
                createdNodes.add(node);
                log.debug("Created contextual node: keyword={}, realId={}, parentId={}",
                        aiNode.keyword(), node.getNodeId(), parentNodeId);
            }
        }

        log.info("Created {} nodes from AI result successfully", createdNodes.size());
        return createdNodes;
    }

    /**
     * AiNodeDto로부터 실제 MindmapNode를 생성합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param aiNode AI 노드 DTO
     * @param parentId 부모 노드 ID
     * @return 생성된 MindmapNode
     */
    private MindmapNode createNodeFromAiDto(Long workspaceId, AiNodeResult aiNode, Long parentId) {
        MindmapNode node = MindmapNode.builder()
                .workspaceId(workspaceId)
                .parentId(parentId)
                .keyword(aiNode.keyword())
                .memo(aiNode.memo())
                .type("text")
                .color(InitialColor.getRandomColor())  // PASTEL 테마 랜덤 색상
                .analysisStatus(MindmapNode.AnalysisStatus.NONE)
                .build();

        return createNode(node);  // 기존 createNode 재사용 (nodeId 자동 생성)
    }

    /**
     * AI 분석을 요청합니다.
     * 1. 노드의 분석 상태를 PENDING으로 변경
     * 2. Kafka를 통해 AI 서버로 분석 요청 전송
     *
     * @param analysisType "INITIAL" or "CONTEXTUAL"
     */
    public void requestAiAnalysis(Long workspaceId, Long nodeId, String contentUrl,
                                  String contentType, String prompt,
                                  String analysisType) {
        log.info("Requesting AI analysis: workspaceId={}, nodeId={}, type={}, contentType={}",
                workspaceId, nodeId, analysisType, contentType);

        // 1. 노드 존재 확인
        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        // 2. 노드 컨텍스트 수집 (CONTEXTUAL인 경우)
        List<NodeContextDto> nodes = null;
        if ("CONTEXTUAL".equals(analysisType)) {
            nodes = getAncestorContext(workspaceId, nodeId);
            log.debug("Collected node context with {} nodes", nodes.size());
        }

        // 3. 분석 상태를 PENDING으로 변경
        node.setAnalysisStatus(MindmapNode.AnalysisStatus.PENDING);
        node.setUpdatedAt(LocalDateTime.now());
        nodeRepository.save(node);

        // 4. Kafka를 통해 AI 서버로 분석 요청 전송
        AiAnalysisRequest request = new AiAnalysisRequest(
                workspaceId,
                nodeId,
                contentUrl,
                contentType,
                prompt,
                analysisType,
                nodes
        );

        aiAnalysisProducer.sendAnalysisRequest(request);

        log.info("AI analysis request sent successfully: nodeId={}, type={}", nodeId, analysisType);
    }

    /**
     * 모바일 음성 아이디어로 새 워크스페이스와 루트 노드를 생성합니다.
     * 1. 워크스페이스 생성
     * 2. 루트 노드 생성 (x, y = null, parentId = null)
     * 3. AI 분석 요청 (INITIAL 타입)
     * 4. 비동기 처리 (202 Accepted 반환)
     *
     * @param text STT로 변환된 텍스트
     * @param userId 사용자 ID (X-USER-ID 헤더에서 전달됨)
     * @return 생성된 워크스페이스 및 노드 정보
     */
    @Transactional
    public InitialMindmapResponse createVoiceIdeaNode(String text, String userId) {
        log.info("Creating voice idea workspace and node: text={}, userId={}", text, userId);

        // 1. 워크스페이스 생성 (workspace-service 호출)
        // 워크스페이스 이름은 STT 텍스트 사용 (최대 50자로 제한)
        String workspaceName = text.length() > 50 ? text.substring(0, 50) : text;
        Long userIdLong = Long.parseLong(userId);
        Long workspaceId = workspaceServiceClientAdapter.createWorkspace(userIdLong, workspaceName);
        log.info("Voice idea workspace created: workspaceId={}", workspaceId);
        // 2. 루트 노드 생성 (x, y = null)
        MindmapNode rootNode = MindmapNode.builder()
                .workspaceId(workspaceId)
                .parentId(null)  // 루트 노드
                .keyword(text)
                .type("text")  // STT 결과는 텍스트
                .x(null)  // 모바일에서는 좌표 없음
                .y(null)
                .color(InitialColor.getRandomColor())
                .analysisStatus(MindmapNode.AnalysisStatus.PENDING)
                .build();

        MindmapNode createdNode = createNode(rootNode);
        log.info("Voice idea root node created: workspaceId={}, nodeId={}", workspaceId, createdNode.getNodeId());

        // 3. AI 분석 요청 (INITIAL 타입으로)
        try {
            requestVoiceIdeaAnalysis(workspaceId, createdNode.getNodeId(), text);
            log.info("AI analysis requested for voice idea: workspaceId={}, nodeId={}",
                    workspaceId, createdNode.getNodeId());
        } catch (Exception e) {
            log.error("Failed to request AI analysis for voice idea nodeId={}",
                    createdNode.getNodeId(), e);
            // AI 분석 실패해도 노드 생성은 성공으로 처리
        }

        // 4. 응답 생성
        return new InitialMindmapResponse(
                workspaceId,
                createdNode.getNodeId(),
                createdNode.getKeyword(),
                createdNode.getMemo(),
                createdNode.getAnalysisStatus().name(),
                "음성 아이디어가 추가되었습니다. AI 분석이 진행 중입니다."
        );
    }

    /**
     * 음성 아이디어에 대한 AI 분석을 요청합니다 (INITIAL 타입).
     * 음성 아이디어 노드에서 사용하는 간소화된 버전
     *
     * @param workspaceId 워크스페이스 ID
     * @param nodeId 노드 ID
     * @param text STT로 변환된 텍스트
     */
    private void requestVoiceIdeaAnalysis(Long workspaceId, Long nodeId, String text) {
        log.info("Requesting INITIAL AI analysis for voice idea: workspaceId={}, nodeId={}", workspaceId, nodeId);

        // 1. 노드 존재 확인
        nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId).
                orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        // 2. Kafka를 통해 AI 서버로 분석 요청 전송 (INITIAL 타입)
        AiAnalysisRequest request = new AiAnalysisRequest(
                workspaceId,
                nodeId,
                null,  // contentUrl 없음
                "TEXT",  // contentType은 TEXT
                text,  // prompt는 STT 텍스트 사용
                "INITIAL",  // INITIAL 분석
                null  // INITIAL에서는 nodes = null
        );

        aiAnalysisProducer.sendAnalysisRequest(request);
        log.info("INITIAL AI analysis request sent successfully for voice idea: nodeId={}", nodeId);
    }

    /**
     * 텍스트/영상 기반 마인드맵을 생성합니다.
     * 1. 워크스페이스 생성 (workspace-service 호출)
     * 2. 첫 번째 노드 생성
     * 3. INITIAL AI 분석 요청 (Kafka)
     * 4. 생성 정보 반환
     *
     * @param userId 사용자 ID (X-USER-ID 헤더에서 전달됨)
     * @param request 초기 마인드맵 생성 요청
     * @return 생성된 워크스페이스 및 노드 정보
     */
    @Transactional
    public InitialMindmapResponse createInitialMindmap(Long userId, InitialMindmapRequest request) {
        log.info("Creating initial mindmap: contentType={}", request.contentType());

        // 1. 워크스페이스 생성 (workspace-service 호출)
        Long workspaceId = workspaceServiceClientAdapter.createWorkspace(
                userId,
                request.startPrompt()
        );
        log.info("Workspace created: workspaceId={}", workspaceId);

        String contentType = request.contentType();
        MindmapNode rootNode;

        if (contentType.equals("TEXT")) {
            rootNode = MindmapNode.builder()
                    .workspaceId(workspaceId)
                    .parentId(null)
                    .keyword("분석 중인 노드입니다.")
                    .type("text")
                    .x(null)
                    .y(null)
                    .color(InitialColor.getRandomColor())
                    .analysisStatus(MindmapNode.AnalysisStatus.PENDING)
                    .build();
        } else if (contentType.equals("VIDEO")) {
            rootNode = MindmapNode.builder()
                    .workspaceId(workspaceId)
                    .parentId(null)
                    .keyword(request.contentUrl())
                    .type("video")
                    .x(null)
                    .y(null)
                    .color(InitialColor.getRandomColor())
                    .analysisStatus(MindmapNode.AnalysisStatus.PENDING)
                    .build();
        } else {
            throw new IllegalArgumentException("Unsupported content type: " + contentType + ". Use /initial/upload for IMAGE type.");
        }

        MindmapNode createdNode = createNode(rootNode);
        log.info("Root node created: workspaceId={}, nodeId={}", workspaceId, createdNode.getNodeId());

        // 3. INITIAL AI 분석 요청 (Kafka)
        sendInitialAnalysisRequest(workspaceId, createdNode.getNodeId(),
                request.contentUrl(), request.contentType(), request.startPrompt());

        // 4. 응답 생성
        return buildInitialMindmapResponse(workspaceId, createdNode);
    }

    /**
     * 이미지 파일 기반 마인드맵을 생성합니다.
     * 1. 워크스페이스 생성 (workspace-service 호출)
     * 2. 이미지 노드 생성 (파일 URL 저장)
     * 3. INITIAL AI 분석 요청 (Kafka)
     * 4. 생성 정보 반환
     *
     * @param userId 사용자 ID
     * @param imageUrl 업로드된 이미지의 URL (S3 등)
     * @param startPrompt 사용자 프롬프트
     * @return 생성된 워크스페이스 및 노드 정보
     */
    @Transactional
    public InitialMindmapResponse createInitialMindmapWithImage(Long userId, String imageUrl, String startPrompt) {
        log.info("Creating initial mindmap with image: userId={}", userId);

        // 1. 워크스페이스 생성
        Long workspaceId = workspaceServiceClientAdapter.createWorkspace(userId, startPrompt);
        log.info("Workspace created: workspaceId={}", workspaceId);

        // 2. 이미지 노드 생성
        MindmapNode rootNode = MindmapNode.builder()
                .workspaceId(workspaceId)
                .parentId(null)
                .keyword(imageUrl)  // 이미지 URL을 keyword에 저장
                .type("image")
                .x(null)
                .y(null)
                .color(InitialColor.getRandomColor())
                .analysisStatus(MindmapNode.AnalysisStatus.PENDING)
                .build();

        MindmapNode createdNode = createNode(rootNode);
        log.info("Image root node created: workspaceId={}, nodeId={}", workspaceId, createdNode.getNodeId());

        String requestImageUrl = imageService.generateImagePresignedUrl(imageUrl, Duration.ofHours(1));
        // 3. INITIAL AI 분석 요청
        sendInitialAnalysisRequest(workspaceId, createdNode.getNodeId(),
                requestImageUrl, "IMAGE", startPrompt);

        // 4. 응답 생성
        return buildInitialMindmapResponse(workspaceId, createdNode);
    }

    /**
     * INITIAL AI 분석 요청을 Kafka로 전송합니다. (공통 로직)
     */
    private void sendInitialAnalysisRequest(Long workspaceId, Long nodeId,
                                            String contentUrl, String contentType, String prompt) {
        AiAnalysisRequest analysisRequest = new AiAnalysisRequest(
                workspaceId,
                nodeId,
                contentUrl,
                contentType,
                prompt,
                "INITIAL",
                null
        );

        aiAnalysisProducer.sendAnalysisRequest(analysisRequest);
        log.info("INITIAL AI analysis request sent: workspaceId={}, nodeId={}, contentType={}",
                workspaceId, nodeId, contentType);
    }

    /**
     * InitialMindmapResponse를 생성합니다. (공통 로직)
     */
    private InitialMindmapResponse buildInitialMindmapResponse(Long workspaceId, MindmapNode createdNode) {
        if(createdNode.getType().equals("image")){
            return new InitialMindmapResponse(
                    workspaceId,
                    createdNode.getNodeId(),
                    imageService.generateImagePresignedUrl(createdNode.getKeyword(), Duration.ofHours(1)),
                    createdNode.getMemo(),
                    createdNode.getAnalysisStatus().name(),
                    "마인드맵이 생성되었습니다. AI 분석이 진행 중입니다."
            );
        }
        else{
            return new InitialMindmapResponse(
                    workspaceId,
                    createdNode.getNodeId(),
                    createdNode.getKeyword(),
                    createdNode.getMemo(),
                    createdNode.getAnalysisStatus().name(),
                    "마인드맵이 생성되었습니다. AI 분석이 진행 중입니다."
            );
        }

    }
}
