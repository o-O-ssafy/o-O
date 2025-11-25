package com.ssafy.mindmapservice.config;

import feign.Request;
import feign.Retryer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class GmsOpenAiFeignConfig {

    @Bean
    public Request.Options requestOptions() {
        return new Request.Options(
                10, TimeUnit.SECONDS,    // connectTimeout
                120, TimeUnit.SECONDS,   // readTimeout
                true                     // followRedirects
        );
    }

    @Bean
    public Retryer retryer() {
        return new Retryer.Default(
                1000,   // 초기 대기 시간 (1초)
                5000,   // 최대 대기 시간 (5초)
                3       // 최대 재시도 횟수
        );
    }
}