package com.ssafy.workspaceservice.exception;

public class WorkspaceNotFoundException extends RuntimeException {
    public WorkspaceNotFoundException(Long workspaceId) {
        super("Workspace not found: " + workspaceId);
    }
}
