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
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * JWT 인증 필터
 * Authorization 헤더의 Bearer 토큰을 검증하고 userId를 추출하여 헤더에 추가
 */
@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtTokenValidator jwtTokenValidator;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(JwtTokenValidator jwtTokenValidator, ObjectMapper objectMapper) {
        this.jwtTokenValidator = jwtTokenValidator;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        log.info("[JWT Filter] Incoming request - {} {}",
                request.getMethod(), request.getURI().getPath());

        // 인증이 필요 없는 경로는 필터 통과
        if (PathMatcherUtil.isExcludedPath(path, FilterConstants.JWT_EXCLUDED_PATHS)) {
            log.info("[JWT Filter] Excluded path → {}", path);
            return chain.filter(exchange);
        }

        try {
            log.info("[JWT Filter] Validating token...");
            ServerHttpRequest mutatedRequest = buildAuthenticatedRequest(request);
            log.info("[JWT Filter] Authentication success → userId: {}",
                    mutatedRequest.getHeaders().getFirst(FilterConstants.HEADER_USER_ID));

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (JwtException e) {
            log.warn("[JWT Filter] JWT Exception - Path: {}, Error: {}", path, e.getMessage());
            return handleJwtException(exchange, path, e);
        } catch (Exception e) {
            log.error("[JWT Filter] Unexpected Exception - Path: {}, Error: {}",
                    path, e.getMessage(), e);
            return handleUnexpectedException(exchange, path, e);
        }
    }

    /**
     * 인증된 요청 빌드 (user ID 헤더 추가)
     */
    private ServerHttpRequest buildAuthenticatedRequest(ServerHttpRequest request) {
        String userId = extractAndValidateUserId(request);

        return request.mutate()
                .header(FilterConstants.HEADER_USER_ID, userId)
                .build();
    }

    /**
     * 토큰 검증 및 userId 추출
     */
    private String extractAndValidateUserId(ServerHttpRequest request) {
        // Authorization 헤더에서 JWT 토큰 추출
        String token = TokenExtractorUtil.extractBearerToken(request);

        if (!TokenExtractorUtil.isValidToken(token)) {
            throw new JwtException(FilterConstants.MSG_NO_TOKEN);
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
                FilterConstants.LOG_PREFIX_JWT_FILTER, path, e.getMessage());
        return GatewayResponseUtil.sendErrorResponse(
                exchange, HttpStatus.UNAUTHORIZED, e.getMessage(), objectMapper
        );
    }

    /**
     * 예상치 못한 예외 처리
     */
    private Mono<Void> handleUnexpectedException(ServerWebExchange exchange, String path, Exception e) {
        log.error("[{}] Unexpected Exception - Path: {}, Type: {}, Message: {}",
                FilterConstants.LOG_PREFIX_JWT_FILTER,
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
        return FilterConstants.JWT_FILTER_ORDER;
    }
}
