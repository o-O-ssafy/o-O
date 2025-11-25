package com.ssafy.mindmapservice.dto.kafka;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * AI 서버에서 분석 결과를 받을 때 사용하는 DTO
 * INITIAL: aiSummary, title 포함, nodeId는 null
 * CONTEXTUAL: nodeId 포함, aiSummary와 title은 null
 */
@Schema(description = "AI 분석 결과 DTO (Kafka 응답용)")
public record AiAnalysisResult(

        @Schema(description = "워크스페이스 ID", example = "123")
        Long workspaceId,

        @Schema(description = "노드 ID (CONTEXTUAL 전용, 확장된 부모 노드 ID)", example = "15", nullable = true)
        Long nodeId,

        @Schema(description = "수정될 root 노드 keyword")
        String keyword,

        @Schema(description = "AI 분석 요약 (INITIAL 전용)", example = "'고기'와 관련된 다양한 아이디어를 분류했습니다.", nullable = true)
        String aiSummary,

        @Schema(description = "워크스페이스 제목 (INITIAL 전용, 워크스페이스 title 업데이트용)", example = "고기와 관련된 회의", nullable = true)
        String title,

        @Schema(description = "AI가 생성한 노드 배열 (INITIAL: 가변, CONTEXTUAL: 3개)")
        List<AiNodeResult> nodes,

        @Schema(description = "처리 상태", example = "SUCCESS", allowableValues = {"SUCCESS", "FAILED"})
        String status
) {}
