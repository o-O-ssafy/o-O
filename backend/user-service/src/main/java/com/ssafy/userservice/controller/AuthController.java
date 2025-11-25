package com.ssafy.userservice.controller;

import com.ssafy.userservice.dto.GoogleIdTokenRequest;
import com.ssafy.userservice.service.AuthService;
import com.ssafy.userservice.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@Tag(name = "인증 API", description = "로그인, 로그아웃, 토큰 재발급 API")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "토큰 재발급", description = "Refresh Token을 이용하여 Access Token과 Refresh Token을 재발급합니다 (RTR 방식)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공 (Authorization 헤더에 새 Access Token, Set-Cookie 헤더에 새 Refresh Token 반환)"),
            @ApiResponse(responseCode = "401", description = "유효하지 않거나 만료된 Refresh Token", content = @Content)
    })
    @PostMapping("/reissue")
    public ResponseEntity<Void> reissue(@CookieValue("refreshToken") String refreshToken) {
        log.info("POST /auth/reissue - Refresh Token: {}", refreshToken);
        Map<String, String> tokens = authService.reissueTokens(refreshToken);

        String newAccessToken = tokens.get("accessToken");
        String newRefreshToken = tokens.get("refreshToken");

        // Access Token: Authorization 헤더
        // Refresh Token: HttpOnly 쿠키 (RTR 적용)
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken)
                .header(HttpHeaders.SET_COOKIE, CookieUtil.createRefreshTokenCookie(newRefreshToken).toString())
                .build();
    }

    @Operation(summary = "로그아웃", description = "사용자를 로그아웃하고 Refresh Token을 무효화합니다")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(hidden = true)
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("Client-Type") String platform) {
        log.info("POST /auth/logout - Logging out userId: {}, platform: {}", userId, platform);
        authService.logout(userId, platform);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, CookieUtil.deleteRefreshTokenCookie().toString())
                .build();
    }

    @Operation(summary = "모바일 구글 로그인", description = "Google ID Token을 이용한 모바일 로그인 (앱 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공 (Authorization 헤더에 Access Token, Set-Cookie 헤더에 Refresh Token, Body에 userId 반환)",
                    content = @Content(examples = @ExampleObject(value = "{\"userId\": 1}"))),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 ID Token", content = @Content)
    })
    @SecurityRequirement(name = "")
    @PostMapping("/app/google-login")
    public ResponseEntity<Map<String, Object>> googleLogin(@Valid @RequestBody GoogleIdTokenRequest request)
            throws GeneralSecurityException, IOException {
        log.info("POST /auth/app/google-login - Google login attempt for platform: {}", request.platform());
        Map<String, Object> result = authService.loginWithGoogleIdToken(
                request.idToken(),
                request.platform()
        );

        String accessToken = (String) result.get("accessToken");
        String refreshToken = (String) result.get("refreshToken");
        Long userId = (Long) result.get("userId");

        // Access Token: Authorization 헤더
        // Refresh Token: HttpOnly 쿠키
        // Response Body: userId만 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.SET_COOKIE, CookieUtil.createRefreshTokenCookie(refreshToken).toString())
                .body(Map.of("userId", userId));
    }

    @Operation(summary = "Access Token 발급 (개발용)", description = "userId로 Access Token을 JSON으로 발급합니다")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공",
                    content = @Content(examples = @ExampleObject(value = "{\"accessToken\": \"eyJhbGci...\"}"))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", content = @Content)
    })
    @SecurityRequirement(name = "")
    @PostMapping("/issue-token")
    public ResponseEntity<Map<String, String>> issueToken(@RequestParam Long userId, @RequestParam(defaultValue = "web") String platform) {
        log.info("POST /auth/issue-token - Issuing access token for userId: {}, platform: {}", userId, platform);
        String accessToken = authService.issueAccessToken(userId, platform);
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    @Operation(summary = "웹소켓 토큰 발급", description = "웹소켓 연결용 단기 토큰을 발급합니다 (유효시간 1분)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "웹소켓 토큰 발급 성공",
                    content = @Content(examples = @ExampleObject(value = "{\"wsToken\": \"eyJhbGci...\"}"))),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", content = @Content)
    })
    @PostMapping("/ws-token")
    public ResponseEntity<Map<String, String>> issueWebSocketToken(
            @Parameter(hidden = true)
            @RequestHeader("X-User-Id") Long userId) {
        log.info("POST /auth/ws-token - Issuing WebSocket token for userId: {}", userId);
        String wsToken = authService.issueWebSocketToken(userId);
        return ResponseEntity.ok(Map.of("wsToken", wsToken));
    }
}
