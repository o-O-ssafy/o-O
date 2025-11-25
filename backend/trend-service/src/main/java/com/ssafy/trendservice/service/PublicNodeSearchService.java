// trend-service: src/main/java/com/ssafy/trendservice/service/PublicNodeSearchService.java
package com.ssafy.trendservice.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.ssafy.trendservice.dto.es.PublicNodeDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicNodeSearchService {

    private final ElasticsearchClient esClient;

    @Value("${elasticsearch.public-index-name:public_mindmap_nodes}")
    private String indexName;

    /**
     * 키워드 LIKE 검색 (ES match + analyzer)
     */
    public List<String> searchKeywords(String keyword, int limit) {
        try {
            SearchResponse<PublicNodeDocument> resp = esClient.search(s -> s
                            .index(indexName)
                            .size(limit)
                            .query(q -> q
                                    .match(m -> m
                                            .field("keyword")
                                            .query(keyword)
                                            .operator(Operator.And)
                                    )
                            ),
                    PublicNodeDocument.class);

            return resp.hits().hits().stream()
                    .map(h -> h.source())
                    .filter(Objects::nonNull)
                    .map(PublicNodeDocument::getKeyword)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .limit(limit)
                    .collect(Collectors.toList());

        } catch (ElasticsearchException | IOException e) {
            log.error("[ES] searchKeywords failed. keyword={}", keyword, e);
            return List.of();
        }
    }

    /**
     * 특정 parentKeyword의 자식 노드들 검색
     * - ES에서 parentKeyword match로 찾음
     */
    public List<ChildNode> searchChildrenByParent(String parentKeyword, int limit) {
        try {
            SearchRequest request = SearchRequest.of(s -> s
                    .index(indexName)
                    .size(limit)
                    .query(q -> q
                            .match(m -> m
                                    .field("parentKeyword")
                                    .query(parentKeyword)
                                    .operator(Operator.And)
                            )
                    )
                    // createdAt 기준 정렬 정도만, 필요 없으면 제거 가능
                    .sort(sort -> sort
                            .field(f -> f
                                    .field("createdAt")
                                    .order(SortOrder.Desc)
                            )
                    )
            );

            SearchResponse<PublicNodeDocument> resp =
                    esClient.search(request, PublicNodeDocument.class);

            return resp.hits().hits().stream()
                    .map(h -> h.source())
                    .filter(Objects::nonNull)
                    .map(doc -> new ChildNode(
                            doc.getWorkspaceId(),
                            doc.getNodeId(),
                            doc.getParentNodeId(),
                            doc.getKeyword(),
                            doc.getParentKeyword(),
                            doc.getType()
                    ))
                    .collect(Collectors.toList());

        } catch (ElasticsearchException | IOException e) {
            log.error("[ES] searchChildrenByParent failed. parentKeyword={}", parentKeyword, e);
            return List.of();
        }
    }

    // ===== 내부 DTO =====

    public record ChildNode(
            Long workspaceId,
            Long nodeId,
            Long parentNodeId,
            String keyword,
            String parentKeyword,
            String type
    ) {}
}
