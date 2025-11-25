package com.ssafy.mindmapservice.dto.response;


import com.ssafy.mindmapservice.dto.kafka.AiSuggestionNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class AiTrendSuggestionResponse {

    private Long workspaceId;
    private Long targetNodeId;

    private List<AiSuggestionNode> aiList;      // AI 추천
    private List<TrendItem> trendList;          // 트렌드 추천
}
