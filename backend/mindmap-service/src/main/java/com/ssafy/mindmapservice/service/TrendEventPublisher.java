package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.WorkspaceServiceClientAdapter;
import com.ssafy.mindmapservice.dto.TrendEventType;
import com.ssafy.mindmapservice.dto.TrendRelationEvent;
import com.ssafy.mindmapservice.kafka.TrendEventBuffer;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrendEventPublisher {

    private final TrendEventBuffer buffer;

    public void publishRelationAdd(long workspaceId, String parent, String child, boolean isPublic) {
        if (!isPublic) return;

        long now = System.currentTimeMillis();
        String idemp = TrendEventBuffer.makeIdempotency(
                workspaceId, parent, child, TrendEventType.RELATION_ADD, now
        );

        buffer.offer(new TrendRelationEvent(
                TrendEventType.RELATION_ADD, now, workspaceId, parent, child, idemp
        ));
    }

    public void publishRelationView(long workspaceId, String parent, String child, boolean isPublic) {
        if (!isPublic) return;

        long now = System.currentTimeMillis();
        String idemp = TrendEventBuffer.makeIdempotency(
                workspaceId, parent, child, TrendEventType.RELATION_VIEW, now
        );

        buffer.offer(new TrendRelationEvent(
                TrendEventType.RELATION_VIEW, now, workspaceId, parent, child, idemp
        ));
    }
}