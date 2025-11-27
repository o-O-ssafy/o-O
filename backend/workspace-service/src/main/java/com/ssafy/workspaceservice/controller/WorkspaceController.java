package com.ssafy.workspaceservice.controller;

import com.ssafy.workspaceservice.dto.request.*;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.enums.WorkspaceRole;
import com.ssafy.workspaceservice.enums.WorkspaceTheme;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;
import com.ssafy.workspaceservice.service.WorkspaceService;
import com.ssafy.workspaceservice.service.WorkspaceThumbnailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "Workspace API", description = "워크스페이스 관리 및 멤버 협업 API")
@RestController
@RequestMapping("/workspace")
@RequiredArgsConstructor
@Validated
@Slf4j
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final WorkspaceThumbnailService workspaceThumbnailService;

    @Operation(
            summary = "워크스페이스 생성",
            description = "새로운 워크스페이스를 생성합니다. 생성자는 자동으로 MAINTAINER 권한을 부여받습니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "생성 성공"),
            @ApiResponse(responseCode = "400", content = @Content,  description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", content = @Content, description = "인증 실패")
    })
    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId,

            @Parameter(description = "초기 프롬프트 (STT 텍스트 등, optional)", example = "인공지능 윤리 문제에 대해 생각해봅시다")
            @RequestBody(required = false) String startPrompt) {
        log.info("POST /workspace - Creating workspace for userId: {}, startPrompt: {}", userId, startPrompt);
        return ResponseEntity.ok(workspaceService.create(userId, startPrompt));
    }

    @Operation(
            summary = "워크스페이스 상세 조회",
            description = "워크스페이스 상세 정보 및 멤버 목록을 조회합니다. 공개 워크스페이스는 누구나 조회 가능하며, 비공개는 멤버만 접근 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", content = @Content, description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", content = @Content, description = "워크스페이스를 찾을 수 없음")
    })
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDetailResponse> detail(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            @RequestHeader(value = "X-USER-ID", required = false) Long requesterUserId
    ) {
        log.info("GET /workspace/{} - Fetching workspace detail for workspaceId: {}, requesterUserId: {}", workspaceId, workspaceId, requesterUserId);
        return ResponseEntity.ok(workspaceService.getDetail(workspaceId, requesterUserId));
    }

    @Operation(
            summary = "멤버 권한 변경",
            description = "멤버의 역할(MAINTAINER, EDIT, VIEW)을 변경합니다. MAINTAINER 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "권한 변경 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "멤버를 찾을 수 없음")
    })
    @PatchMapping("/{workspaceId}/member/{targetUserId}")
    public ResponseEntity<Void> changeMemberRole(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(description = "대상 사용자 ID", required = true, example = "5")
            @PathVariable Long targetUserId,

            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long requestUserId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "변경할 권한 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = MemberRoleChangeRequest.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "role": "EDIT"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody @Valid MemberRoleChangeRequest request
    ) {
        log.info("PATCH /workspace/{}/member/{} - Changing member role for workspaceId: {}, targetUserId: {}, requestUserId: {}, newRole: {}",
                workspaceId, targetUserId, workspaceId, targetUserId, requestUserId, request.role());
        WorkspaceRole newRole = WorkspaceRole.valueOf(request.role().toUpperCase());
        workspaceService.changeMemberRole(workspaceId, requestUserId, targetUserId, newRole);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "워크스페이스 공개 설정 변경",
            description = "워크스페이스의 공개/비공개 상태를 변경합니다. 공개 시 누구나 조회 가능하며, 비공개 시 멤버만 접근 가능합니다. MAINTAINER 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PatchMapping("/{workspaceId}/visibility")
    public ResponseEntity<Void> changeVisibility(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId
    ) {
        log.info("PATCH /workspace/{}/visibility - Changing visibility for workspaceId: {}", workspaceId, workspaceId);
        workspaceService.changeVisibility(workspaceId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "내가 속한 워크스페이스 조회 (커서 기반 페이징)",
            description = "카테고리별로 내가 속한 워크스페이스를 조회합니다. category: recent(전체 최신순), team(팀 프로젝트), personal(개인 프로젝트). 페이지 크기는 20개 고정입니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 category 값")
    })
    @GetMapping("/my")
    public ResponseEntity<WorkspaceCursorResponse> getMyWorkspaces(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId,

            @Parameter(description = "카테고리 (recent, team, personal)", required = true, example = "recent")
            @RequestParam String category,

            @Parameter(description = "커서 (페이징용, 이전 응답의 nextCursor 사용)", example = "105")
            @RequestParam(required = false) Long cursor
    ) {
        log.info("GET /workspace/my - Fetching my workspaces for userId: {}, category: {}, cursor: {}", userId, category, cursor);
        return ResponseEntity.ok(workspaceService.getMyWorkspaces(userId, category, cursor));
    }

    @Operation(
            summary = "모바일용 최근 워크스페이스 전체 조회",
            description = """
    모바일 환경에서 내가 속한 워크스페이스를 최근 생성/참여 순으로 전체 조회합니다.
    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = WorkspaceSimpleResponse.class)))),
            @ApiResponse(responseCode = "401", content = @Content, description = "인증 실패"),
            @ApiResponse(responseCode = "500", content = @Content, description = "서버 오류")
    })
    @GetMapping("/my/recent")
    public ResponseEntity<List<WorkspaceSimpleResponse>> getAllMyWorkspacesForMobile(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId
    ) {
        log.info("GET /workspace/my/recent - Fetching all my workspaces for mobile for userId: {}", userId);
        return ResponseEntity.ok(workspaceService.getAllMyWorkspacesForMobile(userId));
    }


    @Operation(
            summary = "워크스페이스 삭제",
            description = "워크스페이스와 관련된 모든 데이터를 영구 삭제합니다. 복구가 불가능하며, MAINTAINER 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "삭제할 워크스페이스 ID", required = true)
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            @RequestHeader(value = "X-USER-ID", required = false) Long userId
    ) {
        log.info("DELETE /workspace/{} - Deleting workspace for workspaceId: {}, userId: {}", workspaceId, workspaceId, userId);
        workspaceService.delete(workspaceId, userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "초대 링크로 워크스페이스 참여",
            description = "초대 토큰을 사용하여 워크스페이스에 바로 참여합니다. 참여 시 기본 권한은 VIEW로 설정됩니다. 이미 멤버라면 바로 방으로 진입합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "참여 성공"),
            @ApiResponse(responseCode = "400", description = "인원이 가득 참"),
            @ApiResponse(responseCode = "404", description = "유효하지 않은 초대 링크")
    })
    @PostMapping("/join")
    public ResponseEntity<WorkspaceJoinResponse> joinWorkspace(
            @Parameter(description = "초대 토큰", required = true, example = "550e8400-e29b-41d4-a716-446655")
            @RequestParam String token,

            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId
    ) {
        log.info("POST /workspace/join - Joining workspace with token: {}, userId: {}", token, userId);

        return ResponseEntity.ok().body(workspaceService.joinByToken(token, userId));
    }

    @Operation(
            summary = "[내부] Public 워크스페이스 ID 목록 조회",
            description = """
            현재 Public 상태인 모든 워크스페이스의 ID 목록을 반환합니다.

            ### 호출 주체
            - Mindmap-service (검색 시 필터링용)
            - Trend-service (캐싱용)

            ### 응답 예시
            ```json
            {
              "workspaceIds": [1, 5, 10, 23, 45, ...]
            }
            ```
            """
    )
    @GetMapping("/workspace-ids")
    public ResponseEntity<Map<String, List<Long>>> getPublicWorkspaceIds() {
        log.info("GET /api/internal/public/workspace-ids - Fetching public workspace IDs");

        List<Long> publicIds = workspaceService.getPublicWorkspaceIds();

        return ResponseEntity.ok(Map.of("workspaceIds", publicIds));
    }

    // 🔹 내부용 visibility 전용 API
    @Operation(
            summary = "[internal] 워크스페이스 공개 여부 조회",
            description = "내부 서비스에서 워크스페이스의 visibility(TEXT)를 조회할 때 사용합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @GetMapping("/{workspaceId}/visibility")
    public ResponseEntity<Map<String, String>> getVisibilityInternal(
            @PathVariable Long workspaceId
    ) {
        log.info("GET /workspace/{}/visibility - Fetching visibility for workspaceId: {}", workspaceId, workspaceId);
        String visibility = workspaceService.getVisibilityOnly(workspaceId);
        return ResponseEntity.ok(Map.of("visibility", visibility));
    }

    // 🔹 내부용 title 업데이트 API
    @Operation(
            summary = "[internal] 워크스페이스 제목 업데이트",
            description = """
                    내부 서비스(mindmap-service)에서 AI가 생성한 제목으로 워크스페이스를 업데이트할 때 사용합니다.
                    인증(X-USER-ID) 없이 workspaceId와 title만으로 업데이트합니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "제목 업데이트 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PutMapping("/internal/{workspaceId}/title")
    public ResponseEntity<Void> updateTitleInternal(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(description = "업데이트할 제목", required = true, example = "인공지능 윤리 문제 해결 아이디어")
            @RequestBody String title
    ) {
        log.info("PATCH /workspace/internal/{}/title - Updating title to: {}", workspaceId, title);
        workspaceService.updateTitleOnly(workspaceId, title);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "월별 활성 날짜 조회 (웹 전용)",
            description = """
                    내가 속한 워크스페이스가 생성된 날짜를 월별로 조회합니다.
                    달력 UI에서 활성 날짜를 표시하기 위해 사용됩니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 월 형식", content = @Content)
    })
    @GetMapping("my/activity/monthly")
    public ResponseEntity<WorkspaceActivityDaysResponse> getActivityDays(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId,

            @Parameter(description = "조회할 월 (yyyy-MM)", required = true, example = "2025-11")
            @RequestParam String month
    ) {
        log.info("GET /workspace/activity/days - Fetching activity days for userId: {}, month: {}", userId, month);
        List<String> dates = workspaceService.getActivityDays(userId, month);
        return ResponseEntity.ok(WorkspaceActivityDaysResponse.of(dates));
    }

    @Operation(
            summary = "특정 날짜의 생성 키워드 조회 - 최대 10개(모바일/웹 공통)",
            description = """
                    특정 날짜에 생성된 내 워크스페이스의 마인드맵 노드 키워드를 랜덤으로 최대 10개 반환합니다.

                    ### 정책
                    - 무조건 최대 10개
                    - 10개 미만이면 있는 만큼만
                    - 랜덤 선택 (매번 다른 결과)
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 날짜 형식", content = @Content)
    })
    @GetMapping("/my/activity/daily")
    public ResponseEntity<WorkspaceActivityKeywordsResponse> getActivityKeywords(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId,

            @Parameter(description = "조회할 날짜 (yyyy-MM-dd)", required = true, example = "2025-11-05")
            @RequestParam LocalDate date
    ) {
        log.info("GET /workspace/my/activity - Fetching activity keywords for userId: {}, date: {}", userId, date);
        List<String> keywords = workspaceService.getActivityKeywords(userId, date);
        return ResponseEntity.ok(WorkspaceActivityKeywordsResponse.of(keywords));
    }


    @Operation(
            summary = "워크스페이스 썸네일 업로드",
            description = "워크스페이스 ID와 썸네일 이미지를 업로드하면 S3에 저장하고 워크스페이스에 썸네일을 연결합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "업로드 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PostMapping(
            value = "/{workspaceId}/thumbnail",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Void> uploadThumbnail(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId, // 필요 없으면 제거해도 됨

            @Parameter(description = "썸네일 이미지 파일", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        log.info("POST /workspace/{}/thumbnail - Uploading thumbnail for workspaceId: {}, userId: {}",
                workspaceId, workspaceId, userId);

        // 권한 체크를 하고 싶으면 workspaceService 쪽에 위임해서 한 번 더 검증해도 됨
        workspaceThumbnailService.uploadThumbnail(workspaceId, file);
        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "워크스페이스 테마 변경",
            description = """
                    워크스페이스의 테마를 변경합니다.
                    MAINTAINER 권한이 필요합니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PatchMapping("/{workspaceId}/theme")
    public ResponseEntity<Void> changeTheme(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "변경할 테마 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = WorkspaceThemeChangeRequest.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "theme": "PASTEL"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody @Valid WorkspaceThemeChangeRequest request
    ) {
        log.info("PATCH /workspace/{}/theme - Changing theme for workspaceId: {}, userId: {}, newTheme: {}",
                workspaceId, workspaceId, userId, request.theme());

        WorkspaceTheme newTheme = WorkspaceTheme.valueOf(request.theme().toUpperCase());
        workspaceService.changeTheme(workspaceId, userId, newTheme);

        return ResponseEntity.ok().build();
    }


}
