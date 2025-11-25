package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    Long countByWorkspaceId(Long workspaceId);
    void deleteByWorkspaceId(Long workspaceId);

    @Query("SELECT wm FROM WorkspaceMember wm WHERE wm.workspace.id IN :workspaceIds")
    List<WorkspaceMember> findByWorkspaceIds(@Param("workspaceIds") List<Long> workspaceIds);
}