package com.ssafy.mindmapservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 키워드 기반 노드 검색 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeywordNodeSearchResponse {

    /**
     * 검색된 노드 목록
     */
    private List<NodeItem> nodes;

    /**
     * 총 노드 수
     */
    private Integer totalCount;

    /**
     * 개별 노드 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeItem {
        private Long nodeId;
        private Long parentId;
        private Long workspaceId;
        private String keyword;
        private String parentKeyword;  // 부모 키워드 (관계용)
    }
}