package com.ssafy.workspaceservice.service;

import com.ssafy.workspaceservice.client.MindmapClient;
import com.ssafy.workspaceservice.client.UserServiceClient;
import com.ssafy.workspaceservice.dto.request.UserProfileRequest;
import com.ssafy.workspaceservice.dto.request.WorkspaceCreateRequest;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.entity.WorkspaceMember;
import com.ssafy.workspaceservice.enums.*;
import com.ssafy.workspaceservice.exception.*;
import com.ssafy.workspaceservice.repository.WorkspaceMemberRepository;
import com.ssafy.workspaceservice.repository.WorkspaceRepository;
import com.ssafy.workspaceservice.repository.WorkspaceVisibilityView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final MindmapClient mindmapClient;
    private final UserServiceClient userServiceClient;
    private final WorkspaceThumbnailService workspaceThumbnailService;

    private static final int MAX_MEMBERS = 6;
    private static final int DEFAULT_PAGE_SIZE = 20;

    public WorkspaceResponse create(Long userId, WorkspaceCreateRequest request) {
        String INITIAL_TITLE = "제목 없음";

        // request가 있으면 해당 값 사용, 없으면 기본값 사용
        String title = (request != null && request.title() != null) ? request.title() : INITIAL_TITLE;
        WorkspaceType type = (request != null && request.type() != null)
                ? WorkspaceType.valueOf(request.type().toUpperCase())
                : WorkspaceType.PERSONAL;
        WorkspaceVisibility visibility = (request != null && request.visibility() != null)
                ? WorkspaceVisibility.valueOf(request.visibility().toUpperCase())
                : WorkspaceVisibility.PRIVATE;
        String startPrompt = (request != null) ? request.toStartPrompt() : null;

        Workspace workspace = Workspace.builder()
                .theme(WorkspaceTheme.PASTEL)
                .type(type)
                .visibility(visibility)
                .title(title)
                .startPrompt(startPrompt)
                .token(UUID.randomUUID().toString())
                .build();
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(saved)
                .userId(userId)
                .role(WorkspaceRole.MAINTAINER)
                .pointerColor(PointerColor.randomColor())
                .build();
        workspaceMemberRepository.save(member);

        return WorkspaceResponse.from(saved);
    }

    // 워크스페이스 조회
    // 요청자 멤버 여부/역할 조회
    // 멤버 수 집계
    // WorkspaceDetailResponse 반환
    @Transactional(readOnly = true)
    public WorkspaceDetailResponse getDetail(Long workspaceId, Long requesterUserId) {
        // 1. 워크스페이스 존재 확인
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 2. 요청자가 멤버인지 확인
        Optional<WorkspaceMember> mine = Optional.empty();
        if (requesterUserId != null) {
            mine = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, requesterUserId);
        }

        boolean isMember = mine.isPresent();

        // 3. 접근 권한 확인 (비공개 & 비회원이면 403)
        if (w.getVisibility() == WorkspaceVisibility.PRIVATE && !isMember) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER);
        }

        // 4. 썸네일 presigned URL 생성 (DB엔 key, 응답엔 URL)
        String thumbnailUrl = workspaceThumbnailService.generateThumbnailPresignedUrl(
                w.getThumbnail(),          // DB에 들어있는 S3 key
                java.time.Duration.ofMinutes(10)
        );

        // 5. 응답 생성
        String myRole = String.valueOf(mine.map(WorkspaceMember::getRole).orElse(null));
        Long memberCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);

        return WorkspaceDetailResponse.of(w, thumbnailUrl, isMember, myRole, memberCount);
    }



    // 멤버 권한 변경
    public void changeMemberRole(Long workspaceId, Long requestUserId, Long targetUserId, WorkspaceRole newRole) {
        // 1. 요청자 권한 확인
        WorkspaceMember requestMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, requestUserId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER));

        if (requestMember.getRole() != WorkspaceRole.MAINTAINER) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MAINTAINER);
        }

        // 2. 대상 멤버 확인
        WorkspaceMember targetMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 3. 역할 변경
        targetMember.changeRole(newRole);  // 더티 체킹으로 자동 업데이트
    }

    // 워크스페이스 공개/비공개 토글
    //TODO: 트렌드 반영할 때마다 퍼블릭인 것만 대상으로 할 거라 회수할 수 없다는 메시지 안 띄워도 될 거 같은데..
    public void changeVisibility(Long workspaceId) {
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 토글: PUBLIC ↔ PRIVATE
        WorkspaceVisibility newVisibility = (w.getVisibility() == WorkspaceVisibility.PUBLIC)
                ? WorkspaceVisibility.PRIVATE
                : WorkspaceVisibility.PUBLIC;

        w.changeVisibility(newVisibility); // @Transaction 어노테이션으로 더티 체킹을 통해 자동 업데이트

        if (newVisibility == WorkspaceVisibility.PUBLIC) {
            mindmapClient.bulkIndexWorkspace(workspaceId);
        }
    }

    // 내가 속한 워크스페이스 조회 (커서 기반 페이징)
    @Transactional(readOnly = true)
    public WorkspaceCursorResponse getMyWorkspaces(Long userId, String category, Long cursor) {
        Pageable pageable = PageRequest.of(0, DEFAULT_PAGE_SIZE + 1);
        List<Workspace> workspaces;

        // 🔹 category 분기
        switch (category.toLowerCase()) {
            case "recent" -> {
                if (cursor == null) {
                    workspaces = workspaceRepository.findMyWorkspacesInitial(userId, pageable);
                } else {
                    workspaces = workspaceRepository.findMyWorkspacesWithCursor(userId, cursor, pageable);
                }
            }
            case "team" -> {
                if (cursor == null) {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeInitial(userId, WorkspaceType.TEAM, pageable);
                } else {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeWithCursor(userId, WorkspaceType.TEAM, cursor, pageable);
                }
            }
            case "personal" -> {
                if (cursor == null) {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeInitial(userId, WorkspaceType.PERSONAL, pageable);
                } else {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeWithCursor(userId, WorkspaceType.PERSONAL, cursor, pageable);
                }
            }
            default -> throw new BadRequestException(ErrorCode.INVALID_INPUT_VALUE);
        }

        boolean hasNext = workspaces.size() > DEFAULT_PAGE_SIZE;

        // 실제 페이지에 들어갈 워크스페이스
        List<Workspace> pageWorkspaces = workspaces.stream()
                .limit(DEFAULT_PAGE_SIZE)
                .toList();

        if (pageWorkspaces.isEmpty()) {
            return WorkspaceCursorResponse.of(List.of(), null, false);
        }

        // 1) workspaceId 목록
        List<Long> workspaceIds = pageWorkspaces.stream()
                .map(Workspace::getId)
                .toList();

        // 2) 워크스페이스 멤버 조회
        List<WorkspaceMember> members =
                workspaceMemberRepository.findByWorkspaceIds(workspaceIds);

        // workspaceId -> userId 리스트 매핑
        Map<Long, List<Long>> workspaceUserMap = members.stream()
                .collect(Collectors.groupingBy(
                        wm -> wm.getWorkspace().getId(),
                        Collectors.mapping(WorkspaceMember::getUserId, Collectors.toList())
                ));

        // 3) 전체 userId 모으기
        List<Long> allUserIds = members.stream()
                .map(WorkspaceMember::getUserId)
                .distinct()
                .toList();

        // 🔹 userId -> profileImage("popo1"~"popo4") 맵 (effectively final로 만들기)
        final Map<Long, String> profileImageMap;
        if (!allUserIds.isEmpty()) {
            List<UserProfileDto> profileDtos =
                    userServiceClient.getUserProfiles(new UserProfileRequest(allUserIds));

            profileImageMap = profileDtos.stream()
                    .collect(Collectors.toMap(
                            UserProfileDto::id,
                            UserProfileDto::profileImage
                    ));
        } else {
            profileImageMap = Collections.emptyMap();
        }

        // 4) WorkspaceSimpleResponse로 매핑 (profiles 채우기)
        List<WorkspaceSimpleResponse> content = pageWorkspaces.stream()
                .map(w -> {
                    List<Long> memberIds = workspaceUserMap.getOrDefault(w.getId(), List.of());

                    List<String> profiles = memberIds.stream()
                            .map(uid -> profileImageMap.getOrDefault(uid, "popo1"))
                            .toList();

                    // 🔹 썸네일 presigned URL 생성 (DB에는 key, 응답에는 URL)
                    String thumbnailUrl = workspaceThumbnailService.generateThumbnailPresignedUrl(
                            w.getThumbnail(),
                            java.time.Duration.ofMinutes(10)
                    );

                    return WorkspaceSimpleResponse.fromWithThumbnailUrl(w, profiles, thumbnailUrl);
                })
                .toList();

        Long nextCursor = hasNext && !content.isEmpty()
                ? content.getLast().id()
                : null;

        return WorkspaceCursorResponse.of(content, nextCursor, hasNext);
    }





    @Transactional
    public void delete(Long workspaceId, Long userId) {
        // 1. 워크스페이스 존재 확인
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 2. 멤버 여부 확인
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER));

        // 3. 역할에 따른 분기
        if (member.getRole() == WorkspaceRole.MAINTAINER) {
            // MAINTAINER인 경우: 워크스페이스 전체 삭제

            // (1) 멤버 전체 삭제
            workspaceMemberRepository.deleteByWorkspaceId(workspaceId);

            // (2) TODO: Mindmap-Service에 workspaceId의 모든 마인드맵 노드 삭제 요청
            // mindmapClient.deleteAllNodesByWorkspaceId(workspaceId);

            // (3) 워크스페이스 삭제
            workspaceRepository.delete(workspace);

        } else {
            // MAINTAINER가 아닌 경우: 워크스페이스 나가기 (본인만 탈퇴)
            workspaceMemberRepository.delete(member);

            // 나간 뒤 남은 인원 수 확인
            long remaining = workspaceMemberRepository.countByWorkspaceId(workspaceId);

            if (remaining == 0) {
                // 아무도 안 남았으면 워크스페이스 삭제 + 마인드맵 정리
                // mindmapClient.deleteAllNodesByWorkspaceId(workspaceId);
                workspaceRepository.delete(workspace);
            } else if (remaining == 1) {
                // 한 명만 남았으면 PERSONAL로 변경 (TEAM일 때만 바꿔도 됨)
                if (workspace.getType() != WorkspaceType.PERSONAL) {
                    workspace.changeType(WorkspaceType.PERSONAL);
                    // @Transactional + 영속 상태라 save() 안 해도 dirty checking으로 반영됨
                }
            }
        }
    }



    // 토큰으로 워크스페이스 참여
    public WorkspaceJoinResponse joinByToken(String token, Long userId) {
        // 1. 토큰으로 워크스페이스 찾기
        Workspace workspace = workspaceRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INVALID_INVITE_TOKEN));

        // 2. 이미 멤버인지 확인
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId)) {
            return new WorkspaceJoinResponse(workspace.getId());
        }

        // 3. 최대 인원 체크
        long currentMemberCount = workspaceMemberRepository.countByWorkspaceId(workspace.getId());
        if (currentMemberCount >= MAX_MEMBERS) {
            throw new BadRequestException(ErrorCode.WORKSPACE_FULL);
        }

        // 4. 멤버 추가 (기본 권한: VIEW)
        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .userId(userId)
                .role(WorkspaceRole.VIEW)
                .pointerColor(PointerColor.randomColor())
                .build();

        if(workspace.getType() == WorkspaceType.PERSONAL){
            workspace.changeType(WorkspaceType.TEAM);
            workspaceRepository.save(workspace);
        }
        workspaceMemberRepository.save(newMember);

        return new WorkspaceJoinResponse(workspace.getId());
    }

    public List<WorkspaceSimpleResponse> getAllMyWorkspacesForMobile(Long userId) {
        List<Workspace> workspaces = workspaceRepository.findAllMyRecentWorkspaces(userId);

        return workspaces.stream()
                .map(w -> {
                    // 모바일은 profiles 사용 안하니까 그냥 빈 리스트 또는 기본값
                    List<String> profiles = List.of();

                    String thumbnailUrl = workspaceThumbnailService.generateThumbnailPresignedUrl(
                            w.getThumbnail(),
                            java.time.Duration.ofMinutes(10)
                    );

                    return WorkspaceSimpleResponse.fromWithThumbnailUrl(w, profiles, thumbnailUrl);
                })
                .toList();
    }


    /**
     * Public 워크스페이스 ID 목록 조회
     */
    public List<Long> getPublicWorkspaceIds() {
        log.debug("[WorkspacePublicService] Fetching public workspace IDs");

        List<Long> ids = workspaceRepository.findIdsByVisibility(WorkspaceVisibility.PUBLIC);

        log.debug("[WorkspacePublicService] Found {} public workspaces", ids.size());

        return ids;
    }

    @Transactional(readOnly = true)
    public String getVisibilityOnly(Long workspaceId) {
        return workspaceRepository.findVisibilityById(workspaceId)
                .map(WorkspaceVisibilityView::getVisibility)
                .orElseThrow(() -> new WorkspaceNotFoundException(workspaceId));
    }

    /**
     * 워크스페이스 제목만 업데이트 (내부용)
     * mindmap-service에서 AI가 생성한 제목으로 업데이트할 때 사용
     */
    @Transactional
    public void updateTitleOnly(Long workspaceId, String title) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new WorkspaceNotFoundException(workspaceId));

        workspace.changeTitle(title);
        workspaceRepository.save(workspace);

        log.info("Updated workspace title: workspaceId={}, title={}", workspaceId, title);
    }

    /**
     * 월별 활성 날짜 조회 (웹 전용)
     * 내가 멤버인 워크스페이스들 중 마인드맵 노드가 존재하는 워크스페이스의 생성 날짜만 반환
     */
    @Transactional(readOnly = true)
    public List<String> getActivityDays(Long userId, String month) {
        // month 형식: "2025-11"
        String[] parts = month.split("-");
        if (parts.length != 2) {
            throw new BadRequestException(ErrorCode.INVALID_INPUT_VALUE);
        }

        int year = Integer.parseInt(parts[0]);
        int monthValue = Integer.parseInt(parts[1]);

        if (monthValue < 1 || monthValue > 12) {
            throw new BadRequestException(ErrorCode.INVALID_INPUT_VALUE);
        }

        log.debug("Fetching activity days for userId={}, year={}, month={}", userId, year, monthValue);

        // 1. 해당 월에 생성된 내 워크스페이스들을 조회
        List<Workspace> workspacesInMonth = workspaceRepository.findWorkspacesByUserAndMonth(userId, year, monthValue);

        if (workspacesInMonth.isEmpty()) {
            log.debug("No workspaces found for userId={} in month {}-{}", userId, year, monthValue);
            return List.of();
        }

        log.debug("Found {} workspaces for userId={} in month {}-{}", workspacesInMonth.size(), userId, year, monthValue);

        // 2. 워크스페이스 ID 목록 추출
        List<Long> workspaceIds = workspacesInMonth.stream()
                .map(Workspace::getId)
                .toList();

        log.info("Workspace IDs in month {}-{}: {}", year, monthValue, workspaceIds);

        // 3. 마인드맵 서비스에 노드가 존재하는 워크스페이스 ID 목록 요청
        List<Long> workspaceIdsWithNodes;
        try {
            workspaceIdsWithNodes = mindmapClient.getWorkspaceIdsWithNodes(workspaceIds);
            log.info("Workspace IDs with nodes: {}", workspaceIdsWithNodes);
            log.debug("Found {} workspaces with nodes out of {}", workspaceIdsWithNodes.size(), workspaceIds.size());
        } catch (Exception e) {
            log.error("Failed to fetch workspace IDs with nodes from mindmap-service: {}", e.getMessage(), e);
            // 마인드맵 서비스 호출 실패 시 빈 목록 반환
            return List.of();
        }

        if (workspaceIdsWithNodes.isEmpty()) {
            log.debug("No workspaces with nodes found for userId={} in month {}-{}", userId, year, monthValue);
            return List.of();
        }

        // Integer 일자를 yyyy-MM-dd 형식으로 변환하되, 노드가 있는 워크스페이스의 날짜만 포함
        return workspacesInMonth.stream()
                .filter(workspace -> workspaceIdsWithNodes.contains(workspace.getId()))
                .map(workspace -> {
                    LocalDateTime createdAt = workspace.getCreatedAt();
                    return String.format("%04d-%02d-%02d",
                            createdAt.getYear(),
                            createdAt.getMonthValue(),
                            createdAt.getDayOfMonth());
                })
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * 특정 날짜의 나의 키워드 Top 10 조회 (모바일/웹 공통)
     * 해당 날짜에 생성된 워크스페이스들의 노드 키워드를 랜덤으로 최대 10개 반환
     */
    @Transactional(readOnly = true)
    public List<String> getActivityKeywords(Long userId, LocalDate date) {
        // LocalDate를 LocalDateTime으로 변환 (해당 날짜 00:00:00)
        LocalDateTime dateTime = date.atStartOfDay();

        log.debug("Fetching activity keywords for userId={}, date={}", userId, date);

        // 1. 해당 날짜에 생성된 내 워크스페이스 ID 목록 조회
        List<Long> workspaceIds = workspaceRepository.findWorkspaceIdsByUserAndDate(userId, dateTime);

        if (workspaceIds.isEmpty()) {
            log.debug("No workspaces found for userId={} on date={}", userId, date);
            return List.of();
        }

        log.debug("Found {} workspaces for userId={} on date={}", workspaceIds.size(), userId, date);

        try {
            // 2. Mindmap Service에서 해당 워크스페이스들의 모든 키워드 조회
            List<String> allKeywords = mindmapClient.getKeywordsByWorkspaceIds(workspaceIds);

            if (allKeywords.isEmpty()) {
                log.debug("No keywords found for workspaces: {}", workspaceIds);
                return List.of();
            }

            // 3. 랜덤으로 섞은 후 최대 10개만 선택
            List<String> shuffled = new ArrayList<>(allKeywords);
            Collections.shuffle(shuffled);
            List<String> result = shuffled.stream()
                    .limit(10)
                    .toList();

            log.debug("Returning {} keywords out of {} total", result.size(), allKeywords.size());
            return result;

        } catch (Exception e) {
            log.error("Failed to fetch keywords from mindmap-service: {}", e.getMessage());
            return List.of();
        }
    }


    public void changeTheme(Long workspaceId, Long requestUserId, WorkspaceTheme newTheme) {
        // 1. 워크스페이스 존재 확인
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 2. 요청자 멤버 여부 및 권한 확인
        WorkspaceMember requestMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, requestUserId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER));

        // 3. 테마 변경
        workspace.changeTheme(newTheme); // 엔티티에 이 메서드 있어야 함
        // @Transactional + 영속 상태 → save() 호출 없이 더티 체킹으로 반영
    }
}