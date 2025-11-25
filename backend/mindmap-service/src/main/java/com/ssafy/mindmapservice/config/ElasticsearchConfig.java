package com.ssafy.mindmapservice.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {

    @Value("${elasticsearch.host}")
    private String esHost;

    @Bean
    public RestClient restClient() {
        return RestClient.builder(HttpHost.create(esHost)).build();
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient,
                                                   ObjectMapper objectMapper) {
        // 👇 Spring이 이미 JavaTimeModule 등 다 등록해둔 ObjectMapper 사용
        JacksonJsonpMapper mapper = new JacksonJsonpMapper(objectMapper);

        ElasticsearchTransport transport =
                new RestClientTransport(restClient, mapper);

        return new ElasticsearchClient(transport);
    }
}
