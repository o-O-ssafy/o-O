package com.ssafy.workspaceservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "커서 기반 페이징 워크스페이스 응답")
public record WorkspaceCursorResponse(
        @Schema(description = "워크스페이스 목록")
        List<WorkspaceSimpleResponse> workspaces,

        @Schema(description = "다음 커서 (다음 페이지 요청 시 사용)", example = "105")
        Long nextCursor,

        @Schema(description = "다음 페이지 존재 여부", example = "true")
        boolean hasNext
) {
    public static WorkspaceCursorResponse of(List<WorkspaceSimpleResponse> workspaces, Long nextCursor, boolean hasNext) {
        return new WorkspaceCursorResponse(workspaces, nextCursor, hasNext);
    }
}
