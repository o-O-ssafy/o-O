package com.ssafy.mindmapservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Mindmap Service API",
                version = "v1.0",
                description = "마인드맵 노드 관리 및 실시간 협업 API"
        ),
        servers = {
                @Server
                        (
                                url = "https://api.o-o.io.kr/",
                                description = "Production - Gateway through Mindmap Service"
                        ),
                @Server
                        (
                                url = "http://localhost:8082/",
                                description = "Local - Direct Mindmap Service"
                        )
        },
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class SwaggerConfig {
}
