package com.ssafy.mindmapservice.dto.request;

import com.ssafy.mindmapservice.dto.kafka.NodeContextDto;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * 클라이언트에서 AI 분석을 요청할 때 사용하는 DTO
 * INITIAL: contentUrl, contentType, prompt, analysisType 포함 (nodes는 null)
 * CONTEXTUAL: nodes, analysisType 포함 (contentUrl, prompt는 null 가능)
 */
@Schema(description = "AI 분석 요청 DTO")
public record AiAnalysisRequest(

        @Schema(description = "워크스페이스 ID", example = "123", required = true)
        Long workspaceId,

        @Schema(description = "노드 ID (INITIAL: 첫 노드 ID, CONTEXTUAL: 확장할 노드 ID)", example = "1", required = true)
        Long nodeId,

        @Schema(description = "콘텐츠 URL (INITIAL 전용, 이미지/영상 URL)", example = "https://youtu.be/qDG3auuSb1E", nullable = true)
        String contentUrl,

        @Schema(description = "콘텐츠 타입", example = "VIDEO", allowableValues = {"IMAGE", "VIDEO", "TEXT"})
        String contentType,

        @Schema(description = "사용자 프롬프트 (INITIAL 전용)", example = "고기랑 관련된 아이디어 없을까?", nullable = true)
        String prompt,

        @Schema(description = "분석 타입", example = "INITIAL", allowableValues = {"INITIAL", "CONTEXTUAL"}, required = true)
        String analysisType,

        @Schema(description = "노드 컨텍스트 리스트 (CONTEXTUAL 전용, nodeId부터 루트까지의 조상 경로)", nullable = true)
        List<NodeContextDto> nodes
) {}
