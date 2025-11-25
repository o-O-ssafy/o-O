package com.ssafy.workspaceservice.client;


import com.ssafy.workspaceservice.dto.request.UserProfileRequest;
import com.ssafy.workspaceservice.dto.response.UserProfileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(
        name = "user-service",
        url = "${feign.user-service.url}",   // application.yml에 설정
        path = "/users/internal"
)
public interface UserServiceClient {

    @PostMapping("/profiles")
    List<UserProfileDto> getUserProfiles(@RequestBody UserProfileRequest request);
}
