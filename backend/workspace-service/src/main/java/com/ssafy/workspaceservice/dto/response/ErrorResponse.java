package com.ssafy.workspaceservice.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.workspaceservice.exception.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "에러 응답")
@Getter
@Builder
public class ErrorResponse {

    @Schema(description = "에러 코드", example = "W001")
    private final String code;

    @Schema(description = "에러 메시지", example = "워크스페이스를 찾을 수 없습니다")
    private final String message;

    @Schema(description = "에러 발생 시간", example = "2025-01-15 14:30:00")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private final LocalDateTime timestamp;

    @Schema(description = "필드 에러 목록")
    private final List<FieldError> errors;

    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> errors) {
        return ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .errors(errors)
                .build();
    }

    @Schema(description = "필드 에러 정보")
    public record FieldError(
            @Schema(description = "에러 필드명", example = "title")
            String field,

            @Schema(description = "입력된 값", example = "")
            String value,

            @Schema(description = "에러 사유", example = "제목은 필수입니다")
            String reason
    ) {
        public static FieldError of(String field, String value, String reason) {
            return new FieldError(field, value, reason);
        }
    }
}
