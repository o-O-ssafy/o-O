package com.ssafy.userservice.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;
import org.springframework.web.util.WebUtils;

import java.util.Base64;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int COOKIE_EXPIRE_SECONDS = 180; // 3분

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
        if (cookie == null) {
            return null;
        }
        return deserialize(cookie.getValue());
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookies(request, response);
            return;
        }

        // OAuth2 인가 요청 정보를 쿠키에 저장
        String serializedRequest = serialize(authorizationRequest);
        ResponseCookie authRequestCookie = ResponseCookie.from(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, serializedRequest)
                .maxAge(COOKIE_EXPIRE_SECONDS)
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax") // OAuth2 redirect를 위해 Lax 사용
                .build();
        response.addHeader("Set-Cookie", authRequestCookie.toString());

        // 프론트엔드 redirect_uri를 쿠키에 저장 (쿼리 파라미터에서 가져옴)
        String redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isBlank()) {
            ResponseCookie redirectUriCookie = ResponseCookie.from(REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin)
                    .maxAge(COOKIE_EXPIRE_SECONDS)
                    .path("/")
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .build();
            response.addHeader("Set-Cookie", redirectUriCookie.toString());
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        if (authorizationRequest != null) {
            deleteCookies(request, response);
        }
        return authorizationRequest;
    }

    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        deleteCookies(request, response);
    }

    private void deleteCookies(HttpServletRequest request, HttpServletResponse response) {
        // OAuth2 인가 요청 쿠키 삭제
        ResponseCookie deleteAuthCookie = ResponseCookie.from(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, "")
                .maxAge(0)
                .path("/")
                .build();
        response.addHeader("Set-Cookie", deleteAuthCookie.toString());

        // redirect_uri 쿠키 삭제
        ResponseCookie deleteRedirectCookie = ResponseCookie.from(REDIRECT_URI_PARAM_COOKIE_NAME, "")
                .maxAge(0)
                .path("/")
                .build();
        response.addHeader("Set-Cookie", deleteRedirectCookie.toString());
    }

    private String serialize(OAuth2AuthorizationRequest authorizationRequest) {
        return Base64.getUrlEncoder().encodeToString(
                SerializationUtils.serialize(authorizationRequest)
        );
    }

    private OAuth2AuthorizationRequest deserialize(String cookie) {
        return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(cookie)
        );
    }
}