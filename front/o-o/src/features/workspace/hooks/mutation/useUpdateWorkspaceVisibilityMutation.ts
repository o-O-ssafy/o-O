import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type WorkspaceVisibility } from "@/services/dto/workspace.dto";
import { updateWorkspaceVisibility } from "@/services/workspaceService";
import { useToast } from "@/shared/ui/ToastProvider";
import type { YClient } from "../custom/yjsClient";

interface UpdateWorkspaceVisibilityParams {
  workspaceId: string | number;
  visibility: WorkspaceVisibility;
}

export const useUpdateWorkspaceVisibilityMutation = (yclient?: YClient | null) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<void, Error, UpdateWorkspaceVisibilityParams>({
    mutationKey: ["workspace", "updateVisibility"],
    mutationFn: ({ workspaceId, visibility }) => {
      console.log("[useUpdateWorkspaceVisibilityMutation] API call:", {
        workspaceId,
        visibility,
      });
      return updateWorkspaceVisibility(workspaceId, visibility);
    },
    onSuccess: () => {
      console.log("[useUpdateWorkspaceVisibilityMutation] API success");
      showToast("워크스페이스 공개 설정이 변경되었습니다.", "success");

      // WebSocket으로 visibility-changed 메시지 전송 (sendJsonMessage 사용)
      if (yclient) {
        const message = {
          type: 'visibility-changed',
        };

        const sent = yclient.sendJsonMessage(message);
        if (sent) {
          console.log("[useUpdateWorkspaceVisibilityMutation] Sent visibility-changed via WebSocket:", message);
        } else {
          console.warn("[useUpdateWorkspaceVisibilityMutation] Failed to send visibility-changed message");
        }
      } else {
        console.warn("[useUpdateWorkspaceVisibilityMutation] YClient not available");
      }

      // Invalidate workspace queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error) => {
      console.error("[useUpdateWorkspaceVisibilityMutation] API failed:", error);

      if (error.message.includes("403")) {
        showToast("권한이 없습니다.", "error");
      } else if (error.message.includes("404")) {
        showToast("워크스페이스를 찾을 수 없습니다.", "error");
      } else {
        showToast("공개 설정 변경에 실패했습니다.", "error");
      }
    },
  });
};
