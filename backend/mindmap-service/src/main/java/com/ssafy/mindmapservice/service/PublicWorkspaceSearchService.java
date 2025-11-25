package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.WorkspaceServiceClientAdapter;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.response.KeywordNodeSearchResponse;
import com.ssafy.mindmapservice.dto.response.PublicRelationSearchResponse;
import com.ssafy.mindmapservice.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Public 워크스페이스 검색 서비스 (Redis 제거 버전)
 * Trend-service에서 호출하는 API용
 *
 * workspace-service → public workspace ID 조회
 * MongoDB → 노드 구조 조회
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublicWorkspaceSearchService {

    private final NodeRepository nodeRepository;
    private final WorkspaceServiceClientAdapter workspaceServiceClient;

    /**
     * Public 워크스페이스에서 키워드 검색 후 부모-자식 관계 반환
     *
     * @param keyword 검색할 키워드
     * @param limit 최대 결과 수
     */
    public PublicRelationSearchResponse searchPublicRelations(String keyword, Integer limit) {
        log.info("Searching public relations: keyword={}, limit={}", keyword, limit);

        // 1. workspace-service에서 Public workspace 목록 조회
        List<Long> publicWorkspaceIds = workspaceServiceClient.getPublicWorkspaceIds();

        if (publicWorkspaceIds.isEmpty()) {
            log.debug("No public workspaces found");
            return PublicRelationSearchResponse.builder()
                    .relations(List.of())
                    .totalCount(0)
                    .build();
        }

        // 2. Public workspace에서 keyword 포함 노드 검색
        List<MindmapNode> matchedNodes =
                nodeRepository.findByWorkspaceIdInAndKeywordContaining(publicWorkspaceIds, keyword);

        log.debug("Found {} nodes matching keyword", matchedNodes.size());

        // 3. 부모-자식 관계 추출
        List<PublicRelationSearchResponse.RelationItem> relations = new ArrayList<>();
        Map<Long, Map<Long, MindmapNode>> nodeCache = new HashMap<>();

        for (MindmapNode node : matchedNodes) {

            // 부모가 있는 경우 부모 → 자식 구조 추가
            if (node.getParentId() != null) {
                MindmapNode parent = getNodeFromCache(
                        node.getWorkspaceId(),
                        node.getParentId(),
                        nodeCache
                );

                if (parent != null) {
                    relations.add(PublicRelationSearchResponse.RelationItem.builder()
                            .workspaceId(node.getWorkspaceId())
                            .parentKeyword(parent.getKeyword())
                            .childKeyword(node.getKeyword())
                            .build());
                }
            }

            // 현재 노드가 부모인 경우 → 자식들 추가
            List<MindmapNode> children = nodeRepository
                    .findChildrenByWorkspaceIdAndParentId(node.getWorkspaceId(), node.getNodeId());

            for (MindmapNode child : children) {
                relations.add(PublicRelationSearchResponse.RelationItem.builder()
                        .workspaceId(node.getWorkspaceId())
                        .parentKeyword(node.getKeyword())
                        .childKeyword(child.getKeyword())
                        .build());
            }
        }

        // 중복 제거 + limit
        List<PublicRelationSearchResponse.RelationItem> uniqueRelations = relations.stream()
                .distinct()
                .limit(limit != null ? limit : 100)
                .collect(Collectors.toList());

        return PublicRelationSearchResponse.builder()
                .relations(uniqueRelations)
                .totalCount(uniqueRelations.size())
                .build();
    }

    /**
     * 특정 부모 키워드의 자식 노드들을 Public 워크스페이스에서 검색
     */
    public KeywordNodeSearchResponse searchChildrenByParent(String parentKeyword, Integer limit) {

        // 1. Public workspace 조회
        List<Long> publicWorkspaceIds = workspaceServiceClient.getPublicWorkspaceIds();

        if (publicWorkspaceIds.isEmpty()) {
            return KeywordNodeSearchResponse.builder()
                    .nodes(List.of())
                    .totalCount(0)
                    .build();
        }

        // 2. 각 workspace 안에서 parentKeyword 가진 부모 노드들 찾기
        List<MindmapNode> parentNodes =
                nodeRepository.findByWorkspaceIdInAndKeywordEqualsIgnoreCase(publicWorkspaceIds, parentKeyword);

        log.info("[ChildrenSearch] parentKeyword='{}', parents={}", parentKeyword, parentNodes.size());

        if (parentNodes.isEmpty()) {
            return KeywordNodeSearchResponse.builder()
                    .nodes(List.of())
                    .totalCount(0)
                    .build();
        }

        // 부모 (workspaceId, nodeId) -> parentNode 맵
        Map<String, MindmapNode> parentMap = parentNodes.stream()
                .collect(Collectors.toMap(
                        p -> p.getWorkspaceId() + ":" + p.getNodeId(),
                        p -> p
                ));

        List<Long> parentIds = parentNodes.stream()
                .map(MindmapNode::getNodeId)
                .toList();

        // 3. 모든 부모들의 자식 노드들을 한 번에 조회
        List<MindmapNode> children =
                nodeRepository.findByWorkspaceIdInAndParentIdIn(publicWorkspaceIds, parentIds);

        log.info("[ChildrenSearch] children size={}", children.size());

        int max = (limit != null ? limit : 100);

        // 4. 응답으로 변환
        List<KeywordNodeSearchResponse.NodeItem> result = children.stream()
                .map(child -> {
                    String key = child.getWorkspaceId() + ":" + child.getParentId();
                    MindmapNode parent = parentMap.get(key);

                    return KeywordNodeSearchResponse.NodeItem.builder()
                            .nodeId(child.getNodeId())
                            .parentId(child.getParentId())
                            .workspaceId(child.getWorkspaceId())
                            .keyword(child.getKeyword())              // 파이썬 / 자바
                            .parentKeyword(parent != null ? parent.getKeyword() : null) // 알고리즘
                            .build();
                })
                .limit(max)
                .toList();

        return KeywordNodeSearchResponse.builder()
                .nodes(result)
                .totalCount(result.size())
                .build();
    }


    /**
     * 부모 노드 조회용 캐시 (Mongo 요청 최적화)
     */
    private MindmapNode getNodeFromCache(Long workspaceId, Long nodeId,
                                         Map<Long, Map<Long, MindmapNode>> cache) {
        cache.putIfAbsent(workspaceId, new HashMap<>());
        Map<Long, MindmapNode> workspaceCache = cache.get(workspaceId);

        if (!workspaceCache.containsKey(nodeId)) {
            nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                    .ifPresent(node -> workspaceCache.put(nodeId, node));
        }

        return workspaceCache.get(nodeId);
    }

    // PublicWorkspaceSearchService.java

    public List<String> searchPublicKeywords(String keyword, Integer limit) {
        log.info("Searching public keywords: keyword={}, limit={}", keyword, limit);

        // 1. Public workspace ID 목록 조회
        List<Long> publicWorkspaceIds = workspaceServiceClient.getPublicWorkspaceIds();

        if (publicWorkspaceIds.isEmpty()) {
            log.debug("No public workspaces found");
            return List.of();
        }

        // 2. Public workspace에서 keyword LIKE 검색
        List<MindmapNode> matchedNodes =
                nodeRepository.findByWorkspaceIdInAndKeywordContaining(publicWorkspaceIds, keyword);

        // 3. 중복 제거 + limit
        int max = (limit != null ? limit : 100);

        return matchedNodes.stream()
                .map(MindmapNode::getKeyword)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .limit(max)
                .toList();
    }

}
