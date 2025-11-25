package com.ssafy.mindmapservice.dto.request;

public record WorkspaceCloneRequest(
        String workspaceName,
        String workspaceDescription
) {}
