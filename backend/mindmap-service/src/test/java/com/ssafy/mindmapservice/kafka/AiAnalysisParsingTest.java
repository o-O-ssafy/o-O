package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.dto.kafka.AiAnalysisResult;
import org.junit.jupiter.api.Test;

class AiAnalysisParsingTest {

    @Test
    void testParsingMixedParentId() throws Exception {
        String json = """
        {
            "workspaceId": 200,
            "title": "한국어 학습 및 사용법",
            "aiSummary": "한국어를 배우고 사용하는 방법에 대한 정보입니다.",
            "status": "SUCCESS",
            "nodes": [
                {
                    "tempId": "temp-1",
                    "parentId": 1,
                    "keyword": "문법",
                    "memo": "국립국어원에서 정의한 표준어 규칙"
                },
                {
                    "tempId": "temp-2",
                    "parentId": "temp-1",
                    "keyword": "형태소",
                    "memo": "품사, 품사별 형태소"
                }
            ],
            "keyword": "한국어학습"
        }
        """;

        ObjectMapper objectMapper = new ObjectMapper();

        // 파싱이 성공하는지, 그리고 parentId 값이 제대로 들어오는지 확인
        AiAnalysisResult result = objectMapper.readValue(json, AiAnalysisResult.class);

        // 노드 개수 확인
        if (result.nodes().size() != 2) {
            throw new AssertionError("Expected 2 nodes but got " + result.nodes().size());
        }

        // 첫 번째 노드: parentId가 숫자 1
        String parentId1 = result.nodes().get(0).parentId();
        if (!"1".equals(parentId1)) {
            throw new AssertionError("Expected parentId '1' but got '" + parentId1 + "'");
        }

        // 두 번째 노드: parentId가 문자열 "temp-1"
        String parentId2 = result.nodes().get(1).parentId();
        if (!"temp-1".equals(parentId2)) {
            throw new AssertionError("Expected parentId 'temp-1' but got '" + parentId2 + "'");
        }
    }
}