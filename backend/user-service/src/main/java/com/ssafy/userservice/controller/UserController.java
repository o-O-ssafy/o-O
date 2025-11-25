package com.ssafy.userservice.controller;

import com.ssafy.userservice.dto.UserProfileDto;
import com.ssafy.userservice.dto.UserProfileRequest;
import com.ssafy.userservice.dto.UserResponse;
import com.ssafy.userservice.dto.UserUpdateRequest;
import com.ssafy.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "사용자 API", description = "사용자 정보 조회 및 수정 API")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @Operation(summary = "사용자 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다 (Gateway에서 X-USER-ID 헤더로 userId 전달)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(examples = @ExampleObject(value = "{\"email\":\"user@example.com\",\"nickname\":\"닉네임\",\"profileImage\":\"popo1\"}"))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", content = @Content)
    })
    @GetMapping("")
    public ResponseEntity<UserResponse> getUser(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId) {
        log.info("GET /users - Retrieving user information for userId: {}", userId);
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "사용자 정보 수정", description = "현재 로그인한 사용자의 정보를 수정합니다 (닉네임, 프로필 이미지 등)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(examples = @ExampleObject(value = "{\"email\":\"user@example.com\",\"nickname\":\"새닉네임\",\"profileImage\":\"popo1\"}"))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", content = @Content),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    })
    @PatchMapping("")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody UserUpdateRequest request) {
        log.info("PATCH /users - Updating user information for userId: {}", userId);
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }



    @PostMapping("/internal/profiles")
    public List<UserProfileDto> getProfiles(@RequestBody UserProfileRequest request) {
        return userService.getProfiles(request.userIds());
    }
}
