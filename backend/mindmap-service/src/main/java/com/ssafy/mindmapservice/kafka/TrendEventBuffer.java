package com.ssafy.mindmapservice.kafka;

import com.ssafy.mindmapservice.dto.TrendEventType;
import com.ssafy.mindmapservice.dto.TrendRelationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrendEventBuffer {

    private final KafkaTemplate<String, String> kafkaTemplate; // 기존 템플릿 재사용
    @Value("${trend.kafka.topic:mindmap.relation.events}") private String topic;

    // 튜닝 포인트(기본값: 200ms / 500건)
    @Value("${trend.producer.flush-interval-ms:200}") private long flushIntervalMs;
    @Value("${trend.producer.max-batch:500}") private int maxBatch;

    private final BlockingQueue<TrendRelationEvent> queue = new LinkedBlockingQueue<>(50_000);
    private volatile boolean running = false;
    private Thread worker;

    private static final DateTimeFormatter MIN = DateTimeFormatter.ofPattern("yyyyMMddHHmm")
            .withZone(ZoneId.of("UTC"));

    /** 호출부는 event만 offer하면 됨 */
    public void offer(TrendRelationEvent e) {
        if (!queue.offer(e)) {
            // 가득 찼을 때의 정책: 버리거나(샘플링) 블로킹/재시도 중 선택
            log.warn("TrendEventBuffer queue full. Dropping event: {}->{}", e.parentKeyword(), e.childKeyword());
        }
    }

    @PostConstruct
    void start() {
        running = true;
        worker = new Thread(this::loop, "trend-event-flusher");
        worker.setDaemon(true);
        worker.start();
    }

    @PreDestroy
    void stop() throws InterruptedException {
        running = false;
        if (worker != null) worker.join(1000);
        flushAllRemaining();
    }

    private void loop() {
        List<TrendRelationEvent> batch = new ArrayList<>(maxBatch);
        while (running) {
            try {
                TrendRelationEvent first = queue.poll(flushIntervalMs, TimeUnit.MILLISECONDS);
                if (first != null) {
                    batch.add(first);
                    queue.drainTo(batch, maxBatch - 1);
                }
                if (!batch.isEmpty()) {
                    // 같은 키로 보내도 되고, 개별로 보내도 됨(여기선 개별 레코드 but 묶음으로 send 호출)
                    for (TrendRelationEvent e : batch) {
                        String key = e.parentKeyword(); // 파티셔닝 키
                        String json = toJson(e);
                        kafkaTemplate.send(topic, key, json);
                    }
                    batch.clear();
                }
            } catch (Exception e) {
                log.error("TrendEventBuffer flush loop error", e);
            }
        }
    }

    private void flushAllRemaining() {
        List<TrendRelationEvent> rem = new ArrayList<>(queue.size());
        queue.drainTo(rem);
        for (TrendRelationEvent e : rem) {
            try {
                kafkaTemplate.send(topic, e.parentKeyword(), toJson(e));
            } catch (Exception ex) {
                log.error("Flush remaining failed: {}", e, ex);
            }
        }
    }

    // 간단 JSON 직렬화 (userId/requestId 제거 버전)
    private String toJson(TrendRelationEvent e) {
        StringBuilder sb = new StringBuilder(256);
        sb.append('{')
                .append("\"type\":\"").append(e.type()).append("\",")
                .append("\"timestamp\":").append(e.timestamp()).append(',')
                .append("\"workspaceId\":").append(e.workspaceId()).append(',')
                .append("\"parentKeyword\":\"").append(escape(e.parentKeyword())).append("\",")
                .append("\"childKeyword\":\"").append(escape(e.childKeyword())).append("\",")
                .append("\"idempotencyKey\":\"").append(escape(e.idempotencyKey())).append("\"")
                .append('}');
        return sb.toString();
    }

    private String escape(String s) { return s.replace("\"", "\\\""); }

    public static String makeIdempotency(long wsId, String parent, String child, TrendEventType type, long ts) {
        return wsId + ":" + parent + ":" + child + ":" + type + ":" + MIN.format(Instant.ofEpochMilli(ts));
    }
}
