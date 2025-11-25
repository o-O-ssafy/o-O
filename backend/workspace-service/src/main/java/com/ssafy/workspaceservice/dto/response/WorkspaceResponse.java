package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceTheme;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;

public record WorkspaceResponse(
        Long id,
        WorkspaceTheme theme,
        WorkspaceType type,
        WorkspaceVisibility visibility,
        String title,
        String token
) {
    public static WorkspaceResponse from(Workspace w) {
        return new WorkspaceResponse(
                w.getId(),
                w.getTheme(),
                w.getType(),
                w.getVisibility(),
                w.getTitle(),
                w.getToken()
        );
    }
}
