import { useMutation } from "@tanstack/react-query";
import {
  type CreateWorkspaceRequestDTO,
  type CreateWorkspaceResponseDTO,
} from "@/services/dto/workspace.dto";
import { createWorkspace } from "@/services/workspaceService";

export const useCreateWorkspaceMutation = () =>
  useMutation<
    CreateWorkspaceResponseDTO,
    unknown,
    CreateWorkspaceRequestDTO | undefined
  >({
    mutationKey: ["workspace", "create"],
    mutationFn: (payload) => createWorkspace(payload),
  });
