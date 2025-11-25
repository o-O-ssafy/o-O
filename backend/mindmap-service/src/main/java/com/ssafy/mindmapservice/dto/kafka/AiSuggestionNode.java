package com.ssafy.mindmapservice.dto.kafka;

import java.util.List;

public record AiSuggestionNode(
        String tempId,     // AI 내부 임시 ID (있으면 그대로, 없으면 null 가능)
        Long parentId,     // 추천이 붙을 부모 노드 ID
        String keyword,    // 노드 제목
        String memo        // 설명/메모
) {}