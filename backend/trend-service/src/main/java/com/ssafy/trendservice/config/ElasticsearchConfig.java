// trend-service: src/main/java/com/ssafy/trendservice/config/ElasticsearchConfig.java
package com.ssafy.trendservice.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class ElasticsearchConfig {

    @Value("${elasticsearch.host}")
    private String esUrl;

    @Bean
    public RestClient restClient() {
        return RestClient.builder(HttpHost.create(esUrl)).build();
    }

    // ES에서 쓸 ObjectMapper
    @Bean
    public ObjectMapper elasticsearchObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        // Instant를 timestamp 숫자 말고 ISO 문자열로 쓰고 싶으면
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient,
                                                   ObjectMapper elasticsearchObjectMapper) {
        JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper(elasticsearchObjectMapper);
        ElasticsearchTransport transport = new RestClientTransport(restClient, jsonpMapper);
        return new ElasticsearchClient(transport);
    }
}

