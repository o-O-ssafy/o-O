package com.ssafy.userservice.service;

import com.ssafy.userservice.domain.ProfileImage;
import com.ssafy.userservice.domain.User;
import com.ssafy.userservice.repository.UserRepository;
import com.ssafy.userservice.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 구글에서 받은 사용자 정보
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String providerId = (String) attributes.get("sub");  // 구글 고유 ID
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        log.info("Google OAuth2 User Info - providerId: {}, email: {}", providerId, email);

        // DB에서 사용자 조회 또는 생성
        User user = userRepository.findByProviderId(providerId)
                .orElseGet(() -> createUser(providerId, email, name));

        return new CustomOAuth2User(user, attributes);
    }

    private User createUser(String providerId, String email, String name) {
        User newUser = User.builder()
                .email(email)
                .nickname(name)
                .profileImage(ProfileImage.POPO1)  // 기본 프로필 이미지
                .providerId(providerId)
                .role(User.Role.USER)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("New user created - userId: {}, email: {}", savedUser.getId(), savedUser.getEmail());
        return savedUser;
    }
}
