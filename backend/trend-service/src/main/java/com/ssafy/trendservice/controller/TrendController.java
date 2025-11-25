package com.ssafy.trendservice.controller;

import com.ssafy.trendservice.dto.response.TrendResponse;
import com.ssafy.trendservice.service.TrendQueryService;
import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 트렌드 REST API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/trend")
@RequiredArgsConstructor
@Validated
public class TrendController {

    private final TrendQueryService queryService;

    /**
     * 글로벌 트렌드 조회
     * GET /trend/top?period=7d&limit=20
     */
    @Operation(
            summary = "글로벌 트렌드 상위 키워드 조회",
            description = """
                    전체 사용자/워크스페이스 기준으로 상위 트렌드 키워드를 조회합니다.
                    - 기간(period)에 따라 7일/30일 집계 결과를 반환합니다.
                    - limit가 null이면 서비스 내부 기본값(예: 5 )이 사용됩니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "정상적으로 트렌드 목록을 조회했습니다.",
                    content = @Content(schema = @Schema(implementation = TrendResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "요청 파라미터가 유효하지 않습니다 (period 값 오류, limit 범위 벗어남 등).",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "요청한 리소스를 찾을 수 없습니다. (잘못된 URL 또는 라우팅 문제일 가능성이 큼)",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류가 발생했습니다.",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            )
    })
    @GetMapping("/top")
    @Timed(value = "trend.query.global", description = "Global trend query time")
    public ResponseEntity<TrendResponse> getGlobalTop(
            @Parameter(
                    description = "집계 기간 (7일/30일)",
                    example = "7d"
            )
            @RequestParam(defaultValue = "7d")
            @Pattern(regexp = "^(7d|30d)$", message = "Period must be either '7d' or '30d'")
            String period,

            @Parameter(
                    description = "최대 결과 수 (1~100). null이면 기본값(예: 5 or 50) 사용",
                    example = "5"
            )
            @RequestParam(required = false)
            @Min(1) @Max(100)
            Integer limit
    ) {
        log.info("[GlobalTrend] Request received - period={}, limit={}", period, limit);
        TrendResponse response = queryService.getGlobalTop(period, limit);
        log.info("[GlobalTrend] Response - period={}, totalCount={}", response.getPeriod(), response.getTotalCount());
        return ResponseEntity.ok(response);
    }

    /**
     * 부모 키워드의 자식 트렌드 조회
     * GET /trend/{parentKeyword}?period=7d&limit=20
     */
    @Operation(
            summary = "부모 키워드 기준 자식 트렌드 조회",
            description = """
                    특정 부모 키워드(예: '알고리즘', 'spring')를 기준으로,
                    그 키워드의 '자식 키워드' 트렌드를 조회합니다.
                    
                    내부적으로는:
                    1) mindmap-service에서 부모 키워드의 자식 노드 목록을 가져오고
                    2) 해당 자식 키워드들에 대해 트렌드 점수를 붙여서 정렬한 뒤 반환합니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "정상적으로 부모 키워드의 자식 트렌드를 조회했습니다. (결과가 없으면 items가 빈 배열일 수 있습니다.)",
                    content = @Content(schema = @Schema(implementation = TrendResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "요청 파라미터가 유효하지 않습니다 (period 값 오류, limit 범위 벗어남 등).",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = """
                            해당 부모 키워드에 대한 데이터가 존재하지 않거나,
                            연관된 public mindmap 자식 노드가 없는 경우.
                            (실제 404 처리는 서비스/예외 처리 로직에 따라 달라질 수 있습니다.)
                            """,
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류가 발생했습니다.",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            )
    })
    @GetMapping("")
    @Timed(value = "trend.query.parent", description = "Parent trend query time")
    public ResponseEntity<TrendResponse> getParentTrend(
            @Parameter(
                    description = "부모 키워드 (예: '알고리즘', 'spring', 'java')",
                    example = "알고리즘"
            )
            @RequestParam String parentKeyword,

            @Parameter(
                    description = "집계 기간 (7일/30일)",
                    example = "7d"
            )
            @RequestParam(defaultValue = "7d")
            @Pattern(regexp = "^(7d|30d)$", message = "Period must be either '7d' or '30d'")
            String period,

            @Parameter(
                    description = "최대 결과 수 (1~100). null이면 기본값 사용",
                    example = "99"
            )
            @RequestParam(required = false)
            @Min(1) @Max(100)
            Integer limit
    ) {
        log.info("[ParentTrend] Request - parentKeyword='{}', period={}, limit={}", parentKeyword, period, limit);
        TrendResponse response = queryService.getParentTrend(parentKeyword, period, limit);
        log.info("[ParentTrend] Response - parentKeyword='{}', period={}, totalCount={}",
                parentKeyword, response.getPeriod(), response.getTotalCount());
        return ResponseEntity.ok(response);
    }

    /**
     * 키워드 검색
     * GET /trend/search?keyword=java&period=7d&limit=20
     */
    @Operation(
            summary = "키워드 기반 트렌드 검색",
            description = """
                    특정 키워드에 대해 연관 트렌드(또는 그 키워드 자체의 트렌드)를 조회합니다.
                    - keyword: 검색할 키워드 (예: 'java', 'python')
                    - period: 7일/30일 집계 선택
                    - limit: 최대 반환 개수
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "정상적으로 키워드 트렌드를 조회했습니다.",
                    content = @Content(schema = @Schema(implementation = TrendResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "요청 파라미터가 유효하지 않습니다 (keyword 누락, period 값 오류, limit 범위 벗어남 등).",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "해당 키워드에 대한 트렌드 데이터가 존재하지 않습니다.",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 내부 오류가 발생했습니다.",
                    content = @Content(schema = @Schema(implementation = com.ssafy.trendservice.dto.response.ErrorResponse.class))
            )
    })
    @GetMapping("/search")
    @Timed(value = "trend.query.search", description = "Trend search query time")
    public ResponseEntity<TrendResponse> searchTrend(
            @Parameter(
                    description = "검색할 키워드 (예: 'java', 'python')",
                    example = "java"
            )
            @RequestParam String keyword,

            @Parameter(
                    description = "집계 기간 (7일/30일)",
                    example = "30d"
            )
            @RequestParam(defaultValue = "30d")
            @Pattern(regexp = "^(7d|30d)$", message = "Period must be either '7d' or '30d'")
            String period,

            @Parameter(
                    description = "최대 결과 수 (1~100). null이면 기본값 사용",
                    example = "5"
            )
            @RequestParam(required = false)
            @Min(1) @Max(100)
            Integer limit
    ) {
        log.info("[SearchTrend] Request - keyword='{}', period={}, limit={}", keyword, period, limit);
        TrendResponse response = queryService.searchTrend(keyword, period, limit);
        log.info("[SearchTrend] Response - keyword='{}', period={}, totalCount={}",
                keyword, response.getPeriod(), response.getTotalCount());
        return ResponseEntity.ok(response);
    }
}
