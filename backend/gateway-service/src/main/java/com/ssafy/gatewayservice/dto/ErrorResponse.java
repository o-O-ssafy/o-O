package com.ssafy.gatewayservice.dto;

/**
 * Gateway 에러 응답 DTO (Record 버전)
 */
public record ErrorResponse(
        boolean success,
        String message,
        Object data
) {

    /**
     * 에러 응답 생성 (데이터 없음)
     */
    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message, null);
    }

    /**
     * 에러 응답 생성 (데이터 포함)
     */
    public static ErrorResponse of(String message, Object data) {
        return new ErrorResponse(false, message, data);
    }
}