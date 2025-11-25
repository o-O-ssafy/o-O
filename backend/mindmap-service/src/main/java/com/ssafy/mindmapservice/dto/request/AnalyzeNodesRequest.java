// AnalyzeNodesRequest
package com.ssafy.mindmapservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.util.List;

@Getter
public class AnalyzeNodesRequest {

    @Schema(description = "분석 대상 노드 ID 목록(nodeId)", example = "[1, 2, 5]")
    private List<Long> nodeIds;
}
