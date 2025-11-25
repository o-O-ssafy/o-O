package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.entity.WorkspaceMember;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    Optional<Workspace> findByToken(String token);

    // 내가 속한 워크스페이스 전체 (cursor 없을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesInitial(
            @Param("userId") Long userId,
            Pageable pageable
    );

    // 내가 속한 워크스페이스 전체 (cursor 있을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.id < :cursor " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesWithCursor(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    // 내가 속한 워크스페이스 (타입 필터, cursor 없을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.type = :type " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesByTypeInitial(
            @Param("userId") Long userId,
            @Param("type") WorkspaceType type,
            Pageable pageable
    );

    // 내가 속한 워크스페이스 (타입 필터, cursor 있을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.type = :type " +
           "AND w.id < :cursor " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesByTypeWithCursor(
            @Param("userId") Long userId,
            @Param("type") WorkspaceType type,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findAllMyRecentWorkspaces(
            @Param("userId") Long userId
    );

    @Query("SELECT w.id FROM Workspace w WHERE w.visibility = :visibility")
    List<Long> findIdsByVisibility(@Param("visibility") WorkspaceVisibility visibility);

    Optional<WorkspaceVisibilityView> findVisibilityById(Long id);

    // 월별 활성 날짜 조회 (내가 멤버인 워크스페이스의 생성 날짜)
    @Query(value = """
            SELECT DISTINCT EXTRACT(DAY FROM w.created_at)::INTEGER AS day
            FROM workspace w
            JOIN workspace_member wm ON wm.workspace_id = w.workspace_id
            WHERE wm.user_id = :userId
              AND w.created_at >= make_date(:year, :month, 1)
              AND w.created_at < make_date(:year, :month, 1) + interval '1 month'
            ORDER BY day
            """,
            nativeQuery = true)
    List<Integer> findActiveDaysByUserAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month
    );

    // 특정 날짜에 생성된 내 워크스페이스 ID 목록 조회
    @Query(value = """
            SELECT workspace_id FROM (
                SELECT DISTINCT w.workspace_id, w.created_at
                FROM workspace w
                JOIN workspace_member wm ON wm.workspace_id = w.workspace_id
                WHERE wm.user_id = :userId
                  AND DATE(w.created_at) = DATE(:date)
            ) sub
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<Long> findWorkspaceIdsByUserAndDate(
            @Param("userId") Long userId,
            @Param("date") LocalDateTime date
    );

    // 특정 월에 생성된 내 워크스페이스 목록 조회 (워크스페이스 엔티티 전체)
    @Query(value = """
            SELECT DISTINCT w.*
            FROM workspace w
            JOIN workspace_member wm ON wm.workspace_id = w.workspace_id
            WHERE wm.user_id = :userId
              AND w.created_at >= make_date(:year, :month, 1)
              AND w.created_at < make_date(:year, :month, 1) + interval '1 month'
            ORDER BY w.created_at DESC
            """,
            nativeQuery = true)
    List<Workspace> findWorkspacesByUserAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("SELECT wm FROM WorkspaceMember wm WHERE wm.workspace.id IN :workspaceIds")
    List<WorkspaceMember> findByWorkspaceIdIn(@Param("workspaceIds") List<Long> workspaceIds);

}