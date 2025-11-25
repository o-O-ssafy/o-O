package com.ssafy.mindmapservice.dto.kafka;

import java.util.List;

public record AiContextualSuggestion(
        Long workspaceId,           // 워크스페이스 ID
        Long targetNodeId,          // 사용자가 "이 노드 확장" 눌렀던 기준 노드
        List<AiSuggestionNode> suggestions
) {}