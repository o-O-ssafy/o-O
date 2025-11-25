// CreatePlanRequest
package com.ssafy.mindmapservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
public class CreatePlanRequest {

    @Schema(description = "이전에 받은 분석 결과 텍스트 전체", example = "이 마인드맵은 ~~")
    private String analysisText;

    @Schema(description = "기획안 제목 (선택)", example = "AI 기반 마인드맵 서비스 기획안")
    private String title;
}
