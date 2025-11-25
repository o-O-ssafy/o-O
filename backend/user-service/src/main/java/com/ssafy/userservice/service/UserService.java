package com.ssafy.userservice.service;

import com.ssafy.userservice.dto.UserProfileDto;
import com.ssafy.userservice.dto.UserResponse;
import com.ssafy.userservice.dto.UserUpdateRequest;
import com.ssafy.userservice.domain.User;
import com.ssafy.userservice.exception.UserNotFoundException;
import com.ssafy.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // nickname이 null이 아닌 경우에만 업데이트
        if (request.nickname() != null) {
            user.updateNickname(request.nickname());
        }

        // profileImage가 null이 아닌 경우에만 업데이트
        if (request.profileImage() != null) {
            user.updateProfileImage(request.profileImage());
        }

        log.info("User updated - userId: {}", userId);

        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> getProfiles(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }

        return userRepository.findByIdIn(userIds).stream()
                .map(UserProfileDto::from)
                .toList();
    }
}
