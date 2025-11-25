package com.ssafy.trendservice.exception;

import com.ssafy.trendservice.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

/**
 * 전역 예외 처리기
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private ErrorResponse buildErrorResponse(HttpStatus status,
                                             String message,
                                             String path,
                                             String code) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .code(code)
                .build();
    }

    /**
     * @RequestParam, @PathVariable 등에서 발생하는 타입/검증 오류
     */
    @ExceptionHandler({
            ConstraintViolationException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            Exception ex,
            HttpServletRequest request
    ) {
        log.warn("[BadRequest] {} - path={}, message={}",
                ex.getClass().getSimpleName(), request.getRequestURI(), ex.getMessage());

        ErrorResponse body = buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request.getRequestURI(),
                "TREND-400"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * @Valid @RequestBody 등에서 발생하는 바디 검증 오류
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String defaultMessage = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + " " + err.getDefaultMessage())
                .orElse(ex.getMessage());

        log.warn("[BadRequest] MethodArgumentNotValidException - path={}, message={}",
                request.getRequestURI(), defaultMessage);

        ErrorResponse body = buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                defaultMessage,
                request.getRequestURI(),
                "TREND-400"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Spring이 던지는 기본 ErrorResponseException (Optional)
     */
    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<ErrorResponse> handleErrorResponseException(
            ErrorResponseException ex,
            HttpServletRequest request
    ) {
        HttpStatus status = (HttpStatus) ex.getStatusCode();

        log.error("[{}] ErrorResponseException - path={}, message={}",
                status, request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse body = buildErrorResponse(
                status,
                ex.getMessage(),
                request.getRequestURI(),
                "TREND-" + status.value()
        );
        return ResponseEntity.status(status).body(body);
    }

    /**
     * 그 외 처리되지 않은 예외 → 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("[InternalServerError] Unexpected exception - path={}, message={}",
                request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse body = buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                request.getRequestURI(),
                "TREND-500"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
