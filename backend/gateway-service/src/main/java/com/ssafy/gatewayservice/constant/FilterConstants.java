package com.ssafy.gatewayservice.constant;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Gateway 필터에서 사용하는 상수 모음
 */
public class FilterConstants {

    // ========== HTTP Headers ==========
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String HEADER_USER_ID = "X-USER-ID";
    public static final String HEADER_WORKSPACE_ID = "X-Workspace-ID";
    public static final String HEADER_CORRELATION_ID = "X-Correlation-ID";

    // ========== Token ==========
    public static final String BEARER_PREFIX = "Bearer ";
    public static final int BEARER_PREFIX_LENGTH = 7;

    // ========== Query Parameters ==========
    public static final String QUERY_PARAM_TOKEN = "token";
    public static final String QUERY_PARAM_WORKSPACE = "workspace";

    // ========== WebSocket Paths ==========
    public static final String MINDMAP_WS_PATH = "/mindmap/ws";
    public static final String MINDMAP_VOICE_PATH = "/mindmap/voice";

    // ========== JWT Excluded Paths ==========
    public static final List<String> JWT_EXCLUDED_PATHS = Arrays.asList(
            "/auth/app/google-login",
            "/oauth2/authorization/google",
            "/auth/issue-token",
            "/login/oauth2/",
            "/auth/reissue",
            "/actuator",
            "/health",
            "/swagger-ui",
            "/v3/api-docs",
            "/user-service/v3/api-docs",
            "/workspace-service/v3/api-docs",
            "/mindmap-service/v3/api-docs",
            "/trend-service/v3/api-docs",
            "/webjars",
            "/mindmap/ws",  // WebSocket 경로 (WebSocketQueryParamFilter에서 처리)
            "/mindmap/voice",
            "/trend/top",
            "/trend/search",
            "/trend"
    );

    // ========== Error Messages ==========
    public static final String MSG_NO_TOKEN = "인증 토큰이 없습니다.";
    public static final String MSG_TOKEN_REQUIRED = "토큰이 필요합니다.";
    public static final String MSG_INVALID_TOKEN = "유효하지 않은 토큰입니다.";
    public static final String MSG_SERVER_ERROR = "서버 오류가 발생했습니다.";

    // ========== Regex Patterns ==========
    /**
     * Y.js WebSocket workspace ID 추출 패턴
     * 예: /mindmap/ws/workspace:123 -> "123"
     */
    public static final Pattern WORKSPACE_PATH_PATTERN =
            Pattern.compile("/(?:mindmap/)?ws/workspace:(\\d+)");

    // ========== Filter Order ==========
    public static final int WEBSOCKET_FILTER_ORDER = -200;
    public static final int JWT_FILTER_ORDER = -100;

    // ========== Log Prefixes ==========
    public static final String LOG_PREFIX_JWT_FILTER = "JWT Filter";
    public static final String LOG_PREFIX_WEBSOCKET_FILTER = "WebSocket Filter";

    private FilterConstants() {
        // 유틸리티 클래스는 인스턴스화 방지
    }
}