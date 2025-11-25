package com.ssafy.trendservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableFeignClients(basePackages = "com.ssafy.trendservice.client")
public class TrendServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrendServiceApplication.class, args);
    }

}
