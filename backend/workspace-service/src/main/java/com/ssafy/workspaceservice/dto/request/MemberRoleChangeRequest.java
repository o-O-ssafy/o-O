package com.ssafy.workspaceservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MemberRoleChangeRequest(
        @NotBlank String role
) { }
// 특정 멤버의 역할 변경