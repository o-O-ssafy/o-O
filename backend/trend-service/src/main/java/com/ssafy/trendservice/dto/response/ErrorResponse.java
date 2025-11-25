package com.ssafy.trendservice.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 공통 에러 응답 DTO
 */
@Data
@Builder
public class ErrorResponse {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private int status;          // HTTP Status code (e.g. 400, 404, 500)
    private String error;        // "Bad Request", "Not Found", "Internal Server Error"
    private String message;      // 상세 에러 메시지
    private String path;         // 요청 URI
    private String code;         // (선택) 서비스 내부 에러 코드, 예: "TREND-001"
}
