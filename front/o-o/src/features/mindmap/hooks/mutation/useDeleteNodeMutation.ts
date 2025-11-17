import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMindmapNode } from "@/services/mindmapService";

type DeleteNodeRequest = {
  nodeId: number;
};

/**
 * React Query mutation hook for deleting a mindmap node
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useDeleteNodeMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteNodeRequest>({
    mutationFn: ({ nodeId }: DeleteNodeRequest) => {
      // 루트 노드(nodeId === 1) 삭제 방지
      if (nodeId === 1) {
        console.warn("[useDeleteNodeMutation] 루트 노드는 삭제할 수 없습니다.");
        return Promise.reject(new Error("루트 노드는 삭제할 수 없습니다."));
      }
      return deleteMindmapNode(workspaceId, nodeId);
    },
    onSuccess: () => {
      // Invalidate nodes query to refetch
      queryClient.invalidateQueries({ queryKey: ["mindmap", "nodes", workspaceId] });
    },
  });
}
