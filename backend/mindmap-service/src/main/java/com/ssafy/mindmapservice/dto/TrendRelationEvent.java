package com.ssafy.mindmapservice.dto;

public record TrendRelationEvent(
        TrendEventType type,
        long timestamp,
        long workspaceId,
        String parentKeyword,
        String childKeyword,
        String idempotencyKey
) {}