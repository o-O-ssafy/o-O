package com.ssafy.mindmapservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;
    private final CloudFrontUrlService cloudFrontUrlService;

    @Value("${cloud.aws.s3.thumbnail-bucket}")
    private String bucket;

    @Value("${cloud.aws.s3.thumbnail-prefix}")
    private String prefix;

    /**
     * 클라이언트가 보낸 썸네일 파일을 S3에 업로드하고,
     * Workspace.thumbnail 에 S3 key 저장
     */
    @Transactional
    public String uploadImage(MultipartFile file) {

        // 새 key 생성
        String key = buildKey(file.getOriginalFilename());

        // 1) 새 파일 업로드
        putObjectToS3(key, file);

        // key 반환
        return key;
    }



    private String buildKey(String originalFilename) {
        String ext = "bin";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1);
        }
        String uuid = UUID.randomUUID().toString();
        return String.format("%s/%s.%s", prefix, uuid, ext);
    }

    private void putObjectToS3(String key, MultipartFile file) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload workspace thumbnail to S3", e);
        }
    }

    /**
     * DB에 저장된 thumbnail key로 CloudFront Signed URL 생성
     * 기존 S3 Presigned URL 대비 URL 길이가 대폭 줄어듭니다 (1000~1500자 → 150~250자)
     */
    public String generateImagePresignedUrl(String ImageKey, Duration duration) {
        if (ImageKey == null || ImageKey.isBlank()) {
            return null;
        }

        // CloudFront Signed URL 생성
        return cloudFrontUrlService.generateSignedUrl(ImageKey, duration);
    }
}