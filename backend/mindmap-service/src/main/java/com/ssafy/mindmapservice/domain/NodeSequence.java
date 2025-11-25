package com.ssafy.mindmapservice.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 워크스페이스별 nodeId 시퀀스를 관리하는 엔티티
 * 각 워크스페이스마다 1부터 시작하는 nodeId를 자동 생성
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sequences")
public class NodeSequence {

    @Id
    private String id;  // MongoDB 내부 ID

    @Indexed(unique = true)
    private Long workspaceId;  // workspace 테이블의 ID (RDBMS)

    private Long sequence;  // 다음 nodeId (1, 2, 3...)
}
