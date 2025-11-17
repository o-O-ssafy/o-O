import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type WorkspaceRole } from "@/services/dto/workspace.dto";
import { updateMemberRole } from "@/services/workspaceService";
import { useToast } from "@/shared/ui/ToastProvider";
import type { YClient } from "../custom/yjsClient";

interface UpdateMemberRoleParams {
  workspaceId: string | number;
  targetUserId: number;
  role: WorkspaceRole;
}

export const useUpdateMemberRoleMutation = (yclient?: YClient | null) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<void, Error, UpdateMemberRoleParams>({
    mutationKey: ["workspace", "updateMemberRole"],
    mutationFn: ({ workspaceId, targetUserId, role }) => {
      console.log("[useUpdateMemberRoleMutation] API call:", {
        workspaceId,
        targetUserId,
        role,
      });
      return updateMemberRole(workspaceId, targetUserId, role);
    },
    onSuccess: (_, variables) => {
      console.log("[useUpdateMemberRoleMutation] API success:", variables);
      showToast("멤버 권한이 변경되었습니다.", "success");

      // WebSocket으로 role-changed 메시지 전송 (최소 정보만)
      if (yclient?.provider?.ws) {
        const ws = yclient.provider.ws;

        // WebSocket 연결 상태 확인 (1 = OPEN)
        if (ws.readyState === 1) {
          const message = {
            type: 'role-changed',
            targetUserId: variables.targetUserId,
          };

          ws.send(JSON.stringify(message));
          console.log("[useUpdateMemberRoleMutation] Sent role-changed via WebSocket:", message);
        } else {
          console.warn("[useUpdateMemberRoleMutation] WebSocket not open, readyState:", ws.readyState);
        }
      } else {
        console.warn("[useUpdateMemberRoleMutation] YClient or WebSocket not available");
      }

      // Invalidate workspace queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error, variables) => {
      console.error("[useUpdateMemberRoleMutation] API failed:", {
        error,
        errorMessage: error.message,
        variables,
      });

      if (error.message.includes("403")) {
        showToast("권한이 없습니다.", "error");
      } else if (error.message.includes("404")) {
        showToast("멤버를 찾을 수 없습니다.", "error");
      } else {
        showToast("권한 변경에 실패했습니다.", "error");
      }
    },
  });
};
