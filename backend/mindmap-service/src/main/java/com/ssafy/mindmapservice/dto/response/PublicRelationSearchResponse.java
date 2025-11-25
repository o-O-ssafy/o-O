package com.ssafy.mindmapservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Public 워크스페이스의 관계 검색 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicRelationSearchResponse {

    /**
     * 검색된 관계 목록
     */
    private List<RelationItem> relations;

    /**
     * 총 관계 수
     */
    private Integer totalCount;

    /**
     * 개별 관계 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationItem {
        /**
         * 부모 키워드
         */
        private String parentKeyword;

        /**
         * 자식 키워드
         */
        private String childKeyword;

        /**
         * 워크스페이스 ID (참고용)
         */
        private Long workspaceId;
    }
}