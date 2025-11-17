package com.ssafy.mindmapservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

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
     * DB에 저장된 thumbnail key로 presigned GET URL 생성
     */
    public String generateImagePresignedUrl(String ImageKey, Duration duration) {
        if (ImageKey == null || ImageKey.isBlank()) {
        return null;
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(ImageKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
        return presigned.url().toString();
    }
}