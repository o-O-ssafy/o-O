package com.ssafy.gatewayservice.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

//Gateway에서 여러 마이크로서비스의 Swagger UI를 통합
//각 서비스의 API 문서를 드롭다운으로 선택하여 확인 가능
//URL: http://localhost:8080/swagger-ui.html
@Configuration
public class SwaggerConfig {

    @Bean
    public GroupedOpenApi userServiceApi() {
        return GroupedOpenApi.builder()
                .group("user-service")
                .pathsToMatch("/auth/**", "/oauth2/**", "/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi workspaceServiceApi() {
        return GroupedOpenApi.builder()
                .group("workspace-service")
                .pathsToMatch("/workspace/**")
                .build();
    }

    @Bean
    public GroupedOpenApi mindmapServiceApi() {
        return GroupedOpenApi.builder()
                .group("mindmap-service")
                .pathsToMatch("/mindmap/**")
                .build();
    }

    @Bean
    public GroupedOpenApi trendServiceApi() {
        return GroupedOpenApi.builder()
                .group("trend-service")
                .pathsToMatch("/trend/**")
                .build();
    }
}