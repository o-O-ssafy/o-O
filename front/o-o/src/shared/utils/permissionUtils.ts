import type { WorkspaceRole } from "@/services/dto/workspace.dto";

/**
 * 워크스페이스 노드 수정/삭제 권한 체크
 * @param role - 사용자의 워크스페이스 역할
 * @returns MAINTAINER 또는 EDIT 역할일 때 true
 */
export const canEditWorkspace = (role?: WorkspaceRole | null): boolean => {
  return role === "MAINTAINER" || role === "EDIT";
};

/**
 * 워크스페이스 조회 권한 체크
 * @param role - 사용자의 워크스페이스 역할
 * @returns role이 존재하면 true
 */
export const canViewWorkspace = (role?: WorkspaceRole | null): boolean => {
  return !!role;
};

/**
 * 워크스페이스 멤버 관리 권한 체크 (권한 변경, 멤버 초대 등)
 * @param role - 사용자의 워크스페이스 역할
 * @returns MAINTAINER 역할일 때만 true
 */
export const canManageMembers = (role?: WorkspaceRole | null): boolean => {
  return role === "MAINTAINER";
};
