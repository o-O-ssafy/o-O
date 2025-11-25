// src/main/java/com/ssafy/mindmapservice/service/PublicIndexSyncService.java
package com.ssafy.mindmapservice.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import com.ssafy.mindmapservice.client.WorkspaceServiceClientAdapter;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.es.PublicNodeDocument;
import com.ssafy.mindmapservice.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicIndexSyncService {

    private final ElasticsearchClient esClient;
    private final NodeRepository nodeRepository;

    @Value("${elasticsearch.public-index-name:public_mindmap_nodes}")
    private String indexName;

    /**
     * 1) workspace가 PUBLIC으로 바뀔 때, 해당 워크스페이스 전체 노드를 ES에 bulk 인덱싱
     */
    @Transactional(readOnly = true)
    public void bulkIndexWorkspace(Long workspaceId) {
        log.info("[ES] bulkIndexWorkspace workspaceId={}", workspaceId);

        // 1. 해당 워크스페이스의 모든 노드 조회
        List<MindmapNode> nodes = nodeRepository.findByWorkspaceId(workspaceId);
        if (nodes.isEmpty()) {
            log.info("[ES] workspace {} has no nodes, skip bulk index", workspaceId);
            return;
        }

        List<MindmapNode> textNodes = nodes.stream()
                .filter(n -> "TEXT".equalsIgnoreCase(n.getType()))
                .toList();

        if (textNodes.isEmpty()) {
            log.info("[ES] workspace {} has no TEXT nodes, skip bulk index", workspaceId);
            return;
        }

        // 2. parentKeyword 채워서 도큐먼트로 변환
        List<PublicNodeDocument> docs = toDocumentsWithParentKeyword(nodes);

        // 3. Bulk 요청 구성
        BulkRequest.Builder br = new BulkRequest.Builder();
        for (PublicNodeDocument doc : docs) {
            String id = doc.getWorkspaceId() + "_" + doc.getNodeId();
            br.operations(op -> op.index(idx -> idx
                    .index(indexName)
                    .id(id)
                    .document(doc)
            ));
        }

        try {
            BulkResponse response = esClient.bulk(br.build());
            if (response.errors()) {
                log.error("[ES] bulkIndexWorkspace has errors: {}", response);
            } else {
                log.info("[ES] bulkIndexWorkspace success. items={}", response.items().size());
            }
        } catch (ElasticsearchException | IOException e) {
            log.error("[ES] bulkIndexWorkspace failed for workspaceId={}", workspaceId, e);
        }
    }

    /**
     * 2) 노드 생성 시, 해당 workspace가 이미 PUBLIC이면 바로 ES에 한 건 인덱싱
     *    (private → public 최초 전환 시에는 bulkIndexWorkspace가 전체를 채움)
     */
    @Transactional(readOnly = true)
    public void indexNodeIfWorkspacePublic(MindmapNode node, boolean isPublic) {
        Long workspaceId = node.getWorkspaceId();

        // TEXT 타입만 인덱싱
        if (!"TEXT".equalsIgnoreCase(node.getType())) {
            log.debug("[ES] skip index (not TEXT). workspaceId={}, nodeId={}, type={}",
                    workspaceId, node.getNodeId(), node.getType());
            return;
        }

        if (!isPublic) {
            log.debug("[ES] workspace {} is PRIVATE, skip node index. nodeId={}", workspaceId, node.getNodeId());
            return;
        }

        PublicNodeDocument doc = toDocumentWithParentKeyword(node);

        String id = doc.getWorkspaceId() + "_" + doc.getNodeId();

        try {
            esClient.index(i -> i
                    .index(indexName)
                    .id(id)
                    .document(doc)
            );
            log.debug("[ES] indexed node workspaceId={}, nodeId={}", workspaceId, node.getNodeId());
        } catch (ElasticsearchException | IOException e) {
            log.error("[ES] indexNode failed workspaceId={}, nodeId={}", workspaceId, node.getNodeId(), e);
        }
    }

    // ----- 내부 헬퍼 -----

    private List<PublicNodeDocument> toDocumentsWithParentKeyword(List<MindmapNode> nodes) {
        List<PublicNodeDocument> result = new ArrayList<>();
        for (MindmapNode node : nodes) {
            result.add(toDocumentWithParentKeyword(node));
        }
        return result;
    }

    private PublicNodeDocument toDocumentWithParentKeyword(MindmapNode node) {
        String parentKeyword = null;

        if (node.getParentId() != null) {
            nodeRepository.findByWorkspaceIdAndNodeId(node.getWorkspaceId(), node.getParentId())
                    .ifPresent(parent -> {
                        // parentKeyword를 밖에서 쓰기 위해 final 배열 트릭도 가능하지만,
                        // 여기선 아래처럼 한 번 더 조회 안 하게 조심해서 처리해도 됨.
                    });
            MindmapNode parent = nodeRepository
                    .findByWorkspaceIdAndNodeId(node.getWorkspaceId(), node.getParentId())
                    .orElse(null);
            if (parent != null) {
                parentKeyword = parent.getKeyword();
            }
        }

        return PublicNodeDocument.builder()
                .workspaceId(node.getWorkspaceId())
                .nodeId(node.getNodeId())
                .parentNodeId(node.getParentId())
                .keyword(node.getKeyword())
                .parentKeyword(parentKeyword)
                .type(node.getType())
                .createdAt(toInstant(node.getCreatedAt()))
                .updatedAt(toInstant(node.getUpdatedAt()))
                .build();
    }

    private java.time.Instant toInstant(java.time.LocalDateTime dt) {
        return dt == null ? null : dt.toInstant(ZoneOffset.UTC);
    }
}
