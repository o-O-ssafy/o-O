package com.ssafy.userservice.service;

import com.ssafy.userservice.domain.ProfileImage;
import com.ssafy.userservice.domain.User;
import com.ssafy.userservice.domain.Platform;
import com.ssafy.userservice.domain.TokenCategory;
import com.ssafy.userservice.exception.InvalidTokenException;
import com.ssafy.userservice.exception.TokenExpiredException;
import com.ssafy.userservice.exception.TokenNotFoundException;
import com.ssafy.userservice.exception.UserNotFoundException;
import com.ssafy.userservice.security.JwtUtil;
import com.ssafy.userservice.repository.UserRepository;
import com.ssafy.userservice.util.GoogleTokenVerifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    @Transactional
    public Map<String, String> reissueTokens(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        if (jwtUtil.isExpired(refreshToken)) {
            throw new TokenExpiredException("Refresh token expired");
        }

        // 카테고리 확인
        if (!TokenCategory.REFRESH.getValue().equals(jwtUtil.getCategory(refreshToken))) {
            throw new InvalidTokenException("Invalid refresh token category");
        }

        Long userId = jwtUtil.getUserId(refreshToken);
        String role = jwtUtil.getRole(refreshToken);
        String platformStr = jwtUtil.getPlatform(refreshToken);
        Platform platform = Platform.fromString(platformStr);

        log.info("Reissuing tokens for userId: {}, platform: {}", userId, platformStr);
        // Redis 조회
        String storedToken = refreshTokenService.findRefreshToken(userId, platformStr);
        if (storedToken == null) {
            throw new TokenNotFoundException("Refresh token not found in storage");
        }
        if (!storedToken.equals(refreshToken)) {
            throw new InvalidTokenException("Refresh token mismatch");
        }

        // 새로운 JWT 생성
        String newAccessToken =
                jwtUtil.generateToken(TokenCategory.ACCESS, userId, role, platform, accessTokenExpiration);

        String newRefreshToken =
                jwtUtil.generateToken(TokenCategory.REFRESH, userId, role, platform, refreshTokenExpiration);

        Long ttlSeconds = refreshTokenExpiration / 1000;

        refreshTokenService.saveRefreshToken(userId, platformStr, newRefreshToken, ttlSeconds);

        return Map.of(
                "accessToken", newAccessToken,
                "refreshToken", newRefreshToken
        );
    }

    @Transactional
    public void logout(Long userId, String platform) {
        // Null 체크
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        validateAndConvertPlatform(platform);  // 플랫폼 검증

        // Redis에서 Refresh Token 삭제
        refreshTokenService.deleteRefreshToken(userId, platform);
    }

    private Platform validateAndConvertPlatform(String platformStr) {
        return Platform.fromString(platformStr);
    }

    @Transactional
    public Map<String, Object> loginWithGoogleIdToken(String idToken, String platform)
            throws GeneralSecurityException, IOException {
        // Null 체크 및 플랫폼 검증
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("ID token is required");
        }
        Platform platformEnum = validateAndConvertPlatform(platform);

        // Google ID Token 검증 및 사용자 정보 추출
        Map<String, Object> userInfo = googleTokenVerifier.verifyAndExtract(idToken);

        // 필수 정보 추출 및 NULL 체크
        String providerId = (String) userInfo.get("sub");
        if (providerId == null || providerId.isBlank()) {
            throw new IllegalArgumentException("Provider ID (sub) not found in ID token");
        }

        String email = (String) userInfo.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email not found in ID token");
        }

        // 이메일 인증 여부 확인 (Google에서 이메일 소유권 검증 완료 여부)
        Boolean emailVerified = (Boolean) userInfo.get("email_verified");
        if (emailVerified == null || !emailVerified) {
            log.warn("Email not verified for providerId: {}, email: {}", providerId, email);
            throw new IllegalArgumentException("Email not verified by Google");
        }

        // 선택적 정보 (NULL 허용)
        String name = (String) userInfo.get("name");

        // 사용자 조회 또는 생성
        User user = userRepository.findByProviderId(providerId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .nickname(name != null ? name : email.split("@")[0])  // name이 없으면 이메일 앞부분 사용
                            .profileImage(ProfileImage.POPO1)  // 기본 프로필 이미지
                            .providerId(providerId)
                            .role(User.Role.USER)
                            .build();
                    User savedUser = userRepository.save(newUser);
                    log.info("Created new user with providerId: {}", providerId);
                    return savedUser;
                });

        Long userId = user.getId();
        String role = user.getRole().name();

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateToken(TokenCategory.ACCESS, userId, role, platformEnum, accessTokenExpiration);
        String refreshToken = jwtUtil.generateToken(TokenCategory.REFRESH, userId, role, platformEnum, refreshTokenExpiration);

        // Refresh Token Redis 저장
        Long ttlSeconds = refreshTokenExpiration / 1000;  // milliseconds to seconds
        refreshTokenService.saveRefreshToken(userId, platform, refreshToken, ttlSeconds);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "userId", userId
        );
    }

    @Transactional(readOnly = true)
    public String issueAccessToken(Long userId, String platform) {
        // Null 체크 및 플랫폼 검증
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        Platform platformEnum = validateAndConvertPlatform(platform);

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.ssafy.userservice.exception.UserNotFoundException("User not found with id: " + userId));

        String role = user.getRole().name();

        // Access Token만 생성
        return jwtUtil.generateToken(TokenCategory.ACCESS, userId, role, platformEnum, accessTokenExpiration);
    }

    @Transactional(readOnly = true)
    public String issueWebSocketToken(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        String role = user.getRole().name();

        Long wsTokenExpiration = 60000L; // 1분 = 60,000ms
        return jwtUtil.generateToken(TokenCategory.WEBSOCKET, userId, role, Platform.WEB, wsTokenExpiration);
    }
}
