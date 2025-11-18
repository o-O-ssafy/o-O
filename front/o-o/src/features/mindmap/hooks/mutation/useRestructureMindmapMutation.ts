import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restructureMindmap } from "@/services/mindmapService";
import type { RestructureMindmapResponseDTO } from "@/services/dto/mindmap.dto";

/**
 * React Query mutation hook for restructuring the entire mindmap
 *
 * This triggers GPT-based reorganization of all nodes in the workspace,
 * which may take 4-7 seconds to complete.
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useRestructureMindmapMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<RestructureMindmapResponseDTO, Error, void>({
    mutationFn: () => restructureMindmap(workspaceId),
    onSuccess: () => {
      // Invalidate nodes query to refetch restructured mindmap
      queryClient.invalidateQueries({
        queryKey: ["mindmap", "nodes", workspaceId]
      });
    },
  });
}
