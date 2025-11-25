package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;
import java.util.List;

public record WorkspaceSimpleResponse(
        Long id,
        String title,
        WorkspaceVisibility visibility,
        LocalDateTime createdAt,
        String thumbnail,
        String startPrompt,
        List<String> profiles
) {

    // 기본 - thumbnail=S3 key
    public static WorkspaceSimpleResponse from(Workspace w) {
        return from(w, List.of());
    }

    // 기본 - thumbnail=S3 key + profiles
    public static WorkspaceSimpleResponse from(Workspace w, List<String> profiles) {
        return new WorkspaceSimpleResponse(
                w.getId(),
                w.getTitle(),
                w.getVisibility(),
                w.getCreatedAt(),
                w.getThumbnail(),             // ← key 그대로
                w.getStartPrompt(),
                profiles != null ? profiles : List.of()
        );
    }

    // presigned URL 버전
    public static WorkspaceSimpleResponse fromWithThumbnailUrl(
            Workspace w,
            List<String> profiles,
            String thumbnailUrl
    ) {
        return new WorkspaceSimpleResponse(
                w.getId(),
                w.getTitle(),
                w.getVisibility(),
                w.getCreatedAt(),
                thumbnailUrl,                // 🔹 presigned URL 적용!!
                w.getStartPrompt(),
                profiles != null ? profiles : List.of()
        );
    }
}
