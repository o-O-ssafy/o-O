package com.ssafy.gatewayservice.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.gatewayservice.constant.FilterConstants;
import com.ssafy.gatewayservice.jwt.JwtException;
import com.ssafy.gatewayservice.jwt.JwtTokenValidator;
import com.ssafy.gatewayservice.util.GatewayResponseUtil;
import com.ssafy.gatewayservice.util.PathMatcherUtil;
import com.ssafy.gatewayservice.util.TokenExtractorUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 웹소켓 연결 시 쿼리 파라미터 또는 URL path를 헤더로 변환하는 필터
 *
 * 지원하는 WebSocket 타입:
 * 1. Y.js WebSocket (URL path): /mindmap/ws/workspace:123?token=xxx
 * 2. WebRTC Voice (Query param): /mindmap/voice?workspace=123&token=xxx
 *
 * -> 헤더에 X-Workspace-ID: 123, X-USER-ID: userId 추가
 */
@Slf4j
@Component
public class WebSocketQueryParamFilter implements GlobalFilter, Ordered {

    private final JwtTokenValidator jwtTokenValidator;
    private final ObjectMapper objectMapper;

    public WebSocketQueryParamFilter(JwtTokenValidator jwtTokenValidator, ObjectMapper objectMapper) {
        this.jwtTokenValidator = jwtTokenValidator;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 웹소켓 경로가 아니면 필터 통과
        if (!PathMatcherUtil.isWebSocketPath(path)) {
            return chain.filter(exchange);
        }

        try {
            ServerHttpRequest mutatedRequest = buildAuthenticatedRequest(request, path);
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (JwtException e) {
            return handleJwtException(exchange, path, e);
        } catch (Exception e) {
            return handleUnexpectedException(exchange, path, e);
        }
    }

    /**
     * 인증된 요청 빌드 (workspace ID, user ID 헤더 추가)
     */
    private ServerHttpRequest buildAuthenticatedRequest(ServerHttpRequest request, String path) {
        MultiValueMap<String, String> queryParams = request.getQueryParams();
        ServerHttpRequest.Builder builder = request.mutate();

        // workspace ID 헤더 추가
        addWorkspaceHeader(builder, path, queryParams);

        // user ID 헤더 추가
        String userId = extractAndValidateUserId(queryParams);
        builder.header(FilterConstants.HEADER_USER_ID, userId);
        log.debug("[{}] Added {} header: {}",
                FilterConstants.LOG_PREFIX_WEBSOCKET_FILTER,
                FilterConstants.HEADER_USER_ID,
                userId);

        return builder.build();
    }

    /**
     * workspace ID 헤더 추가
     */
    private void addWorkspaceHeader(
            ServerHttpRequest.Builder builder,
            String path,
            MultiValueMap<String, String> queryParams
    ) {
        String workspace = extractWorkspaceId(path, queryParams);
        if (workspace != null) {
            builder.header(FilterConstants.HEADER_WORKSPACE_ID, workspace);
            String source = PathMatcherUtil.hasWorkspaceInPath(path) ? "path" : "query";
            log.debug("[{}] Added {} header: {} (source: {})",
                    FilterConstants.LOG_PREFIX_WEBSOCKET_FILTER,
                    FilterConstants.HEADER_WORKSPACE_ID,
                    workspace,
                    source);
        }
    }

    /**
     * workspace ID 추출
     * - Y.js WebSocket: URL path에서 추출 (/mindmap/ws/workspace:123)
     * - WebRTC Voice: 쿼리 파라미터에서 추출 (/mindmap/voice?workspace=123)
     */
    private String extractWorkspaceId(String path, MultiValueMap<String, String> queryParams) {
        String fromPath = PathMatcherUtil.extractWorkspaceFromPath(path);
        return fromPath != null ? fromPath : queryParams.getFirst(FilterConstants.QUERY_PARAM_WORKSPACE);
    }

    /**
     * 토큰 검증 및 userId 추출
     */
    private String extractAndValidateUserId(MultiValueMap<String, String> queryParams) {
        String token = TokenExtractorUtil.extractQueryParamToken(queryParams);

        if (!TokenExtractorUtil.isValidToken(token)) {
            throw new JwtException(FilterConstants.MSG_TOKEN_REQUIRED);
        }

        // JWT 토큰 검증 (만료시간 포함)
        jwtTokenValidator.validateToken(token);

        // userId 추출
        String userId = jwtTokenValidator.getUserId(token);
        if (userId == null) {
            throw new JwtException(FilterConstants.MSG_INVALID_TOKEN);
        }

        return userId;
    }

    /**
     * JWT 예외 처리
     */
    private Mono<Void> handleJwtException(ServerWebExchange exchange, String path, JwtException e) {
        log.error("[{}] JWT Exception - Path: {}, Error: {}",
                FilterConstants.LOG_PREFIX_WEBSOCKET_FILTER, path, e.getMessage());
        return GatewayResponseUtil.sendErrorResponse(
                exchange, HttpStatus.UNAUTHORIZED, e.getMessage(), objectMapper
        );
    }

    /**
     * 예상치 못한 예외 처리
     */
    private Mono<Void> handleUnexpectedException(ServerWebExchange exchange, String path, Exception e) {
        log.error("[{}] Unexpected Exception - Path: {}, Type: {}, Message: {}",
                FilterConstants.LOG_PREFIX_WEBSOCKET_FILTER,
                path,
                e.getClass().getName(),
                e.getMessage(),
                e);
        return GatewayResponseUtil.sendErrorResponse(
                exchange, HttpStatus.INTERNAL_SERVER_ERROR, FilterConstants.MSG_SERVER_ERROR, objectMapper
        );
    }

    @Override
    public int getOrder() {
        return FilterConstants.WEBSOCKET_FILTER_ORDER;
    }
}
