package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.domain.NodeSequence;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Service;

/**
 * 워크스페이스별로 자동 증가하는 nodeId를 생성하는 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SequenceGeneratorService {

    private final MongoTemplate mongoTemplate;

    /**
     * 워크스페이스별로 다음 nodeId를 생성합니다.
     * 원자적(atomic) 연산으로 동시성 문제를 방지합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @return 다음 nodeId (1부터 시작)
     */
    public Long generateNextNodeId(Long workspaceId) {
        Query query = new Query(Criteria.where("workspaceId").is(workspaceId));

        Update update = new Update().inc("sequence", 1);

        FindAndModifyOptions options = new FindAndModifyOptions()
                .returnNew(true)  // 업데이트된 값을 반환
                .upsert(true);    // 없으면 생성 (첫 번째 노드는 1부터 시작)

        NodeSequence sequence = mongoTemplate.findAndModify(
                query,
                update,
                options,
                NodeSequence.class
        );

        if (sequence == null) {
            // upsert로 생성되는 경우 sequence는 1
            log.info("Created new sequence for workspace: {}", workspaceId);
            return 1L;
        }

        log.debug("Generated nodeId {} for workspace {}", sequence.getSequence(), workspaceId);
        return sequence.getSequence();
    }
}
