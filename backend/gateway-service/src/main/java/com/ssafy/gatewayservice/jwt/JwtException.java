package com.ssafy.gatewayservice.jwt;

public class JwtException extends RuntimeException {
    public JwtException(String message) {
        super(message);
    }
}
