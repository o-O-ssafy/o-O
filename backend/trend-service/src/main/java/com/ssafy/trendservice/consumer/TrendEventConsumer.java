package com.ssafy.trendservice.consumer;

import com.ssafy.trendservice.dto.event.RelationEvent;
import com.ssafy.trendservice.service.TrendCountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Kafka 이벤트 컨슈머
 * - RELATION_ADD, RELATION_VIEW 이벤트 수신
 * - 배치 단위로 처리 후 수동 커밋
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TrendEventConsumer {

    private final TrendCountService countService;

    @KafkaListener(
            topics = "${trend.kafka.topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(
            @Payload List<RelationEvent> events,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment
    ) {
        try {
            log.info("Received {} events from partition {} at offset {}",
                    events.size(), partition, offset);

            // 각 이벤트 처리
            for (RelationEvent event : events) {
                try {
                    countService.processEvent(event);
                } catch (Exception e) {
                    log.error("Failed to process event: {}", event, e);
                    // 개별 이벤트 실패는 로깅만 하고 계속 진행
                }
            }

            // 수동 커밋
            acknowledgment.acknowledge();
            log.debug("Successfully processed and committed {} events", events.size());

        } catch (Exception e) {
            log.error("Error consuming events", e);
            // 배치 전체 실패 시 재처리를 위해 커밋하지 않음
            throw e;
        }
    }
}