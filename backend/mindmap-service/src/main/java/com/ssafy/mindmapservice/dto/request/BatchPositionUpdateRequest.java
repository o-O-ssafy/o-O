package com.ssafy.mindmapservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * 여러 노드의 좌표를 일괄 업데이트하는 요청
 * 모바일에서 STT 아이디어 확장 후 레이아웃 계산 결과를 전송할 때 사용
 */
public record BatchPositionUpdateRequest(
        @NotEmpty(message = "positions는 비어있을 수 없습니다")
        @Valid
        List<NodePositionUpdateRequest> positions
) {
}
