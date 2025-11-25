package com.ssafy.workspaceservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "월별 활성 날짜 응답")
public record WorkspaceActivityDaysResponse(
        @Schema(description = "활성 날짜 목록 (yyyy-MM-dd)", example = "[\"2025-11-01\", \"2025-11-05\", \"2025-11-12\"]")
        List<String> dates
) {
    public static WorkspaceActivityDaysResponse of(List<String> dates) {
        return new WorkspaceActivityDaysResponse(dates);
    }
}
