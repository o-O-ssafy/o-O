import { useMemo } from "react";
import type { WorkspaceRole } from "@/services/dto/workspace.dto";
import { useWorkspaceAccessQuery } from "../query/useWorkspaceAccessQuery";
import {
  canEditWorkspace,
  canViewWorkspace,
  canManageMembers,
} from "@/shared/utils/permissionUtils";

interface UseWorkspacePermissionsResult {
  myRole: WorkspaceRole | undefined;
  isMember: boolean;
  canEdit: boolean;
  canView: boolean;
  canManage: boolean;
  isLoading: boolean;
}

/**
 * 워크스페이스 권한 정보를 제공하는 훅
 *
 * useWorkspaceAccessQuery를 래핑하여 권한 체크 헬퍼 함수를 적용한 결과를 반환
 *
 * @param workspaceId - 워크스페이스 ID
 * @returns 역할 정보 및 권한 체크 결과
 */
export function useWorkspacePermissions(
  workspaceId: string
): UseWorkspacePermissionsResult {
  const { workspace, isLoading } = useWorkspaceAccessQuery(workspaceId);

  return useMemo(
    () => ({
      myRole: workspace?.myRole,
      isMember: workspace?.isMember ?? false,
      canEdit: canEditWorkspace(workspace?.myRole),
      canView: canViewWorkspace(workspace?.myRole),
      canManage: canManageMembers(workspace?.myRole),
      isLoading,
    }),
    [workspace?.myRole, workspace?.isMember, isLoading]
  );
}
