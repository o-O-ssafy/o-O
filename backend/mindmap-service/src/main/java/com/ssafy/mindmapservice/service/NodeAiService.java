package com.ssafy.mindmapservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.client.GmsOpenAiClient;
import com.ssafy.mindmapservice.domain.InitialColor;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.request.AddIdeaRequest;
import com.ssafy.mindmapservice.dto.request.AnalyzeNodesRequest;
import com.ssafy.mindmapservice.dto.request.ChatCompletionRequest;
import com.ssafy.mindmapservice.dto.request.ChatMessage;
import com.ssafy.mindmapservice.dto.request.CreatePlanRequest;
import com.ssafy.mindmapservice.dto.response.AddIdeaResponse;
import com.ssafy.mindmapservice.dto.response.AnalyzeNodesResponse;
import com.ssafy.mindmapservice.dto.response.ChatCompletionResponse;
import com.ssafy.mindmapservice.dto.response.CreatePlanResponse;
import com.ssafy.mindmapservice.dto.response.ExtractedKeywordNode;
import com.ssafy.mindmapservice.kafka.NodeRestructureProducer;
import com.ssafy.mindmapservice.kafka.NodeUpdateProducer;
import com.ssafy.mindmapservice.repository.NodeRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NodeAiService {

    private final NodeRepository nodeRepository;
    private final GmsOpenAiClient gmsOpenAiClient;
    private final NodeService nodeService;
    private final NodeUpdateProducer nodeUpdateProducer;
    private final ObjectMapper objectMapper;
    private final NodeRestructureProducer nodeRestructureProducer;

    @Value("${gms.api-key}")
    private String gmsApiKey;

    private static final String MODEL = "gpt-5-mini";

    // ===================== 분석 API =====================

    public AnalyzeNodesResponse analyzeNodes(Long workspaceId, AnalyzeNodesRequest request) {
        if (request.getNodeIds() == null || request.getNodeIds().isEmpty()) {
            throw new IllegalArgumentException("nodeIds는 최소 1개 이상이어야 합니다.");
        }

        List<MindmapNode> nodes = nodeRepository
                .findByWorkspaceIdAndNodeIdIn(workspaceId, request.getNodeIds());

        if (nodes.isEmpty()) {
            throw new IllegalArgumentException("해당 워크스페이스에서 조회된 노드가 없습니다.");
        }

        String prompt = buildAnalysisPrompt(nodes);

        ChatCompletionRequest gmsRequest = new ChatCompletionRequest(
                "gpt-4o",
                List.of(
                        new ChatMessage("developer",
                                "한국어로만 답변해 주세요. " +
                                        "반드시 항상 구조화된 Markdown 형식으로 답변하고, 불필요한 서론은 생략하세요." +
                                "절대로 Markdown 이외의 포맷으로 작성하지 마십시오, ``` 금지."),
                        new ChatMessage("system",
                                "You are an expert product planner who analyzes mindmap structures " +
                                        "and extracts insights for service planning."),
                        new ChatMessage("user", prompt)
                )
        );

        ChatCompletionResponse gmsResponse = callGms(gmsRequest, "분석");

        String analysis = extractContent(gmsResponse);

        return new AnalyzeNodesResponse(analysis);
    }

    // ===================== 기획안 API =====================

    public CreatePlanResponse createPlanFromAnalysis(Long workspaceId, CreatePlanRequest request) {
        if (request.getAnalysisText() == null || request.getAnalysisText().isBlank()) {
            throw new IllegalArgumentException("analysisText는 비어 있을 수 없습니다.");
        }

        String prompt = buildPlanPrompt(request.getAnalysisText(), request.getTitle());

        ChatCompletionRequest gmsRequest = new ChatCompletionRequest(
                "gpt-4o",
                List.of(
                        new ChatMessage("developer",
                                "한국어 비즈니스 문체로 답변하고, 반드시 지정된 목차 구조를 지키세요. " +
                                        "목차 제목은 그대로 사용하고, 각 항목 아래에 구체적인 내용을 작성하세요." +
                                "항상 구조화된 Markdown 형식으로 답변, ``` 금지."),
                        new ChatMessage("system",
                                "You are a senior product manager who writes real-world service planning documents " +
                                        "based on analysis summaries."),
                        new ChatMessage("user", prompt)
                )
        );

        ChatCompletionResponse gmsResponse = callGms(gmsRequest, "기획안 생성");

        String plan = extractContent(gmsResponse);

        return new CreatePlanResponse(plan);
    }

    // ===================== 아이디어 추가 API =====================

    /**
     * 기존 워크스페이스에 아이디어를 추가하고, GPT가 키워드를 추출하여 마인드맵에 자동 연결합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param request 아이디어 추가 요청 (텍스트만)
     * @return 생성된 노드 정보
     */
    @Transactional
    public AddIdeaResponse addIdeaToWorkspace(Long workspaceId, AddIdeaRequest request) {
        log.info("Adding idea to workspace: workspaceId={}, idea={}", workspaceId, request.idea());

        // 1. 기존 워크스페이스의 모든 노드 조회
        List<MindmapNode> existingNodes = nodeRepository.findByWorkspaceId(workspaceId);

        boolean isEmptyWorkspace = existingNodes.isEmpty();

        if (isEmptyWorkspace) {
            log.info("Empty workspace detected: workspaceId={}. Will create root node from first keyword.", workspaceId);
        } else {
            log.info("Found {} existing nodes in workspace {}", existingNodes.size(), workspaceId);
        }

        // 2. GPT 프롬프트 생성
        String prompt = isEmptyWorkspace
                ? buildAddIdeaPromptForEmpty(request.idea())
                : buildAddIdeaPrompt(existingNodes, request.idea());

        // 3. GPT API 호출
        ChatCompletionRequest gmsRequest = new ChatCompletionRequest(
                MODEL,
                List.of(
                        new ChatMessage("developer",
                                "You must respond ONLY with valid JSON format. " +
                                        "Do not include any markdown code blocks, explanations, or extra text. " +
                                        "Just pure JSON array. " +
                                        "Extract the most relevant 5 to 8 keywords from the content. " +
                                        "Minimum: 5 keywords. " +
                                        "Maximum: 8 keywords. " +
                                        "The JSON array must contain at least five and at most eight objects."
                        ),
                        new ChatMessage("system",
                                "You are an AI assistant that extracts keywords from ideas and connects them to existing mindmap nodes. " +
                                        "You must respond with ONLY valid JSON format without any markdown formatting."),
                        new ChatMessage("user", prompt)
                )
        );

        ChatCompletionResponse gmsResponse = callGms(gmsRequest, "아이디어 키워드 추출");
        String gptResponseText = extractContent(gmsResponse);

        log.info("GPT response: {}", gptResponseText);

        // 4. GPT 응답 파싱 (JSON 배열 추출)
        List<ExtractedKeywordNode> extractedKeywords = parseGptKeywordResponse(gptResponseText);

        if (extractedKeywords.isEmpty()) {
            log.warn("GPT returned no keywords for idea: {}", request.idea());
            throw new IllegalStateException("GPT가 키워드를 추출하지 못했습니다.");
        }

        log.info("Extracted {} keywords from GPT", extractedKeywords.size());

        // 5. 추출된 키워드로 새 노드 생성
        List<MindmapNode> createdNodes = new ArrayList<>();

        if (isEmptyWorkspace) {
            // 빈 워크스페이스: 첫 번째 키워드를 루트로, 나머지는 자식으로
            log.info("Creating nodes for empty workspace: first as root, rest as children");

            for (int i = 0; i < extractedKeywords.size(); i++) {
                ExtractedKeywordNode extracted = extractedKeywords.get(i);

                Long parentId;
                if (i == 0) {
                    // 첫 번째 키워드: 루트 노드 (parentId = null)
                    parentId = null;
                } else {
                    // 나머지: 첫 번째 노드의 자식
                    parentId = createdNodes.get(0).getNodeId();
                }

                MindmapNode newNode = MindmapNode.builder()
                        .workspaceId(workspaceId)
                        .parentId(parentId)
                        .type("text")
                        .keyword(extracted.getKeyword())
                        .memo(extracted.getMemo())
                        .color(InitialColor.getRandomColor())
                        .analysisStatus(MindmapNode.AnalysisStatus.NONE)
                        .build();

                MindmapNode created = nodeService.createNode(newNode);
                createdNodes.add(created);

                log.info("Created node: nodeId={}, keyword={}, parentId={}, isRoot={}",
                        created.getNodeId(), created.getKeyword(), created.getParentId(), i == 0);
            }
        } else {
            // 기존 노드가 있는 경우: GPT가 지정한 parentId 사용
            for (ExtractedKeywordNode extracted : extractedKeywords) {
                // parentId 유효성 검증
                final Long parentIdFromGpt = extracted.getParentId();

                Long actualParentId;
                if (parentIdFromGpt == null) {
                    log.warn("GPT returned null parentId for keyword '{}'. Using root node instead.",
                            extracted.getKeyword());
                    // 첫 번째 노드를 루트로 사용
                    actualParentId = existingNodes.get(0).getNodeId();
                } else {
                    boolean parentExists = existingNodes.stream()
                            .anyMatch(node -> node.getNodeId().equals(parentIdFromGpt));

                    if (!parentExists) {
                        log.warn("Invalid parentId {} for keyword '{}'. Using root node instead.",
                                parentIdFromGpt, extracted.getKeyword());
                        // 첫 번째 노드를 루트로 사용
                        actualParentId = existingNodes.get(0).getNodeId();
                    } else {
                        actualParentId = parentIdFromGpt;
                    }
                }

                // 새 노드 생성
                MindmapNode newNode = MindmapNode.builder()
                        .workspaceId(workspaceId)
                        .parentId(actualParentId)
                        .type("text")
                        .keyword(extracted.getKeyword())
                        .memo(extracted.getMemo())
                        .color(InitialColor.getRandomColor())
                        .analysisStatus(MindmapNode.AnalysisStatus.NONE)
                        .build();

                MindmapNode created = nodeService.createNode(newNode);
                createdNodes.add(created);

                log.info("Created node: nodeId={}, keyword={}, parentId={}",
                        created.getNodeId(), created.getKeyword(), created.getParentId());
            }
        }

        // 6. WebSocket으로 변경사항 전송 (Kafka 이벤트 발행 - 전체 노드 정보 포함)
        nodeUpdateProducer.sendNodeUpdateWithNodes(workspaceId, createdNodes);
        log.info("Published node update event with {} created nodes for workspace {}",
                createdNodes.size(), workspaceId);

        // HTTP 응답용 노드 ID 리스트 추출
        List<Long> createdNodeIds = createdNodes.stream()
                .map(MindmapNode::getNodeId)
                .collect(Collectors.toList());

        return new AddIdeaResponse(
                workspaceId,
                createdNodeIds.size(),
                createdNodeIds,
                createdNodeIds.size() + "개의 키워드가 마인드맵에 추가되었습니다."
        );
    }

    /**
     * GPT 응답에서 JSON 배열을 파싱하여 ExtractedKeywordNode 리스트로 변환합니다.
     * GPT가 마크다운 코드 블록으로 감싼 경우도 처리합니다.
     */
    private List<ExtractedKeywordNode> parseGptKeywordResponse(String gptResponse) {
        try {
            // 마크다운 코드 블록 제거 (```json ... ``` 형태)
            String cleaned = gptResponse.trim();
            if (cleaned.startsWith("```")) {
                // ```json 또는 ``` 로 시작하는 경우
                int firstNewline = cleaned.indexOf('\n');
                int lastBacktick = cleaned.lastIndexOf("```");
                if (firstNewline > 0 && lastBacktick > firstNewline) {
                    cleaned = cleaned.substring(firstNewline + 1, lastBacktick).trim();
                }
            }

            log.debug("Cleaned GPT response for parsing: {}", cleaned);

            // JSON 배열 파싱
            return objectMapper.readValue(cleaned,
                    new TypeReference<List<ExtractedKeywordNode>>() {});

        } catch (Exception e) {
            log.error("Failed to parse GPT response as JSON: {}", gptResponse, e);
            throw new IllegalStateException("GPT 응답을 파싱할 수 없습니다: " + e.getMessage(), e);
        }
    }

    // ===================== 공통 GMS 호출 & 응답 처리 =====================

    private ChatCompletionResponse callGms(ChatCompletionRequest request, String purpose) {
        try {
            ChatCompletionResponse response =
                    gmsOpenAiClient.createChatCompletion("Bearer " + gmsApiKey, request);

            if (response == null) {
                log.error("[GMS {}] 응답이 null입니다.", purpose);
                throw new IllegalStateException("GMS 응답이 null입니다.");
            }

            if (response.getChoices() == null || response.getChoices().isEmpty()) {
                log.error("[GMS {}] choices가 비어 있습니다. response={}", purpose, response);
                throw new IllegalStateException("GMS 응답에 choices가 없습니다.");
            }

            return response;
        } catch (FeignException e) {
            // GMS 쪽에서 4xx/5xx 등 떨어진 경우
            log.error("[GMS {}] FeignException 발생: status={}, message={}",
                    purpose, e.status(), e.getMessage(), e);
            throw new IllegalStateException("GMS 호출 중 오류가 발생했습니다. (status=" + e.status() + ")", e);
        } catch (Exception e) {
            log.error("[GMS {}] 예기치 못한 오류 발생: {}", purpose, e.getMessage(), e);
            throw new IllegalStateException("GMS 호출 중 알 수 없는 오류가 발생했습니다.", e);
        }
    }

    private String extractContent(ChatCompletionResponse response) {
        try {
            return response.getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
        } catch (Exception e) {
            log.error("GMS 응답 파싱 중 오류 발생: response={}", response, e);
            throw new IllegalStateException("GMS 응답 포맷이 예상과 다릅니다.", e);
        }
    }

    // ===================== 프롬프트 템플릿 =====================

    /**
     * 빈 워크스페이스용 아이디어 추가 프롬프트
     * 기존 노드 정보 없이 새 아이디어만으로 키워드 추출
     */
    private String buildAddIdeaPromptForEmpty(String newIdea) {
        return """
            You are an AI assistant helping to create a mindmap from a new idea.

            ## Your Task
            1. Analyze the user's idea
            2. Extract 1–3 key concepts/keywords from the idea (prefer extracting exactly 1 if possible)
            3. Create a brief description (memo) for each keyword in Korean

            ## Important Rules
            - Prefer extracting exactly 1 keyword. Only if it is truly necessary, extract up to 3 keywords.
            - Never extract more than 3 keywords.
            - Keywords and memos must be in Korean
            - The first keyword will be the root node (most important concept)
            - If there is more than one keyword, all other keywords will be child nodes of the first keyword.
            - DO NOT include parentId in the response (it will be assigned automatically)

            ## New Idea to Process
            """ + "\"" + escape(newIdea) + "\"" + """


            ## Required Response Format
            Respond with ONLY a JSON array containing the extracted keywords. No explanations, no markdown code blocks.
            Each object must have exactly these fields:
            - keyword: string (the extracted keyword in Korean)
            - memo: string (brief description in Korean, 1-2 sentences)

            Example response format:
            [
              {
                "keyword": "맛집 추천 앱",
                "memo": "사용자 위치 기반으로 주변 맛집을 찾고 추천해주는 모바일 애플리케이션"
              },
              {
                "keyword": "맛집 검색",
                "memo": "사용자가 원하는 조건으로 맛집을 검색하는 기능"
              },
              {
                "keyword": "리뷰 시스템",
                "memo": "사용자들이 맛집에 대한 리뷰를 작성하고 공유하는 기능"
              }
            ]

            Now extract 1–3 keywords from the new idea (prefer 1 if possible) and respond with JSON only.
            """;
    }

    /**
     * 아이디어 추가용 GPT 프롬프트 생성
     * 기존 노드 정보 + 새 아이디어를 제공하고, JSON 형식으로 응답받습니다.
     */
    private String buildAddIdeaPrompt(List<MindmapNode> existingNodes, String newIdea) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            You are an AI assistant helping to expand a mindmap with new ideas.

            ## Your Task
            1. Analyze the user's new idea
            2. Extract 5–8 key concepts/keywords from the idea
            3. For each keyword, determine the most appropriate parent node from the existing mindmap
            4. Create a brief description (memo) for each keyword in Korean

            ## Important Rules
            - **DO NOT modify existing nodes** - only create new keyword nodes.
            - Each keyword must have a valid parentId from the existing nodes
            - Choose the most semantically related parent node for each keyword
            - If no clear parent exists, use the root node (nodeId with parentId=null)
            - Never extract more than 8 keywords.
            - Keywords and memos must be in Korean

            ## Existing Mindmap Nodes
            Below is the current mindmap structure. You can only use these nodeIds as parentId values:

            ```json
            [
            """);

        // 기존 노드 정보를 JSON 형태로 추가
        for (int i = 0; i < existingNodes.size(); i++) {
            MindmapNode node = existingNodes.get(i);
            sb.append("  {")
                    .append("\"nodeId\": ").append(node.getNodeId()).append(", ")
                    .append("\"parentId\": ").append(node.getParentId() == null ? "null" : node.getParentId()).append(", ")
                    .append("\"type\": \"").append(nullToEmpty(node.getType())).append("\", ")
                    .append("\"keyword\": \"").append(escape(node.getKeyword())).append("\", ")
                    .append("\"memo\": \"").append(escape(node.getMemo())).append("\"")
                    .append("}");
            if (i < existingNodes.size() - 1) sb.append(",");
            sb.append("\n");
        }

        sb.append("""
            ]
            ```

            ## New Idea to Process
            """).append("\"").append(escape(newIdea)).append("\"").append("""


            ## Required Response Format
            Respond with ONLY a JSON array containing the extracted keywords. No explanations, no markdown code blocks.
            Each object must have exactly these fields:
            - keyword: string (the extracted keyword in Korean)
            - memo: string (brief description in Korean, 1-2 sentences)
            - parentId: number (must be a valid nodeId from the existing nodes above)

            Example response format:
            [
              {
                "keyword": "맛집 검색",
                "memo": "사용자 위치 기반으로 주변 맛집을 검색하는 기능",
                "parentId": 3
              },
              {
                "keyword": "리뷰 시스템",
                "memo": "사용자들이 맛집에 대한 리뷰를 작성하고 공유하는 기능",
                "parentId": 3
              }
            ]

            Now extract 5–8 keywords from the new idea and respond with JSON only.
            """);

        return sb.toString();
    }

    /**
     * 마인드맵 노드 분석용 프롬프트
     */
    private String buildAnalysisPrompt(List<MindmapNode> nodes) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            아래는 사용자가 만든 마인드맵 노드 목록입니다.
            각 노드는 nodeId, parentId, type, keyword, memo 정보를 가지고 있으며,
            parentId를 통해 계층 구조(상위/하위 관계)를 파악할 수 있습니다.

            이 마인드맵을 분석하여 다음 내용을 작성해 주세요.

            1. 전체 주제 요약 (3~5문장)
            2. 사용자가 해결하려는 핵심 문제 또는 니즈
            3. 주요 아이디어/기능 그룹 (상위 카테고리별로 정리)
            4. 사용자 관점에서 기대되는 가치/효과
            5. 기획 관점에서 보완하면 좋을 점 3가지

            - 답변은 Markdown 형식으로 작성해 주세요.
            - 불필요한 서론, 사족은 제거하고 바로 분석 결과만 제시하세요.

            ### 마인드맵 노드 데이터 (JSON 형식)
            [
            """);

        // 간단한 JSON-like 포맷 (실제로는 ObjectMapper 쓰는 걸 추천)
        for (int i = 0; i < nodes.size(); i++) {
            MindmapNode n = nodes.get(i);
            sb.append("  {")
                    .append("\"nodeId\": ").append(n.getNodeId()).append(", ")
                    .append("\"parentId\": ").append(n.getParentId() == null ? "null" : n.getParentId()).append(", ")
                    .append("\"type\": \"").append(nullToEmpty(n.getType())).append("\", ")
                    .append("\"keyword\": \"").append(escape(n.getKeyword())).append("\", ")
                    .append("\"memo\": \"").append(escape(n.getMemo())).append("\"")
                    .append("}");
            if (i < nodes.size() - 1) sb.append(",");
            sb.append("\n");
        }
        sb.append("]\n");

        return sb.toString();
    }

    /**
     * 분석 결과 기반 기획안 생성용 프롬프트
     */
    private String buildPlanPrompt(String analysis, String title) {
        String finalTitle = (title == null || title.isBlank())
                ? "마인드맵 기반 서비스 기획안"
                : title;

        return """
            아래는 마인드맵을 기반으로 정리된 분석 내용입니다.
            이 분석을 바탕으로 실제 현업에서 사용할 수 있는 수준의 서비스 기획서를 작성해 주세요.

            기획안은 다음 요구사항을 반드시 만족해야 합니다.

            - 한국어 비즈니스 문체 사용
            - Markdown 형식 사용
            - 아래 목차를 그대로 포함하고, 각 항목 아래에 구체적인 내용을 채울 것

            ## 1. 서비스 개요
            - 서비스 한 줄 정의
            - 서비스 설명

            ## 2. 기획 배경 및 문제 정의
            - 해결하려는 문제/니즈
            - 현재 사용자의 Pain Point

            ## 3. 타깃 사용자 및 페르소나
            - 주요 타깃 세그먼트
            - 대표 페르소나 1~2명 (나이, 직업, 상황, 니즈)

            ## 4. 핵심 가치 제안 (Value Proposition)
            - 이 서비스가 제공하는 핵심 가치 3~5개

            ## 5. 주요 기능 정의
            - 기능을 3~7개 그룹으로 나누고,
              각 기능에 대해 [기능 이름 / 상세 설명 / 기대 효과]를 정리

            ## 6. 주요 사용자 흐름 (UX Flow)
            - 주요 플로우: 가입/온보딩 → 핵심 기능 사용 → 재방문/리텐션
            - 각 단계에서 사용자의 행동과 화면을 간략히 서술

            ## 7. MVP 범위 정의
            - 1차 출시(MVP)에 반드시 포함해야 할 기능
            - 이후 단계에서 추가할 기능

            ## 8. 향후 로드맵
            - 1개월, 3개월, 6개월 관점의 고레벨 로드맵

            ## 9. 성공 지표 (KPI)
            - 3~5개의 주요 KPI와 그 의미

            아래 분석 내용을 충분히 참고하여, 실제 회의/문서에서 바로 사용할 수 있을 수준으로 작성해 주세요.

            --- 분석 내용 시작 ---
            %s
            --- 분석 내용 끝 ---
            """.formatted(analysis);
    }

    // ===== 간단 유틸 =====
    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
    }

    @Transactional
    public void restructureWorkspace(Long workspaceId) {

        // 🔥 0) 우선 LOCK 브로드캐스트 (프론트 편집 막기)
        nodeRestructureProducer.sendLock(workspaceId);

        try {
            // 1) 기존 노드 조회
            List<MindmapNode> nodes = nodeRepository.findByWorkspaceId(workspaceId);

            if (nodes.isEmpty()) {
                throw new IllegalArgumentException("해당 워크스페이스에 노드가 없습니다.");
            }

            // 🔍 원본 노드 맵 (nodeId → MindmapNode)
            Map<Long, MindmapNode> originalMap = nodes.stream()
                    .collect(Collectors.toMap(MindmapNode::getNodeId, n -> n));

            // 2) GPT 프롬프트 생성 (필요한 정보만 넣자)
            String prompt = buildRestructurePrompt(nodes);

            ChatCompletionRequest request = new ChatCompletionRequest(
                    "gpt-5-mini",
                    List.of(
                            new ChatMessage("developer", """
                            반드시 JSON 배열만 출력.
                            마크다운, 설명, ``` 금지.
                            새로운 nodeId 생성 금지.
                            기존 nodeId 목록 외의 nodeId 사용 금지.
                            keyword, memo 내용은 바꾸지 말 것.
                            createdAt, updatedAt, x, y, color, type 필드는 출력하지 말 것.
                            (서버에서 다시 채운다)
                            """),
                            new ChatMessage("system", """
                            You are an expert mindmap restructuring agent.
                            You will reorganize nodes into a clean hierarchy.
                            DO NOT modify nodeId=1 (root node).
                            """),
                            new ChatMessage("user", prompt)
                    )
            );

            // 3) GPT 호출 + 결과 JSON 추출
            ChatCompletionResponse response = callGms(request, "정리하기");
            String json = extractContent(response);

            // 4) GPT 응답 → 엔티티 리스트 변환 (원본 노드 정보 섞어서 재구성)
            List<MindmapNode> rebuilt = parseRestructureJson(workspaceId, json, originalMap);

            log.info("[RESTRUCTURE] workspaceId={}, originalSize={}, rebuiltSize={}",
                    workspaceId, nodes.size(), rebuilt.size());

            // rebuilt 비어있으면 무조건 실패 처리
            if (rebuilt.isEmpty()) {
                throw new IllegalStateException("재구성된 노드가 없습니다. (rebuilt is empty)");
            }

            // 5) nodeId / parentId 등 검증
            validateNodeIds(nodes, rebuilt);

            // 6) DB 전체 덮어쓰기
            nodeRepository.deleteByWorkspaceId(workspaceId);
            nodeRepository.saveAll(rebuilt);

            // 🔥 7) APPLY 이벤트 발행 (nodes 포함)
            nodeRestructureProducer.sendApply(workspaceId, rebuilt);

            log.info("Workspace {} restructure complete", workspaceId);

        } catch (Exception e) {
            log.error("Workspace {} restructure failed", workspaceId, e);

            // 🔥 실패 시 FAIL 이벤트 발행 (프론트는 lock 풀고 토스트 띄우게)
            try {
                nodeRestructureProducer.sendFail(workspaceId, e.getMessage());
            } catch (Exception sendEx) {
                log.error("Failed to send restructure FAIL event for workspace {}", workspaceId, sendEx);
            }

            // 트랜잭션 롤백되도록 재-throw
            if (e instanceof RuntimeException re) {
                throw re;
            }
            throw new RuntimeException(e);
        }
    }




    private String buildRestructurePrompt(List<MindmapNode> nodes) {
        StringBuilder sb = new StringBuilder();

        sb.append("""
      당신의 임무는 사용자의 마인드맵을 최적화하여
      깔끔한 트리 구조로 재구성하는 것입니다.

      🎯 요구사항
      1. nodeId=1 은 ROOT 이며 절대 변경/삭제/이동 금지
      2. keyword + memo가 의미적으로 중복이면 병합, nodeId가 작은 것을 남기기
      3. 계층 구조를 semantic 기준으로 재배치
      4. parentId 는 존재하는 nodeId 중 하나여야 함
      5. 출력은 반드시 JSON array 로만, 설명 금지
      6. parentId를 변경하여 재배치하되, nodeId 집합은 그대로 유지

      🎯 출력 포맷 (예시)
      [
        {
          "nodeId": 1,
          "parentId": null,
          "keyword": "루트",
          "memo": "루트 노드"
        }
      ]

      아래는 기존 노드 목록입니다:
      [
    """);

        for (int i = 0; i < nodes.size(); i++) {
            MindmapNode n = nodes.get(i);
            sb.append(String.format("""
          {
            "nodeId": %d,
            "parentId": %s,
            "keyword": "%s",
            "memo": "%s"
          }%s
        """,
                    n.getNodeId(),
                    n.getParentId() == null ? "null" : n.getParentId(),
                    escape(n.getKeyword()),
                    escape(n.getMemo()),
                    (i < nodes.size() - 1 ? "," : "")
            ));
        }

        sb.append("\n]");

        return sb.toString();
    }


    private List<MindmapNode> parseRestructureJson(
            Long workspaceId,
            String json,
            Map<Long, MindmapNode> originalMap
    ) {
        try {
            List<JsonNode> arr = objectMapper.readValue(json, new TypeReference<>() {});

            List<MindmapNode> result = new ArrayList<>();

            for (JsonNode n : arr) {
                long nodeId = n.get("nodeId").asLong();

                MindmapNode original = originalMap.get(nodeId);
                if (original == null) {
                    throw new IllegalStateException("GPT 결과에 존재하지 않는 nodeId 포함: " + nodeId);
                }

                // parentId는 GPT가 바꿔준 값 사용
                Long parentId = n.get("parentId").isNull()
                        ? null
                        : n.get("parentId").asLong();

                // keyword/memo는 바꾸지 말라고 했으니, 혹시라도 바뀌었으면 검증해서 막을 수도 있음
                String keywordFromGpt = n.get("keyword").asText();
                String memoFromGpt = n.get("memo").asText();

                String originalKeyword = original.getKeyword() != null ? original.getKeyword() : "";
                String originalMemo = original.getMemo() != null ? original.getMemo() : "";

                if (!originalKeyword.equals(keywordFromGpt)) {
                    log.warn("GPT가 keyword를 변경함: nodeId={}, original='{}', gpt='{}'",
                            nodeId, originalKeyword, keywordFromGpt);
                }
                if (!originalMemo.equals(memoFromGpt)) {
                    log.warn("GPT가 memo를 변경함: nodeId={}, original='{}', gpt='{}'",
                            nodeId, originalMemo, memoFromGpt);
                }

                result.add(
                        MindmapNode.builder()
                                .workspaceId(workspaceId)
                                .nodeId(nodeId)
                                .parentId(parentId)
                                // 구조 외 필드는 원본 그대로 유지
                                .type(original.getType())
                                .keyword(original.getKeyword())
                                .memo(original.getMemo())
                                .color(original.getColor())
                                // 좌표는 재배치 후 프론트에서 다시 계산하게, 항상 null
                                .x(null)
                                .y(null)
                                // 날짜는 서버/감사 로직에 맞게
                                .createdAt(original.getCreatedAt())
                                .updatedAt(LocalDateTime.now())
                                .analysisStatus(original.getAnalysisStatus())
                                .build()
                );
            }

            return result;
        } catch (Exception e) {
            throw new IllegalStateException("정리된 JSON 파싱 실패", e);
        }
    }


    private void validateNodeIds(List<MindmapNode> originalNodes, List<MindmapNode> rebuiltNodes) {
        Set<Long> originalIds = originalNodes.stream()
                .map(MindmapNode::getNodeId)
                .collect(Collectors.toSet());

        Set<Long> rebuiltIds = rebuiltNodes.stream()
                .map(MindmapNode::getNodeId)
                .collect(Collectors.toSet());

        // 기존에 없던 새로운 nodeId 생성 방지
        if (!originalIds.containsAll(rebuiltIds)) {
            throw new IllegalStateException(
                    "GPT가 존재하지 않는 nodeId를 생성함. original=" + originalIds + ", rebuilt=" + rebuiltIds
            );
        }

        // root 안전장치
        rebuiltNodes.stream()
                .filter(n -> n.getNodeId() == 1L)
                .findFirst()
                .ifPresent(root -> {
                    if (root.getParentId() != null) {
                        throw new IllegalStateException("root node(1)의 parentId가 null이 아님");
                    }
                });
    }



}
