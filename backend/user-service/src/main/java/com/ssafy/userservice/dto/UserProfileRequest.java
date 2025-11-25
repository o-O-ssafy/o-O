package com.ssafy.userservice.dto;

import java.util.List;

public record UserProfileRequest(
        List<Long> userIds
) { }