package com.ssafy.userservice.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${google.client-id-mobile}") String mobileClientId,
                               @Value("${google.client-id-web}") String webClientId,
                               @Value("${google.client-id-ios}") String iosClientId,
                               @Value("${google.client-id-mobile-ssafy}") String mobileSsafyClientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(java.util.Arrays.asList(mobileClientId, webClientId, iosClientId, mobileSsafyClientId))
                .build();
        log.info("GoogleTokenVerifier initialized with mobile, web, and iOS client IDs");
    }

    public Map<String, Object> verifyAndExtract(String idTokenString)
            throws GeneralSecurityException, IOException {
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new IllegalArgumentException("ID token cannot be null or blank");
        }

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null) {
            log.error("Invalid ID token: verification failed");
            throw new IllegalArgumentException("Invalid ID token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        // 사용자 정보 추출
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("sub", payload.getSubject());  // Google User ID (providerId)
        userInfo.put("email", payload.getEmail());
        userInfo.put("email_verified", payload.getEmailVerified());
        userInfo.put("name", payload.get("name"));

        log.info("ID token verified successfully for user: {}", payload.getEmail());

        return userInfo;
    }
}
