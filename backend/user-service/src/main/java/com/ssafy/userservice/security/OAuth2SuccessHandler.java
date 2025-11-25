package com.ssafy.userservice.security;

import com.ssafy.userservice.domain.Platform;
import com.ssafy.userservice.domain.TokenCategory;
import com.ssafy.userservice.service.RefreshTokenService;
import com.ssafy.userservice.util.CookieUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    @Value("${oauth2.redirect.frontend-url}")
    private String frontendRedirectUrl;

    // 허용된 redirect URI 목록 (보안을 위한 화이트리스트)
    private static final List<String> ALLOWED_REDIRECT_URIS = List.of(
            "http://localhost:5173",
            "https://www.o-o.io.kr"
    );

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getUserId();
        String role = oAuth2User.getRole();

        // 웹 OAuth2 로그인은 항상 WEB 플랫폼
        Platform platform = Platform.WEB;

        log.info("OAuth2 login success - userId: {}, role: {}, platform: {}", userId, role, platform.getValue());

        // Access Token 생성 (platform 정보 포함)
        String accessToken = jwtUtil.generateToken(TokenCategory.ACCESS, userId, role, platform, accessTokenExpiration);

        // Refresh Token 생성 (platform 정보 포함)
        String refreshToken = jwtUtil.generateToken(TokenCategory.REFRESH, userId, role, platform, refreshTokenExpiration);

        // Refresh Token을 Redis에 저장
        Long ttlSeconds = refreshTokenExpiration / 1000;  // 밀리초를 초로 변환 (TTL은 초 단위)
        refreshTokenService.saveRefreshToken(userId, platform.getValue(), refreshToken, ttlSeconds);

        // Refresh Token은 HttpOnly Cookie로 전달
        ResponseCookie refreshCookie = CookieUtil.createRefreshTokenCookie(refreshToken);
        response.addHeader("Set-Cookie", refreshCookie.toString());

        // 쿠키에서 redirect_uri 읽기 (OAuth2 로그인 시작 시 저장된 값)
        String targetUrl = determineTargetUrl(request, response, accessToken, userId);

        log.info("Redirecting to frontend with JWT tokens for userId: {}", userId);

        // 임시 쿠키 정리
        authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        // 리다이렉트 수행
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                       String accessToken, Long userId) {
        Optional<String> redirectUri = CookieUtil.getCookie(request,
                HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME);

        String baseUrl;
        if (redirectUri.isPresent() && isAuthorizedRedirectUri(redirectUri.get())) {
            baseUrl = redirectUri.get();
            log.info("Using redirect_uri from cookie: {}", baseUrl);
        } else {
            baseUrl = frontendRedirectUrl;
            log.info("Using default frontend redirect URL: {}", baseUrl);
        }

        // /callback 경로 추가
        if (!baseUrl.endsWith("/callback")) {
            baseUrl = baseUrl + "/callback";
        }

        return UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("token", accessToken)
                .queryParam("userId", userId)
                .build()
                .toUriString();
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        // 허용된 URI 목록과 비교 (보안 검증)
        return ALLOWED_REDIRECT_URIS.stream()
                .anyMatch(uri::startsWith);
    }
}
