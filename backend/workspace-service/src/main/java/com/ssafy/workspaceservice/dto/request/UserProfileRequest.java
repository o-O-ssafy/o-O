package com.ssafy.workspaceservice.dto.request;

import java.util.List;

public record UserProfileRequest(
        List<Long> userIds
) { }
