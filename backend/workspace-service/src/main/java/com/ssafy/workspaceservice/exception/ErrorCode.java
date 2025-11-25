package com.ssafy.workspaceservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 워크스페이스 관련 (W로 시작)
    WORKSPACE_NOT_FOUND(HttpStatus.NOT_FOUND, "W001", "워크스페이스를 찾을 수 없습니다"),
    WORKSPACE_ALREADY_EXISTS(HttpStatus.CONFLICT, "W002", "이미 존재하는 워크스페이스입니다"),
    WORKSPACE_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "W003", "워크스페이스 멤버를 찾을 수 없습니다"),
    WORKSPACE_ALREADY_MEMBER(HttpStatus.CONFLICT, "W004", "이미 워크스페이스 멤버입니다"),
    INVALID_INVITE_TOKEN(HttpStatus.NOT_FOUND, "W005", "유효하지 않은 초대 링크입니다"),
    WORKSPACE_FULL(HttpStatus.BAD_REQUEST, "W006", "워크스페이스 인원이 가득 찼습니다 (최대 6명)"),

    // 권한 관련 (P로 시작 - Permission)
    FORBIDDEN_NOT_MEMBER(HttpStatus.FORBIDDEN, "P001", "워크스페이스 멤버가 아닙니다"),
    FORBIDDEN_NOT_MAINTAINER(HttpStatus.FORBIDDEN, "P002", "MAINTAINER만 삭제 가능합니다"),
    FORBIDDEN_NOT_AUTHORIZED(HttpStatus.FORBIDDEN, "P003", "해당 작업을 수행할 권한이 없습니다"),
    FORBIDDEN_PRIVATE_WORKSPACE(HttpStatus.FORBIDDEN, "P004", "비공개 워크스페이스입니다"),

    // 요청 관련 (R로 시작)
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "R001", "잘못된 입력값입니다"),
    MISSING_REQUEST_PARAMETER(HttpStatus.BAD_REQUEST, "R002", "필수 요청 파라미터가 누락되었습니다"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "R003", "지원하지 않는 HTTP 메서드입니다"),

    // 서버 관련 (S로 시작)
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S001", "서버 내부 오류가 발생했습니다");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
