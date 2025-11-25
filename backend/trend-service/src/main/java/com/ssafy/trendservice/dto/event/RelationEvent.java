package com.ssafy.trendservice.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationEvent {

    // ⬅️ 필드명은 반드시 "type" (프로듀서 JSON과 동일)
    @JsonProperty("type")
    private EventType type;          // RELATION_ADD

    @JsonProperty("timestamp")
    private long timestamp;          // epoch millis

    @JsonProperty("workspaceId")
    private long workspaceId;

    @JsonProperty("parentKeyword")
    private String parentKeyword;

    @JsonProperty("childKeyword")
    private String childKeyword;

    @JsonProperty("idempotencyKey")
    private String idempotencyKey;
}
