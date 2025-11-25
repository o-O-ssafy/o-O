package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.dto.response.KeywordListResponse;
import com.ssafy.mindmapservice.dto.response.KeywordNodeSearchResponse;
import com.ssafy.mindmapservice.dto.response.PublicRelationSearchResponse;
import com.ssafy.mindmapservice.service.PublicWorkspaceSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public 워크스페이스 검색 API
 * Trend-service에서 호출하는 내부 API
 */
@Tag(name = "Public Search API", description = "Public 워크스페이스 검색 (Trend용)")
@Slf4j
@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
public class PublicSearchController {

    private final PublicWorkspaceSearchService searchService;

    @Operation(
            summary = "Public 워크스페이스에서 관계 검색",
            description = """
            Public 워크스페이스에서 키워드로 검색하여 부모-자식 관계 목록을 반환합니다.
            
            ### 사용 사례
            - Trend-service가 DB에 없는 신규 관계를 찾을 때
            - Public으로 전환된 워크스페이스의 기존 데이터 조회
            
            ### 응답 내용
            - 검색 키워드를 포함하는 노드의 부모-자식 관계
            - 중복 제거된 관계 목록
            """
    )
    @GetMapping("/relations")
    public ResponseEntity<PublicRelationSearchResponse> searchRelations(
            @Parameter(description = "검색 키워드 (부모 또는 자식)", example = "java")
            @RequestParam String keyword,

            @Parameter(description = "최대 결과 수", example = "100")
            @RequestParam(defaultValue = "100") Integer limit
    ) {
        log.info("GET /api/public/search/relations - keyword={}, limit={}", keyword, limit);

        PublicRelationSearchResponse response = searchService.searchPublicRelations(keyword, limit);

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "특정 부모의 자식 노드 검색",
            description = """
            Public 워크스페이스에서 특정 부모 키워드의 모든 자식 노드를 검색합니다.
            
            ### 사용 사례
            - Trend-service의 /trend/{parent} API가 DB에 없는 자식 찾을 때
            """
    )
    @GetMapping("/children")
    public ResponseEntity<KeywordNodeSearchResponse> searchChildren(
            @Parameter(description = "부모 키워드", example = "spring")
            @RequestParam String parentKeyword,

            @Parameter(description = "최대 결과 수", example = "100")
            @RequestParam(defaultValue = "100") Integer limit
    ) {
        log.info("GET /api/public/search/children - parent={}, limit={}", parentKeyword, limit);

        KeywordNodeSearchResponse response = searchService.searchChildrenByParent(parentKeyword, limit);

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Public 워크스페이스 키워드 LIKE 검색",
            description = """
                Public 워크스페이스 전체에서 keyword LIKE 검색을 수행하고,
                중복 제거된 키워드 목록만 반환합니다.
                
                Trend-service에서 전체 트렌드 검색(source 확장용)으로 사용.
                """
    )
    @GetMapping("/keywords")
    public ResponseEntity<KeywordListResponse> searchKeywords(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "100") Integer limit
    ) {
        log.info("GET /api/public/search/keywords - keyword={}, limit={}", keyword, limit);

        List<String> keywords = searchService.searchPublicKeywords(keyword, limit);

        return ResponseEntity.ok(
                KeywordListResponse.builder()
                        .keywords(keywords)
                        .totalCount(keywords.size())
                        .build()
        );
    }
}