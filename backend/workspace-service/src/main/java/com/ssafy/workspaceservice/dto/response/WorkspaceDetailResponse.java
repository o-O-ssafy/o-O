package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceTheme;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;

public record WorkspaceDetailResponse(
        Long id,
        WorkspaceTheme theme,
        WorkspaceType type,
        WorkspaceVisibility visibility,
        String title,
        String thumbnail,      // 여기에 presigned URL을 넣을 거임
        LocalDateTime createdAt,
        boolean isMember,
        String myRole,
        String token,
        Long memberCount
) {
    public static WorkspaceDetailResponse of(
            Workspace w,
            String thumbnailUrl,   // 🔹 추가
            boolean isMember,
            String myRole,
            Long memberCount
    ) {
        return new WorkspaceDetailResponse(
                w.getId(),
                w.getTheme(),
                w.getType(),
                w.getVisibility(),
                w.getTitle(),
                thumbnailUrl,         // 🔹 여기 URL 넣기
                w.getCreatedAt(),
                isMember,
                myRole,
                w.getToken(),
                memberCount
        );
    }
}

// 입장 판단 및 내 역할 표시까지 포함한 상세 응답