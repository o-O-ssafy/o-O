package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.service.PublicIndexSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class PublicIndexController {

    private final PublicIndexSyncService publicIndexSyncService;

    @PostMapping("/workspaces/{workspaceId}")
    public ResponseEntity<Void> bulkIndexWorkspace(@PathVariable Long workspaceId) {
        publicIndexSyncService.bulkIndexWorkspace(workspaceId);
        return ResponseEntity.accepted().build();
    }
}