package com.ssafy.mindmapservice.dto.request;

/**
 * 이미지 노드 생성 요청 DTO
 * multipart/form-data의 JSON 파트로 전송됨
 */
public record ImageNodeCreateRequest(
        Long parentId,
        String memo,
        Double x,
        Double y,
        String color
) {
}