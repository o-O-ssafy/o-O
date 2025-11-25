package com.ssafy.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;

    private String buildKey(Long userId, String platform) {
        return "refreshToken:" + userId + ":" + platform;
    }

    public void saveRefreshToken(Long userId, String platform, String token, Long ttlSeconds) {
        String key = buildKey(userId, platform);
        redisTemplate.opsForValue().set(key, token, ttlSeconds, TimeUnit.SECONDS);
        log.info("Stored refresh token → key={}, ttl={}s", key, ttlSeconds);
    }

    public String findRefreshToken(Long userId, String platform) {
        String key = buildKey(userId, platform);
        return redisTemplate.opsForValue().get(key);
    }

    public void deleteRefreshToken(Long userId, String platform) {
        String key = buildKey(userId, platform);
        redisTemplate.delete(key);
        log.info("Deleted refresh token → key={}", key);
    }
}
