package com.ssafy.gatewayservice.util;

import com.ssafy.gatewayservice.constant.FilterConstants;

import java.util.List;
import java.util.regex.Matcher;

/**
 * 경로 매칭 관련 유틸리티 클래스
 */
public class PathMatcherUtil {

    /**
     * 제외 경로 목록 중 하나라도 매칭되는지 확인
     *
     * @param path 요청 경로
     * @param excludedPaths 제외 경로 목록
     * @return 제외 경로인 경우 true
     */
    public static boolean isExcludedPath(String path, List<String> excludedPaths) {
        return excludedPaths.stream().anyMatch(path::startsWith);
    }

    /**
     * WebSocket 경로인지 확인
     *
     * @param path 요청 경로
     * @return WebSocket 경로인 경우 true
     */
    public static boolean isWebSocketPath(String path) {
        return path.startsWith(FilterConstants.MINDMAP_WS_PATH)
                || path.startsWith(FilterConstants.MINDMAP_VOICE_PATH);
    }

    /**
     * URL path에서 workspace ID 추출
     * Y.js WebSocket은 room name을 URL path에 포함시킴
     *
     * @param path 요청 경로
     * @return workspace ID (없으면 null)
     * @example /mindmap/ws/workspace:123 -> "123"
     */
    public static String extractWorkspaceFromPath(String path) {
        Matcher matcher = FilterConstants.WORKSPACE_PATH_PATTERN.matcher(path);
        return matcher.find() ? matcher.group(1) : null;
    }

    /**
     * path에 workspace ID가 포함되어 있는지 확인
     *
     * @param path 요청 경로
     * @return workspace ID가 path에 포함되어 있으면 true
     */
    public static boolean hasWorkspaceInPath(String path) {
        return path.contains("workspace:");
    }

    private PathMatcherUtil() {
        // 유틸리티 클래스는 인스턴스화 방지
    }
}