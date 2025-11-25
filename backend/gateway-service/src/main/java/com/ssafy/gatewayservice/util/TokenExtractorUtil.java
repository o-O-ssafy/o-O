package com.ssafy.gatewayservice.util;

import com.ssafy.gatewayservice.constant.FilterConstants;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

/**
 * JWT 토큰 추출 관련 유틸리티 클래스
 */
public class TokenExtractorUtil {

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     *
     * @param request ServerHttpRequest
     * @return JWT 토큰 (없으면 null)
     */
    public static String extractBearerToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst(FilterConstants.HEADER_AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(FilterConstants.BEARER_PREFIX)) {
            return bearerToken.substring(FilterConstants.BEARER_PREFIX_LENGTH);
        }
        return null;
    }

    /**
     * 쿼리 파라미터에서 토큰 추출
     *
     * @param queryParams 쿼리 파라미터 맵
     * @return JWT 토큰 (없으면 null)
     */
    public static String extractQueryParamToken(MultiValueMap<String, String> queryParams) {
        return queryParams.getFirst(FilterConstants.QUERY_PARAM_TOKEN);
    }

    /**
     * 토큰이 유효한지 확인 (null 또는 빈 문자열 체크)
     *
     * @param token JWT 토큰
     * @return 유효한 토큰이면 true
     */
    public static boolean isValidToken(String token) {
        return StringUtils.hasText(token);
    }

    private TokenExtractorUtil() {
        // 유틸리티 클래스는 인스턴스화 방지
    }
}