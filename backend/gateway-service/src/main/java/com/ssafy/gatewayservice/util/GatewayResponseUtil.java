package com.ssafy.gatewayservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.gatewayservice.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Gateway 에러 응답 유틸리티 클래스
 */
@Slf4j
public class GatewayResponseUtil {

    /**
     * JSON 형식의 에러 응답 전송
     *
     * @param exchange ServerWebExchange
     * @param status HTTP 상태 코드
     * @param message 에러 메시지
     * @param objectMapper JSON 변환용 ObjectMapper
     * @return Mono<Void>
     */
    public static Mono<Void> sendErrorResponse(
            ServerWebExchange exchange,
            HttpStatus status,
            String message,
            ObjectMapper objectMapper
    ) {
        return sendErrorResponse(exchange, status, message, null, objectMapper);
    }

    /**
     * JSON 형식의 에러 응답 전송 (데이터 포함)
     *
     * @param exchange ServerWebExchange
     * @param status HTTP 상태 코드
     * @param message 에러 메시지
     * @param data 추가 데이터
     * @param objectMapper JSON 변환용 ObjectMapper
     * @return Mono<Void>
     */
    public static Mono<Void> sendErrorResponse(
            ServerWebExchange exchange,
            HttpStatus status,
            String message,
            Object data,
            ObjectMapper objectMapper
    ) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse errorResponse = data == null
                ? ErrorResponse.of(message)
                : ErrorResponse.of(message, data);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize error response, using fallback", e);
            // ObjectMapper 실패 시 fallback
            return sendFallbackErrorResponse(response, message);
        }
    }

    /**
     * ObjectMapper 실패 시 fallback 에러 응답
     *
     * @param response ServerHttpResponse
     * @param message 에러 메시지
     * @return Mono<Void>
     */
    private static Mono<Void> sendFallbackErrorResponse(ServerHttpResponse response, String message) {
        String fallbackJson = String.format(
                "{\"success\":false,\"message\":\"%s\",\"data\":null}",
                escapeJson(message)
        );
        byte[] bytes = fallbackJson.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    /**
     * JSON 문자열 이스케이프 처리
     *
     * @param text 원본 텍스트
     * @return 이스케이프 처리된 텍스트
     */
    private static String escapeJson(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private GatewayResponseUtil() {
        // 유틸리티 클래스는 인스턴스화 방지
    }
}
