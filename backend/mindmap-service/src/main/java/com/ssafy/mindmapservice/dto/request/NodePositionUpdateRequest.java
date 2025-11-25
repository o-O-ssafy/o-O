package com.ssafy.mindmapservice.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * 단일 노드의 좌표 및 색상 업데이트 요청
 */
public record NodePositionUpdateRequest(
        @NotNull(message = "nodeId는 필수입니다")
        Long nodeId,

        @NotNull(message = "x 좌표는 필수입니다")
        Double x,

        @NotNull(message = "y 좌표는 필수입니다")
        Double y
) {
}
