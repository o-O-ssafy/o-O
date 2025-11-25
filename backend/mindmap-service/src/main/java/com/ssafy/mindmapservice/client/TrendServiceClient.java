package com.ssafy.mindmapservice.client;

import com.ssafy.mindmapservice.dto.response.TrendResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "trend-service", url = "${service.trend.url}")
public interface TrendServiceClient {

    @GetMapping("/trend")
    TrendResponse getParentTrend(
            @RequestParam("parentKeyword") String parentKeyword,
            @RequestParam("period") String period,
            @RequestParam("limit") Integer limit
    );
}
