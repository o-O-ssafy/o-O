package com.ssafy.userservice.config;

import com.ssafy.userservice.service.CustomOAuth2UserService;
import com.ssafy.userservice.security.OAuth2SuccessHandler;
import com.ssafy.userservice.security.HttpCookieOAuth2AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // CSRF 비활성화 (JWT 사용)
        http.csrf(AbstractHttpConfigurer::disable);

        // Form 로그인 비활성화
        http.formLogin(AbstractHttpConfigurer::disable);

        // HTTP Basic 인증 비활성화
        http.httpBasic(AbstractHttpConfigurer::disable);

        // 경로별 인가 설정
        http.authorizeHttpRequests(auth -> auth
                // OAuth2 로그인 경로 허용
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                // Auth API 허용 (토큰 재발급, 로그아웃)
                .requestMatchers("/auth/**").permitAll()
                // 나머지는 Gateway에서 검증하므로 모두 허용
                .anyRequest().permitAll()
        );

        // OAuth2 로그인 설정
        http.oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                        .authorizationRequestRepository(cookieAuthorizationRequestRepository)
                )
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2SuccessHandler)
        );

        // 세션 사용 안 함 (Stateless)
        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        http.cors(AbstractHttpConfigurer::disable);  // Gateway에서 처리

        return http.build();
    }
}
