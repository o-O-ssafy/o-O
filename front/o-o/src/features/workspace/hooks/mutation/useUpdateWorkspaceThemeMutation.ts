import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type WorkspaceTheme } from "@/services/dto/workspace.dto";
import { updateWorkspaceTheme } from "@/services/workspaceService";
import { useToast } from "@/shared/ui/ToastProvider";

interface UpdateWorkspaceThemeParams {
  workspaceId: string | number;
  theme: WorkspaceTheme;
}

export const useUpdateWorkspaceThemeMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<void, Error, UpdateWorkspaceThemeParams>({
    mutationKey: ["workspace", "updateTheme"],
    mutationFn: ({ workspaceId, theme }) =>
      updateWorkspaceTheme(workspaceId, theme),
    onSuccess: (_, variables) => {
      showToast("테마가 변경되었습니다.", "success");
      queryClient.invalidateQueries({
        queryKey: ["workspace", String(variables.workspaceId)]
      });
    },
    onError: (error) => {
      if (error.message.includes("403")) {
        showToast("테마를 변경할 권한이 없습니다.", "error");
      } else if (error.message.includes("404")) {
        showToast("워크스페이스를 찾을 수 없습니다.", "error");
      } else {
        showToast("테마 변경에 실패했습니다.", "error");
      }
    },
  });
};
