package com.ssafy.mindmapservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WorkspaceServiceClient를 래핑하는 어댑터 클래스
 * Feign Client 호출을 간소화하고 비즈니스 로직에 맞게 변환합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkspaceServiceClientAdapter {

    private final WorkspaceServiceClient workspaceServiceClient;

    /**
     * 워크스페이스를 생성하고 workspaceId를 반환합니다.
     *
     * @param userId 사용자 ID
     * @param workspaceName STT 텍스트 (startPrompt로 전달됨)
     * @return 생성된 워크스페이스 ID
     */
    public Long createWorkspace(Long userId, String workspaceName) {
        log.debug("Creating workspace via Feign: userId={}, startPrompt={}", userId, workspaceName);

        try {
            // workspaceName을 startPrompt로 전달
            Map<String, Object> response = workspaceServiceClient.createWorkspace(userId, workspaceName);

            // workspaceId 추출 (응답 필드명은 "id")
            Object workspaceIdObj = response.get("id");
            if (workspaceIdObj == null) {
                throw new IllegalStateException("workspaceId not found in response");
            }

            Long workspaceId;
            if (workspaceIdObj instanceof Integer) {
                workspaceId = ((Integer) workspaceIdObj).longValue();
            } else if (workspaceIdObj instanceof Long) {
                workspaceId = (Long) workspaceIdObj;
            } else {
                throw new IllegalStateException("Invalid workspaceId type: " + workspaceIdObj.getClass());
            }

            log.info("Workspace created successfully: workspaceId={}, startPrompt={}", workspaceId, workspaceName);
            return workspaceId;

        } catch (Exception e) {
            log.error("Failed to create workspace: userId={}, startPrompt={}", userId, workspaceName, e);
            throw new RuntimeException("Failed to create workspace", e);
        }
    }

    /**
     * 워크스페이스의 가시성(PUBLIC/PRIVATE)을 조회합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @return 가시성 ("PUBLIC" or "PRIVATE")
     */
    public String getVisibility(Long workspaceId) {
        log.debug("Getting workspace visibility: workspaceId={}", workspaceId);

        try {
            Map<String, Object> response = workspaceServiceClient.getVisibility(workspaceId);
            Object visibility = response.get("visibility");

            if (visibility == null) {
                throw new IllegalStateException("visibility not found in response");
            }

            return visibility.toString();

        } catch (Exception e) {
            log.error("Failed to get workspace visibility: workspaceId={}", workspaceId, e);
            throw new RuntimeException("Failed to get workspace visibility", e);
        }
    }

    /**
     * 워크스페이스의 제목을 업데이트합니다 (내부용).
     * AI 분석 후 생성된 제목으로 워크스페이스를 업데이트할 때 사용됩니다.
     * userId 없이 workspaceId와 title만으로 업데이트합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param title 새로운 제목
     */
    public void updateWorkspaceTitle(Long workspaceId, String title) {
        log.debug("Updating workspace title: workspaceId={}, title={}", workspaceId, title);

        try {
            workspaceServiceClient.updateWorkspaceTitleInternal(workspaceId, title);
            log.info("Workspace title updated successfully: workspaceId={}, title={}",
                    workspaceId, title);

        } catch (Exception e) {
            log.error("Failed to update workspace title: workspaceId={}, title={}",
                    workspaceId, title, e);
            throw new RuntimeException("Failed to update workspace title", e);
        }
    }

    /**
     * Public 워크스페이스 ID 목록을 조회합니다.
     *
     * @return Public 워크스페이스 ID 목록
     */
    public List<Long> getPublicWorkspaceIds() {
        log.debug("Getting public workspace IDs");

        try {
            Map<String, List<Integer>> response = workspaceServiceClient.getPublicWorkspaceIds();
            List<Integer> intList = response.get("workspaceIds");

            if (intList == null) {
                throw new IllegalStateException("workspaceIds not found in response");
            }

            // Integer List를 Long List로 변환
            List<Long> result = intList.stream()
                    .map(Integer::longValue)
                    .toList();

            log.info("Retrieved {} public workspace IDs", result.size());
            return result;

        } catch (Exception e) {
            log.error("Failed to get public workspace IDs", e);
            throw new RuntimeException("Failed to get public workspace IDs", e);
        }
    }

    public boolean isPublic(Long workspaceId) {
        try {
            String vis = getVisibility(workspaceId);
            return "PUBLIC".equalsIgnoreCase(vis);
        } catch (Exception e) {
            // 실패 시 보수적으로 false
            log.error("Failed to get visibility for workspaceId={}", workspaceId, e);
            return false;
        }
    }
}