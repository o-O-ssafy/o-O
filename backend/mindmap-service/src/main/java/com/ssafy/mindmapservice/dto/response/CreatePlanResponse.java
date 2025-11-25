// CreatePlanResponse
package com.ssafy.mindmapservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreatePlanResponse {

    @Schema(description = "실제 기획안 전문 텍스트 (Markdown 형식)")
    private String plan;
}
