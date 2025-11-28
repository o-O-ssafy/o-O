import { useMutation } from "@tanstack/react-query";
import { restructureMindmap } from "@/services/mindmapService";
import type { RestructureMindmapResponseDTO } from "@/services/dto/mindmap.dto";

/**
 * React Query mutation hook for restructuring the entire mindmap
 *
 * This triggers GPT-based reorganization of all nodes in the workspace,
 * which may take 4-7 seconds to complete.
 *
 * NOTE: Real-time updates are handled by WebSocket "restructure_apply" message
 * in useYjsCollaboration.ts, so no manual query invalidation is needed.
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useRestructureMindmapMutation(workspaceId: string) {
  return useMutation<RestructureMindmapResponseDTO, Error, void>({
    mutationFn: () => restructureMindmap(workspaceId),
    // WebSocket handles Y.Map updates, no need to invalidate queries
  });
}
