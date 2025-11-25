package com.ssafy.gatewayservice.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class LoggingFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        long start = System.currentTimeMillis();

        return chain.filter(exchange)
                .doOnSuccess(aVoid -> {
                    long end = System.currentTimeMillis();

                    String path = exchange.getRequest().getURI().getPath();
                    long duration = end - start;

                    log.info("[GATEWAY] {} -> {}ms", path, duration);
                });
    }
}
