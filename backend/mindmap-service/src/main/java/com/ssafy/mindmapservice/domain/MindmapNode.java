package com.ssafy.mindmapservice.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * 마인드맵 노드 엔티티
 * MongoDB 컬렉션: nodes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "nodes")
@CompoundIndex(name = "workspace_node_unique_idx",
        def = "{'workspaceId': 1, 'nodeId': 1}", unique = true)
public class MindmapNode {

    /**
     * MongoDB 내부 ID
     */
    @Id
    private String id;

    /**
     * 노드 고유 ID (서버에서 자동 생성)
     * 워크스페이스별로 1부터 자동 증가
     */
    @Indexed
    private Long nodeId;

    /**
     * 워크스페이스 ID (파티셔닝 키)
     */
    @Indexed
    private Long workspaceId;

    /**
     * 부모 노드 ID (트리 구조)
     * 루트 노드는 null
     */
    private Long parentId;

    /**
     * 노드 타입
     * 예: "text", "image", "video"
     */
    private String type;

    /**
     * 노드 키워드/제목
     */
    private String keyword;

    /**
     * 노드 메모 내용
     */
    private String memo;

    /**
     * AI 분석 상태
     * NONE: 분석 불필요 (텍스트 노드)
     * PENDING: 분석 요청됨
     * PROCESSING: 분석 중
     * DONE: 분석 완료
     * FAILED: 분석 실패
     */
    private AnalysisStatus analysisStatus;

    /**
     * 캔버스 X 좌표
     */
    private Double x;

    /**
     * 캔버스 Y 좌표
     */
    private Double y;

    /**
     * 노드 색상 (hex code)
     * 예: "#ffd700", "#3b82f6"
     */
    private String color;

    /**
     * 생성 시각
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * 수정 시각
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * AI 분석 상태 Enum
     */
    public enum AnalysisStatus {
        NONE,       // 분석 불필요
        PENDING,    // 분석 대기
        PROCESSING, // 분석 중
        DONE,       // 분석 완료
        FAILED      // 분석 실패
    }
}
