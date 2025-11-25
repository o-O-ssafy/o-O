package com.ssafy.userservice.exception;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class AuthExceptionHandler {

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException e) {
        log.warn("Invalid token: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleTokenExpired(TokenExpiredException e) {
        log.warn("Token expired: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.TOKEN_EXPIRED);
        return ResponseEntity.status(ErrorCode.TOKEN_EXPIRED.getStatus()).body(response);
    }

    @ExceptionHandler(TokenNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTokenNotFound(TokenNotFoundException e) {
        log.warn("Token not found: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.TOKEN_NOT_FOUND);
        return ResponseEntity.status(ErrorCode.TOKEN_NOT_FOUND.getStatus()).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e) {
        log.warn("Authentication failed: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.UNAUTHORIZED);
        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getStatus()).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        log.warn("Access denied: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.UNAUTHORIZED);
        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getStatus()).body(response);
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJwt(MalformedJwtException e) {
        log.warn("Malformed JWT: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(UnsupportedJwtException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedJwt(UnsupportedJwtException e) {
        log.warn("Unsupported JWT: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<ErrorResponse> handleSignatureException(SignatureException e) {
        log.warn("JWT signature validation failed: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponse> handleExpiredJwt(ExpiredJwtException e) {
        log.warn("Expired JWT: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.TOKEN_EXPIRED);
        return ResponseEntity.status(ErrorCode.TOKEN_EXPIRED.getStatus()).body(response);
    }

    @ExceptionHandler(PrematureJwtException.class)
    public ResponseEntity<ErrorResponse> handlePrematureJwt(PrematureJwtException e) {
        log.warn("Premature JWT: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException e) {
        log.warn("JWT processing error: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(java.security.GeneralSecurityException.class)
    public ResponseEntity<ErrorResponse> handleGeneralSecurityException(java.security.GeneralSecurityException e) {
        log.warn("Google ID token verification failed: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_TOKEN);
        return ResponseEntity.status(ErrorCode.INVALID_TOKEN.getStatus()).body(response);
    }

    @ExceptionHandler(java.io.IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(java.io.IOException e) {
        log.error("Network error during token verification: {}", e.getMessage(), e);
        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getStatus()).body(response);
    }
}