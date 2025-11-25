package com.ssafy.workspaceservice.entity;

import com.ssafy.workspaceservice.enums.WorkspaceTheme;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workspace")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workspace_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkspaceTheme theme;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkspaceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkspaceVisibility visibility;

    @Column(nullable = false, length = 100)
    private String title;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 300)
    private String thumbnail;

    @Column(length = 300)
    private String startPrompt;

    @Column(unique = true, nullable = false, length = 36)
    private String token;

    public void changeVisibility(WorkspaceVisibility visibility) { this.visibility = visibility; }
    public void changeSubject(String subject) { this.title = subject; }
    public void changeThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public void changeTitle(String title) {this.title = title;}
    public void changeType(WorkspaceType type) { this.type = type; }

}
