package com.ssafy.mindmapservice.repository;

import com.ssafy.mindmapservice.domain.MindmapNode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 마인드맵 노드 Repository
 */
@Repository
public interface NodeRepository extends MongoRepository<MindmapNode, String> {

    // 워크스페이스 ID로 모든 노드 조회
    List<MindmapNode> findByWorkspaceId(Long workspaceId);


    // 워크스페이스 ID와 노드 ID로 단일 노드 조회
    Optional<MindmapNode> findByWorkspaceIdAndNodeId(Long workspaceId, Long nodeId);


    // 워크스페이스 ID와 노드 ID로 노드 삭제
    void deleteByWorkspaceIdAndNodeId(Long workspaceId, Long nodeId);


    // 워크스페이스 ID로 모든 노드 삭제
    // 워크스페이스 삭제 시 사용
    void deleteByWorkspaceId(Long workspaceId);

    /**
     * 키워드로 노드 검색 (대소문자 무시, 부분 일치)
     * Public 워크스페이스만 검색하려면 Service 레이어에서 필터링
     */
    @Query("{ 'keyword': { $regex: ?0, $options: 'i' } }")
    List<MindmapNode> findByKeywordContainingIgnoreCase(String keyword);

    /**
     * 특정 워크스페이스 목록에서 키워드 검색
     * @param workspaceIds Public 워크스페이스 ID 목록
     * @param keyword 검색 키워드
     */
    @Query("{ 'workspaceId': { $in: ?0 }, 'keyword': { $regex: ?1, $options: 'i' } }")
    List<MindmapNode> findByWorkspaceIdInAndKeywordContaining(List<Long> workspaceIds, String keyword);

    @Query("{ 'workspaceId': { $in: ?0 }, 'keyword': { $regex: '^?1$', $options: 'i' } }")
    List<MindmapNode> findByWorkspaceIdInAndKeywordEqualsIgnoreCase(List<Long> workspaceIds, String keyword);

    /**
     * 특정 워크스페이스의 부모 키워드로 자식 노드 검색
     */
    @Query("{ 'workspaceId': ?0, 'parentId': ?1 }")
    List<MindmapNode> findChildrenByWorkspaceIdAndParentId(Long workspaceId, Long parentId);

    /**
     * 여러 워크스페이스의 모든 노드 조회
     * @param workspaceIds Public 워크스페이스 ID 목록
     */
    List<MindmapNode> findByWorkspaceIdIn(List<Long> workspaceIds);

    // NodeRepository.java
    @Query("{ 'workspaceId': { $in: ?0 }, 'parentId': { $in: ?1 } }")
    List<MindmapNode> findByWorkspaceIdInAndParentIdIn(List<Long> workspaceIds,
                                                       List<Long> parentIds);

    List<MindmapNode> findByWorkspaceIdAndNodeIdIn(Long workspaceId, List<Long> nodeIds);

}
