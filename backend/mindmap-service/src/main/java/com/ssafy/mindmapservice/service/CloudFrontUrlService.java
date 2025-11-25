package com.ssafy.mindmapservice.service;

import com.amazonaws.services.cloudfront.CloudFrontUrlSigner;
import com.amazonaws.services.cloudfront.util.SignerUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.time.Duration;
import java.util.Date;

/**
 * CloudFront Signed URL을 생성하는 서비스
 * S3 Presigned URL 대비 URL 길이를 대폭 줄여서 클라이언트 URL 제한 문제를 해결합니다.
 */
@Slf4j
@Service
public class CloudFrontUrlService {

    @Value("${cloud.aws.cloudfront.domain}")
    private String cloudFrontDomain;

    @Value("${cloud.aws.cloudfront.key-pair-id}")
    private String keyPairId;

    @Value("${cloud.aws.cloudfront.private-key-path}")
    private String privateKeyPath;

    private PrivateKey privateKey;

    /**
     * CloudFront Signed URL을 생성합니다.
     * S3 key를 받아서 CloudFront URL로 변환하고 서명합니다.
     *
     * @param s3Key S3 객체 키 (예: mindmap/image/uuid.png)
     * @param duration URL 유효 기간
     * @return CloudFront Signed URL (150~250자 정도)
     */
    public String generateSignedUrl(String s3Key, Duration duration) {
        if (s3Key == null || s3Key.isBlank()) {
            return null;
        }

        try {
            // Private Key 로드 (캐싱)
            if (privateKey == null) {
                privateKey = loadPrivateKey();
            }

            // CloudFront URL 생성
            String resourceUrl = "https://" + cloudFrontDomain + "/" + s3Key;

            // 만료 시간 계산
//            Date expiresOn = new Date(System.currentTimeMillis() + duration.toMillis());
            Date expiresOn = new Date(System.currentTimeMillis() + Duration.ofDays(7).toMillis()); //TODO: 변경 필요

            // CloudFront Signed URL 생성 (Canned Policy 사용)
            String signedUrl = CloudFrontUrlSigner.getSignedURLWithCannedPolicy(
                    resourceUrl,
                    keyPairId,
                    privateKey,
                    expiresOn
            );

            log.debug("Generated CloudFront signed URL for key: {}, expires: {}", s3Key, expiresOn);
            return signedUrl;

        } catch (Exception e) {
            log.error("Failed to generate CloudFront signed URL for key: {}", s3Key, e);
            throw new RuntimeException("Failed to generate CloudFront signed URL", e);
        }
    }

    /**
     * Private Key 파일을 로드합니다.
     * PEM 형식의 RSA Private Key를 읽어서 PrivateKey 객체로 변환합니다.
     *
     * @return PrivateKey 객체
     * @throws IOException Private Key 파일을 읽을 수 없을 때
     * @throws InvalidKeySpecException Private Key 형식이 잘못되었을 때
     */
    private PrivateKey loadPrivateKey() throws IOException, InvalidKeySpecException {
        File privateKeyFile = new File(privateKeyPath);

        if (!privateKeyFile.exists()) {
            throw new IOException("CloudFront private key file not found: " + privateKeyPath);
        }

        log.info("Loading CloudFront private key from: {}", privateKeyPath);

        // PEM 파일 읽기
        String privateKeyPEM = new String(Files.readAllBytes(privateKeyFile.toPath()));

        // AWS SDK의 SignerUtils를 사용하여 PEM → PrivateKey 변환
        PrivateKey key = SignerUtils.loadPrivateKey(privateKeyFile);

        log.info("CloudFront private key loaded successfully");
        return key;
    }

    /**
     * CloudFront 설정이 올바른지 검증합니다.
     * 애플리케이션 시작 시 또는 헬스체크에서 사용할 수 있습니다.
     *
     * @return 설정이 올바르면 true
     */
    public boolean validateConfiguration() {
        try {
            if (cloudFrontDomain == null || cloudFrontDomain.isBlank()) {
                log.error("CloudFront domain is not configured");
                return false;
            }

            if (keyPairId == null || keyPairId.isBlank()) {
                log.error("CloudFront key pair ID is not configured");
                return false;
            }

            if (privateKey == null) {
                privateKey = loadPrivateKey();
            }

            log.info("CloudFront configuration validated successfully");
            return true;

        } catch (Exception e) {
            log.error("CloudFront configuration validation failed", e);
            return false;
        }
    }
}
