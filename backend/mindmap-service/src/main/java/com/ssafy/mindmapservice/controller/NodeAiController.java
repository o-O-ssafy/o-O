package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.dto.request.AnalyzeNodesRequest;
import com.ssafy.mindmapservice.dto.request.CreatePlanRequest;
import com.ssafy.mindmapservice.dto.response.AnalyzeNodesResponse;
import com.ssafy.mindmapservice.dto.response.CreatePlanResponse;
import com.ssafy.mindmapservice.service.NodeAiService;
import com.ssafy.mindmapservice.service.NodeRestructureJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mindmap/{workspaceId}/ai")
@Tag(name = "Node AI", description = "마인드맵 노드 AI 분석/기획안 관련 API")
public class NodeAiController {

    private final NodeAiService nodeAiService;
    private final NodeRestructureJobService nodeRestructureJobService;

    @Operation(
            summary = "마인드맵 노드 분석",
            description = """
                    선택한 노드 목록(nodeId 기준)을 기반으로 마인드맵 전체 흐름과 핵심 포인트를 분석합니다.
                    클라이언트는 nodeId 리스트만 보내면 되며, 서버가 MongoDB에서 노드를 조회한 뒤
                    GMS(gpt-5)를 호출해 분석 결과를 생성합니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "분석 성공",
                    content = @Content(schema = @Schema(implementation = AnalyzeNodesResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 오류"),
            @ApiResponse(responseCode = "500", description = "GMS 호출 실패 또는 서버 오류")
    })
    @PostMapping("/analyze-nodes")
    public ResponseEntity<AnalyzeNodesResponse> analyzeNodes(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,
            @RequestBody AnalyzeNodesRequest request
    ) {
        AnalyzeNodesResponse response = nodeAiService.analyzeNodes(workspaceId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "분석 결과 기반 기획안 생성",
            description = """
                    앞서 받은 분석 결과 텍스트를 기반으로 실제 서비스 기획안을 생성합니다.
                    기획안은 한국어 비즈니스 문체로, 정해진 목차(서비스 개요, 문제 정의, 타깃, 기능 정의 등)를 포함한
                    문서 형태로 반환됩니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "기획안 생성 성공",
                    content = @Content(schema = @Schema(implementation = CreatePlanResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 오류"),
            @ApiResponse(responseCode = "500", description = "GMS 호출 실패 또는 서버 오류")
    })
    @PostMapping("/create-plan")
    public ResponseEntity<CreatePlanResponse> createPlan(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,
            @RequestBody CreatePlanRequest request
    ) {
        CreatePlanResponse response = nodeAiService.createPlanFromAnalysis(workspaceId, request);
        return ResponseEntity.ok(response);
    }


    @Operation(
            summary = "마인드맵 전체 구조 정리하기",
            description = """
  워크스페이스의 모든 노드를 GPT(gpt-5-mini)를 사용해 의미 기반 트리 구조로 재배치하는 기능입니다.

                ⚙️ **전체 처리 흐름 (Node.js WebSocket + Kafka + Y.Doc 연동)**

                ### 1) LOCK 이벤트 브로드캐스트
                - 서버(Spring)가 Kafka(mindmap.restructure.update)에 `eventType=LOCK` 메시지 발행
                - Node.js WebSocket 서버가 해당 이벤트를 수신하여:
                  - Y.Doc 내부 metaMap("locked") = true 로 설정
                  - 모든 클라이언트에 LOCK 상태를 실시간 전파
                - 클라이언트는 이 동안 편집 UI를 잠시 비활성화함

                ### 2) GPT를 통한 구조 재배치
                - 서버가 MongoDB에서 모든 노드를 조회한 뒤 GPT에 전달
                - GPT는 의미적 유사도를 기반으로:
                  - 중복 노드 병합
                  - parentId 재구성
                  - 트리 구조 정렬
                  - nodeId=1 (ROOT) 절대 변경 금지
                - GPT가 잘못된 nodeId를 생성하지 않았는지 서버에서 검증

                ### 3) DB 전체 재작성
                - 기존 노드를 모두 삭제 후 재구성된 노드를 저장

                ### 4) APPLY 이벤트 브로드캐스트
                - Kafka에 `eventType=APPLY + nodes 배열` 발행
                - Node.js WebSocket 서버가 APPLY 이벤트를 수신하여:
                  - 기존 mindmap:nodes 전체 clear()
                  - 새 노드 전체를 Y.Doc에 적용
                  - metaMap("locked") = false 로 변경
                  - 실시간 업데이트를 모든 사용자에게 전달

                ### 5) 늦게 접속한 사용자는?
                - LOCK 중 들어오면 metaMap.locked=true 상태를 그대로 전달받음 → 편집 불가
                - APPLY 후 들어오면 최신 구조가 적용된 Y.Doc 동기화됨

                ⚠️ **소요 시간**
                - GPT 호출 포함 오래 소요될 수 있습니다.
                - 그동안은 편집이 일시적으로 제한됩니다.

                📌 이 API는 순수한 재정렬 로직만 수행하며, 클라이언트는 별도 요청 없이 자동으로 반영됩니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "정리 작업 시작됨",
                    content = @Content(schema = @Schema(example = """
                            {
                              "message": "정리 작업이 시작되었습니다."
                            }
                            """))),
            @ApiResponse(responseCode = "400", description = "잘못된 workspaceId"),
            @ApiResponse(responseCode = "500", description = "정리 작업 중 오류 발생")
    })
    @PostMapping("/restructure")
    public ResponseEntity<Map<String, String>> restructureMindmap(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId
    ) {
        nodeRestructureJobService.runRestructure(workspaceId);
        return ResponseEntity.ok(Map.of("message", "정리 작업이 시작되었습니다."));
    }
}
