package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.request.AiAnalysisRequest;
import com.ssafy.mindmapservice.dto.request.BatchPositionUpdateRequest;
import com.ssafy.mindmapservice.dto.request.InitialMindmapRequest;
import com.ssafy.mindmapservice.dto.request.VoiceIdeaRequest;
import com.ssafy.mindmapservice.dto.request.ImageNodeCreateRequest;
import com.ssafy.mindmapservice.dto.response.InitialMindmapResponse;
import com.ssafy.mindmapservice.dto.response.NodeSimpleResponse;
import com.ssafy.mindmapservice.dto.response.NodeResponse;
import com.ssafy.mindmapservice.dto.request.WorkspaceCloneRequest;
import com.ssafy.mindmapservice.service.NodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Mindmap Node API", description = "마인드맵 노드 관리 및 AI 분석 API")
@Slf4j
@RestController
@RequestMapping("/mindmap")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    @Operation(
            summary = "초기 마인드맵 생성",
            description = """
                    ## 콘텐츠 기반 마인드맵 자동 생성

                    콘텐츠(텍스트/이미지/영상)를 분석하여 워크스페이스와 루트 노드를 생성하고 AI 분석을 요청합니다.

                    ### 📌 처리 흐름
                    1. **워크스페이스 생성**: workspace-service를 호출하여 새 워크스페이스 생성
                    2. **루트 노드 생성**: contentType에 따라 적절한 루트 노드 생성
                       - TEXT: keyword = "분석 중인 노드입니다.", type = "text"
                       - IMAGE: keyword = contentUrl, type = "image"
                       - VIDEO: keyword = contentUrl, type = "video"
                    3. **AI 분석 요청**: INITIAL 타입으로 Kafka에 분석 요청 전송
                    4. **즉시 응답**: 생성된 워크스페이스 및 노드 정보 반환

                    ### ⚡ 비동기 처리
                    - AI 분석 결과는 Kafka Consumer를 통해 비동기로 처리됩니다
                    - 실시간 결과는 WebSocket을 통해 클라이언트에 전달됩니다
                    - 생성된 노드의 `analysisStatus`는 `PENDING` 상태로 반환됩니다
                    - x, y 좌표는 null로 생성됩니다

                    ### 📝 INITIAL 분석 결과
                    - AI 요약이 원본 노드의 `memo`에 저장됩니다
                    - AI가 생성한 키워드 노드들이 계층 구조로 추가됩니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "마인드맵 생성 완료. AI 분석이 진행 중입니다.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = InitialMindmapResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 필드 누락 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 오류 (워크스페이스 생성 실패, 노드 생성 실패 등)",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "초기 마인드맵 생성 요청 정보",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InitialMindmapRequest.class),
                    examples = {
                            @ExampleObject(
                                    name = "텍스트 프롬프트 예시",
                                    summary = "텍스트로 마인드맵 생성",
                                    value = """
                                            {
                                              "contentUrl": null,
                                              "contentType": "TEXT",
                                              "startPrompt": "고기랑 관련된 아이디어 없을까?"
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "영상 콘텐츠 예시",
                                    summary = "유튜브 영상으로 마인드맵 생성",
                                    value = """
                                            {
                                              "contentUrl": "https://youtu.be/qDG3auuSb1E",
                                              "contentType": "VIDEO",
                                              "startPrompt": "이 영상에서 아이디어를 찾아줘"
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "이미지 콘텐츠 예시",
                                    summary = "이미지로 마인드맵 생성",
                                    value = """
                                            {
                                              "contentUrl": "https://example.com/image.jpg",
                                              "contentType": "IMAGE",
                                              "startPrompt": "이 사진을 보고 여행 아이디어를 제안해줘"
                                            }
                                            """
                            )
                    }
            )
    )
    @PostMapping("/initial")
    public ResponseEntity<InitialMindmapResponse> createInitialMindmap(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") String userId,
            @RequestBody InitialMindmapRequest request) {
        log.info("POST /mindmap/initial - userId={}, contentType={}, startPrompt={}",
                userId, request.contentType(), request.startPrompt());

        InitialMindmapResponse response = nodeService.createInitialMindmap(Long.parseLong(userId), request);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @Operation(
            summary = "이미지 기반 마인드맵 생성",
            description = """
                    ## 이미지 파일 기반 마인드맵 자동 생성

                    이미지 파일을 업로드하여 워크스페이스와 루트 노드를 생성하고 AI 분석을 요청합니다.

                    ### 📌 처리 흐름
                    1. **이미지 업로드**: S3에 이미지 파일 업로드
                    2. **워크스페이스 생성**: workspace-service를 호출하여 새 워크스페이스 생성
                    3. **이미지 노드 생성**: keyword = imageUrl, type = "image"
                    4. **AI 분석 요청**: INITIAL 타입으로 Kafka에 분석 요청 전송
                    5. **즉시 응답**: 생성된 워크스페이스 및 노드 정보 반환

                    ### ⚡ 비동기 처리
                    - AI 분석 결과는 Kafka Consumer를 통해 비동기로 처리됩니다
                    - 생성된 노드의 `analysisStatus`는 `PENDING` 상태로 반환됩니다
                    - x, y 좌표는 null로 생성됩니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "마인드맵 생성 완료. AI 분석이 진행 중입니다.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = InitialMindmapResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (파일 누락, 잘못된 형식 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 오류 (이미지 업로드 실패, 워크스페이스 생성 실패 등)",
                    content = @Content
            )
    })
    @PostMapping(value = "/initial/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InitialMindmapResponse> createInitialMindmapWithImage(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") String userId,
            @Parameter(description = "업로드할 이미지 파일", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "사용자 프롬프트", required = true)
            @RequestParam("startPrompt") String startPrompt) {
        log.info("POST /mindmap/initial/image - userId={}, fileName={}, startPrompt={}",
                userId, file.getOriginalFilename(), startPrompt);

        InitialMindmapResponse response = nodeService.createInitialMindmapWithImageFile(
                file, Long.parseLong(userId), startPrompt);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @Operation(
            summary = "워크스페이스의 모든 노드 조회",
            description = """
                    특정 워크스페이스에 속한 모든 마인드맵 노드를 조회합니다.

                    ### 노드 타입별 keyword 처리
                    - **image**: S3 key → presigned URL로 변환 (1시간 유효)
                    - **video**: 유튜브 링크 그대로 반환
                    - **text**: 텍스트 키워드 그대로 반환
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/{workspaceId}/nodes")
    public ResponseEntity<List<NodeResponse>> getNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes", workspaceId);
        List<NodeResponse> nodes = nodeService.getNodesWithPresignedUrls(workspaceId);
        return ResponseEntity.ok(nodes);
    }

    @Operation(
            summary = "워크스페이스 노드 간단 조회",
            description = "특정 워크스페이스에 속한 노드의 간단한 정보(nodeId, keyword)만 조회합니다. 캘린더 등에서 경량화된 응답이 필요할 때 사용됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 간단 정보 조회 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/{workspaceId}/nodes/simple")
    public ResponseEntity<List<NodeSimpleResponse>> getSimpleNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes/simple", workspaceId);
        List<NodeSimpleResponse> nodes = nodeService.getSimpleNodesByWorkspace(workspaceId);
        return ResponseEntity.ok(nodes);
    }

    @Operation(
            summary = "[Internal] 여러 워크스페이스의 키워드 일괄 조회",
            description = """
                    여러 워크스페이스의 모든 노드 키워드를 평면 리스트로 반환합니다.
                    workspace-service의 캘린더 기능에서 사용됩니다.

                    ### 응답 예시
                    ```json
                    ["AI 기능 개선", "Redis TTL 설계", "OAuth 리다이렉트", ...]
                    ```
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "키워드 일괄 조회 성공")
    })
    @PostMapping("/nodes/keywords/batch")
    public ResponseEntity<List<String>> getKeywordsBatch(
            @Parameter(description = "워크스페이스 ID 목록", required = true)
            @RequestBody List<Long> workspaceIds) {
        log.info("POST /mindmap/nodes/keywords/batch - {} workspaces", workspaceIds.size());
        List<String> keywords = nodeService.getKeywordsByWorkspaces(workspaceIds);
        return ResponseEntity.ok(keywords);
    }

    @Operation(
            summary = "[Internal] 노드가 존재하는 워크스페이스 ID 목록 조회",
            description = """
                    여러 워크스페이스 중 노드가 하나라도 존재하는 워크스페이스 ID 목록을 반환합니다.
                    workspace-service의 캘린더 기능에서 사용됩니다. (노드가 없는 워크스페이스 필터링용)

                    ### 응답 예시
                    ```json
                    [1, 3, 5, 7]
                    ```
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 존재 확인 성공")
    })
    @PostMapping("/nodes/exists/batch")
    public ResponseEntity<List<Long>> getWorkspaceIdsWithNodes(
            @Parameter(description = "워크스페이스 ID 목록", required = true)
            @RequestBody List<Long> workspaceIds) {
        log.info("POST /mindmap/nodes/exists/batch - {} workspaces", workspaceIds.size());
        List<Long> result = nodeService.getWorkspaceIdsWithNodes(workspaceIds);
        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "특정 노드 조회",
            description = "워크스페이스 내의 특정 노드를 ID로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 조회 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<MindmapNode> getNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId) {
        log.info("GET /mindmap/{}/node/{}", workspaceId, nodeId);
        MindmapNode node = nodeService.getNode(workspaceId, nodeId);
        return ResponseEntity.ok(node);
    }

    @Operation(
            summary = "노드 생성 (텍스트/비디오)",
            description = """
                    워크스페이스에 새로운 마인드맵 노드를 생성합니다. nodeId는 자동으로 생성됩니다.

                    **지원 타입**: text, video
                    **이미지 노드**: POST /{workspaceId}/node/image 사용
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "노드 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (image 타입은 /node/image 사용)", content = @Content),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @PostMapping("/{workspaceId}/node")
    public ResponseEntity<MindmapNode> createNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "생성할 노드 정보 (nodeId는 자동 생성되므로 제외)",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = {
                                    @ExampleObject(
                                            name = "텍스트 노드",
                                            value = """
                                                    {
                                                      "parentId": 1,
                                                      "type": "text",
                                                      "keyword": "새 아이디어",
                                                      "memo": "메모 내용",
                                                      "x": 100.0,
                                                      "y": 200.0,
                                                      "color": "#3b82f6"
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "비디오 노드",
                                            value = """
                                                    {
                                                      "parentId": 1,
                                                      "type": "video",
                                                      "keyword": "https://youtu.be/qDG3auuSb1E",
                                                      "memo": "유튜브 영상",
                                                      "x": 100.0,
                                                      "y": 200.0,
                                                      "color": "#3b82f6"
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @RequestBody MindmapNode node) {
        log.info("POST /mindmap/{}/node - type={}", workspaceId, node.getType());

        // image 타입은 /node/image 엔드포인트 사용
        if ("image".equals(node.getType())) {
            throw new IllegalArgumentException("Image nodes must be created via POST /{workspaceId}/node/image endpoint");
        }

        node.setWorkspaceId(workspaceId);
        MindmapNode created = nodeService.createNode(node);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "이미지 노드 생성",
            description = """
                    워크스페이스에 이미지 파일을 업로드하여 새로운 이미지 노드를 생성합니다.

                    ### 처리 흐름
                    1. 이미지 파일을 S3에 업로드
                    2. S3 key를 keyword에 저장하여 노드 생성
                    3. 조회 시 presigned URL로 자동 변환됨

                    ### 요청 형식
                    - Content-Type: multipart/form-data
                    - file: 이미지 파일 (binary)
                    - request: JSON 객체 {"parentId": 1, "memo": "메모", "x": 100.0, "y": 200.0, "color": "#3b82f6"}
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "이미지 노드 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (파일 누락 등)", content = @Content),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @PostMapping(value = "/{workspaceId}/node/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MindmapNode> createImageNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "업로드할 이미지 파일", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "노드 생성 정보 (JSON)")
            @RequestPart("request") ImageNodeCreateRequest request) {
        log.info("POST /mindmap/{}/node/image - fileName={}", workspaceId, file.getOriginalFilename());

        MindmapNode created = nodeService.createImageNode(workspaceId, file, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "노드 수정",
            description = "기존 노드의 정보를 부분적으로 수정합니다. 제공된 필드만 업데이트됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 수정 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<MindmapNode> updateNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "수정할 필드만 포함 (null이 아닌 필드만 업데이트됨)",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = {
                                    @ExampleObject(
                                            name = "키워드와 메모 수정",
                                            value = """
                                                    {
                                                      "keyword": "수정된 키워드",
                                                      "memo": "수정된 메모"
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "위치 수정",
                                            value = """
                                                    {
                                                      "x": 150.5,
                                                      "y": 250.3
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "색상 수정",
                                            value = """
                                                    {
                                                      "color": "#3b82f6"
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @RequestBody MindmapNode updates) {
        log.info("PATCH /mindmap/{}/node/{}", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNode(workspaceId, nodeId, updates);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "노드 삭제",
            description = "특정 노드를 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "노드 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<Void> deleteNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId) {
        log.info("DELETE /mindmap/{}/node/{}", workspaceId, nodeId);
        nodeService.deleteNode(workspaceId, nodeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "워크스페이스의 모든 노드 삭제",
            description = "특정 워크스페이스에 속한 모든 노드를 삭제합니다. **주의**: 복구 불가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "모든 노드 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/{workspaceId}/nodes")
    public ResponseEntity<Void> deleteAllNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("DELETE /mindmap/{}/nodes", workspaceId);
        nodeService.deleteAllNodes(workspaceId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "워크스페이스 복제",
            description = "기존 워크스페이스의 모든 노드를 새 워크스페이스로 복제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "워크스페이스 복제 성공"),
            @ApiResponse(responseCode = "404", description = "원본 워크스페이스를 찾을 수 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "복제 중 오류 발생", content = @Content)
    })
    @PostMapping("/{workspaceId}/clone")
    public ResponseEntity<List<MindmapNode>> cloneWorkspace(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") String userId,
            @Parameter(description = "원본 워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "새 워크스페이스 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "workspaceName": "복제된 워크스페이스",
                                              "workspaceDescription": "원본의 복사본"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody WorkspaceCloneRequest request) {
        log.info("POST /mindmap/{}/clone - userId={}, name={}", workspaceId, userId, request.workspaceName());
        Long userIdLong = Long.parseLong(userId);
        List<MindmapNode> clonedNodes = nodeService.cloneWorkspace(
                userIdLong,
                workspaceId,
                request.workspaceName(),
                request.workspaceDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(clonedNodes);
    }

    @Operation(
            summary = "AI 분석 요청",
            description = """
                    ## AI 기반 마인드맵 노드 분석 요청

                    콘텐츠(이미지/영상/텍스트)를 분석하여 마인드맵 노드를 자동 생성합니다.
                    요청은 Kafka를 통해 비동기로 처리되며, 결과는 WebSocket으로 실시간 전달됩니다.

                    ### 📌 분석 타입

                    #### 1️⃣ INITIAL (최초 분석)
                    - **사용 시점**: 홈 화면에서 새 워크스페이스의 첫 노드 생성 시
                    - **입력**: contentUrl, contentType, prompt, analysisType
                    - **출력**: AI 요약(memo 업데이트) + 6개의 키워드 노드 (2단계 계층 구조)
                    - **nodes 필드**: null (생략)

                    #### 2️⃣ CONTEXTUAL (맥락 기반 확장)
                    - **사용 시점**: 기존 노드를 확장할 때
                    - **입력**: nodes (조상 경로), analysisType
                    - **출력**: 3개의 자식 노드 (keyword + memo)
                    - **contentUrl, prompt**: null (생략)

                    ### ⚠️ 주의사항
                    - INITIAL 요청 시 `nodes` 필드는 반드시 null이어야 합니다
                    - CONTEXTUAL 요청 시 `nodes` 필드에 nodeId부터 루트까지의 조상 경로를 포함해야 합니다
                    - 응답은 202 Accepted로 즉시 반환되며, 실제 결과는 Kafka Consumer를 통해 비동기 처리됩니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "분석 요청이 정상적으로 접수되었습니다. 결과는 Kafka를 통해 비동기로 처리됩니다.",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 필드 누락, 분석 타입 불일치 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "노드를 찾을 수 없음",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "AI 분석 요청 정보",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AiAnalysisRequest.class),
                    examples = {
                            @ExampleObject(
                                    name = "INITIAL 요청 예시",
                                    summary = "최초 분석 요청 (영상 콘텐츠)",
                                    value = """
                                            {
                                              "workspaceId": 123,
                                              "nodeId": 1,
                                              "contentUrl": "https://youtu.be/qDG3auuSb1E",
                                              "contentType": "VIDEO",
                                              "prompt": "고기랑 관련된 아이디어 없을까?",
                                              "analysisType": "INITIAL",
                                              "nodes": null
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "CONTEXTUAL 요청 예시",
                                    summary = "맥락 기반 확장 요청",
                                    value = """
                                            {
                                              "workspaceId": 123,
                                              "nodeId": 15,
                                              "contentUrl": null,
                                              "contentType": "TEXT",
                                              "prompt": null,
                                              "analysisType": "CONTEXTUAL",
                                              "nodes": [
                                                {
                                                  "nodeId": 2,
                                                  "parentId": 1,
                                                  "keyword": "굽기 정도별 레시피",
                                                  "memo": "레어~웰던 단계별 조리 시간 비교"
                                                },
                                                {
                                                  "nodeId": 3,
                                                  "parentId": 2,
                                                  "keyword": "부위별 특징",
                                                  "memo": "안심, 등심 등 질감 및 맛 차이 설명"
                                                },
                                                {
                                                  "nodeId": 15,
                                                  "parentId": 3,
                                                  "keyword": "고기",
                                                  "memo": "고기 종류"
                                                }
                                              ]
                                            }
                                            """
                            )
                    }
            )
    )
    @PostMapping("/{workspaceId}/node/{nodeId}/analyze")
    public ResponseEntity<Void> requestAiAnalysis(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(description = "노드 ID (INITIAL: 첫 노드, CONTEXTUAL: 확장할 노드)", required = true, example = "1")
            @PathVariable Long nodeId,

            @RequestBody AiAnalysisRequest request) {
        log.info("POST /mindmap/{}/node/{}/analyze - type={}, contentType={}",
                workspaceId, nodeId, request.analysisType(), request.contentType());

        nodeService.requestAiAnalysis(
                workspaceId,
                nodeId,
                request.contentUrl(),
                request.contentType(),
                request.prompt(),
                request.analysisType()
        );

        return ResponseEntity.accepted().build();
    }

    @Operation(
            summary = "음성 아이디어 추가 (모바일)",
            description = """
                    ## 모바일 음성 인식 아이디어 추가

                    STT로 변환된 텍스트를 받아 새 워크스페이스와 루트 노드를 생성하고 AI 분석을 자동으로 요청합니다.

                    ### 📌 처리 흐름
                    1. **워크스페이스 생성**: workspace-service를 호출하여 새 워크스페이스 생성
                    2. **루트 노드 생성**: x, y 좌표를 null로 하여 루트 노드 생성
                    3. **AI 분석 요청**: INITIAL 타입으로 자동 분석 요청
                    4. **즉시 응답**: 202 Accepted 반환 (비동기 처리)

                    ### ⚡ 비동기 처리
                    - 워크스페이스와 노드 생성 후 즉시 응답하며, AI 분석은 백그라운드에서 진행됩니다
                    - 생성된 노드의 `analysisStatus`는 `PENDING` 상태로 반환됩니다
                    - AI 분석 결과는 WebSocket을 통해 실시간으로 전달됩니다
                    - AI가 생성하는 노드 개수는 가변적입니다 (고정되지 않음)

                    ### 📝 좌표 처리
                    - x, y 좌표는 null로 저장됩니다
                    - 웹에서 워크스페이스를 열 때 자동 배치 또는 수동 배치가 필요합니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "음성 아이디어가 추가되었습니다. AI 분석이 진행 중입니다.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = InitialMindmapResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 필드 누락 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 오류 (워크스페이스 생성 실패 등)",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "음성 아이디어 추가 요청 정보",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VoiceIdeaRequest.class),
                    examples = @ExampleObject(
                            name = "음성 아이디어 예시",
                            summary = "STT로 변환된 텍스트",
                            value = """
                                    {
                                      "text": "인공지능 윤리 문제"
                                    }
                                    """
                    )
            )
    )
    @PostMapping("/stt-idea")
    public ResponseEntity<InitialMindmapResponse> addVoiceIdea(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") String userId,
            @RequestBody VoiceIdeaRequest request) {
        log.info("POST /mindmap/stt-idea - text={}", request.text());

        InitialMindmapResponse response = nodeService.createVoiceIdeaNode(request.text(), userId);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @Operation(
            summary = "노드 좌표 및 색상 일괄 업데이트 (모바일)",
            description = """
                    ## 여러 노드의 좌표와 색상을 한 번에 업데이트

                    모바일에서 STT 아이디어 확장 후 레이아웃을 계산한 결과를 반영할 때 사용합니다.
                    여러 노드의 x, y 좌표 및 색상을 한 번의 요청으로 업데이트할 수 있습니다.

                    ### 📌 사용 시나리오
                    1. STT로 아이디어 생성 → AI가 여러 노드 확장 → 좌표, 색상은 null
                    2. 모바일에서 전체 노드 레이아웃 계산
                    3. 이 API로 모든 노드의 좌표 및 색상을 한 번에 업데이트
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "좌표 일괄 업데이트 성공",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (유효성 검증 실패)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "존재하지 않는 노드 포함",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "업데이트할 노드 좌표 목록",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = BatchPositionUpdateRequest.class),
                    examples = @ExampleObject(
                            name = "좌표 및 색상 일괄 업데이트 예시",
                            summary = "여러 노드의 좌표와 색상을 한 번에 업데이트",
                            value = """
                                    {
                                      "positions": [
                                        { "nodeId": 1, "x": 100.0, "y": 200.0 },
                                        { "nodeId": 2, "x": 300.0, "y": 150.0 },
                                        { "nodeId": 3, "x": 500.0, "y": 250.0 },
                                        { "nodeId": 4, "x": 400.0, "y": 350.0 }
                                      ]
                                    }
                                    """
                    )
            )
    )
    @PatchMapping("/{workspaceId}/nodes/positions")
    public ResponseEntity<Void> batchUpdatePositions(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @RequestBody BatchPositionUpdateRequest request) {
        log.info("PATCH /mindmap/{}/nodes/positions - updating {} nodes",
                workspaceId, request.positions().size());

        nodeService.batchUpdatePositions(workspaceId, request.positions());

        return ResponseEntity.noContent().build();
    }
}
