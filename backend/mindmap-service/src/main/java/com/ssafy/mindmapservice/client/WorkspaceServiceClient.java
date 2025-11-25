package com.ssafy.mindmapservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "workspace-service", url = "${workspace.service.url:http://localhost:8083}")
public interface WorkspaceServiceClient {

    /**
     * 워크스페이스 생성
     * @param userId 사용자 ID (X-USER-ID 헤더로 전송)
     * @param startPrompt 초기 프롬프트 (STT 텍스트 등, optional)
     * @return 워크스페이스 응답 (workspaceId 포함)
     */
    @PostMapping("/workspace")
    Map<String, Object> createWorkspace(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody(required = false) String startPrompt
    );

    /**
     * 워크스페이스 가시성 조회 (PUBLIC/PRIVATE)
     */
    @GetMapping("/workspace/{workspaceId}/visibility")
    Map<String, Object> getVisibility(@PathVariable("workspaceId") Long workspaceId);

    /**
     * 모든 Public 워크스페이스 ID 목록 조회
     */
    @GetMapping("/workspace/workspace-ids")
    Map<String, List<Integer>> getPublicWorkspaceIds();

    /**
     * 워크스페이스 제목 업데이트
     */
    @PatchMapping("/workspace/{workspaceId}")
    void updateWorkspaceTitle(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable("workspaceId") Long workspaceId,
            @RequestBody Map<String, Object> request
    );

    /**
     * 워크스페이스 제목 업데이트 (내부용 - userId 불필요)
     * AI가 생성한 제목으로 업데이트할 때 사용
     */
    @PutMapping("/workspace/internal/{workspaceId}/title")
    void updateWorkspaceTitleInternal(
            @PathVariable("workspaceId") Long workspaceId,
            @RequestBody String title
    );
}
