package com.ssafy.mindmapservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * GPT가 추출한 키워드 노드 정보
 * GPT 응답 파싱용 DTO
 */
@Schema(description = "GPT가 추출한 키워드 노드")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedKeywordNode {

    @Schema(description = "추출된 키워드", example = "맛집 검색")
    @JsonProperty("keyword")
    private String keyword;

    @Schema(description = "키워드 설명 (메모)", example = "사용자가 주변 맛집을 검색할 수 있는 기능")
    @JsonProperty("memo")
    private String memo;

    @Schema(description = "기존 마인드맵에서 연결될 부모 노드 ID (빈 워크스페이스에서는 null 가능)", example = "3", nullable = true)
    @JsonProperty("parentId")
    private Long parentId;
}
