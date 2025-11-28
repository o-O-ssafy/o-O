import { useMutation } from "@tanstack/react-query";
import type { JoinWorkspaceResponseDTO } from "@/services/dto/workspace.dto";
import { joinWorkspaceByToken } from "@/services/workspaceService";

export const useJoinWorkspaceMutation = () =>
  useMutation<JoinWorkspaceResponseDTO, unknown, string>({
    mutationKey: ["workspace", "join"],
    mutationFn: (token) => joinWorkspaceByToken(token),
  });
