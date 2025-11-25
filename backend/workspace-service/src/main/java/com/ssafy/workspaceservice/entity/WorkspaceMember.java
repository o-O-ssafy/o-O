package com.ssafy.workspaceservice.entity;

import com.ssafy.workspaceservice.enums.PointerColor;
import com.ssafy.workspaceservice.enums.WorkspaceRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workspace_member")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(name = "user_id", nullable = false)
    private Long userId;                     // 외부 user-service PK

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)   // MAINTAINER / EDIT / VIEW
    private WorkspaceRole role;

    @CreationTimestamp
    @Column(name = "enter_time", nullable = false, updatable = false)
    private LocalDateTime enterTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "pointer_color", length = 20)
    private PointerColor pointerColor;

    public void changeRole(WorkspaceRole role) { this.role = role; }
    public void changePointerColor(PointerColor color) { this.pointerColor = color; }
}
