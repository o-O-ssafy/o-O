// com.ssafy.mindmapservice.service.NodeRestructureJobService
package com.ssafy.mindmapservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NodeRestructureJobService {

    private final NodeAiService nodeAiService;

    /**
     * 워크스페이스 정리 작업을 백그라운드에서 실행
     */
    @Async
    public void runRestructure(Long workspaceId) {
        log.info("[ASYNC] Start restructure for workspace {}", workspaceId);
        try {
            nodeAiService.restructureWorkspace(workspaceId);
            log.info("[ASYNC] Restructure finished for workspace {}", workspaceId);
        } catch (Exception e) {
            log.error("[ASYNC] Restructure failed for workspace {}", workspaceId, e);
        }
    }
}
