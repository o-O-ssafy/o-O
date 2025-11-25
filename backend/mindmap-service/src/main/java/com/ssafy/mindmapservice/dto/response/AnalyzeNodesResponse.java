// AnalyzeNodesResponse
package com.ssafy.mindmapservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalyzeNodesResponse {

    @Schema(description = "GMS(gpt-5)가 생성한 마인드맵 분석 결과 텍스트")
    private String analysis;
}
