import { useState, useCallback, useEffect } from "react";
import type { NodeData, DetachedSelectionState, EditNodePayload } from "../../types";
import type { YMapCrud } from "../../../workspace/hooks/custom/yMapCrud";

/**
 * 분리된 노드 선택 상태 관리 훅
 *
 * **주요 기능:**
 * - 노드 삭제 시 자식 노드를 유지하는 경우, 자식들의 부모 재연결 처리
 * - "자식 유지 삭제" 시 자식 노드들을 detached selection으로 등록
 * - 사용자가 연결/해제 결정을 내릴 수 있도록 상태 관리
 * - anchor 노드가 삭제되면 자동으로 detached selection 제거 (cleanup)
 *
 * **사용 시나리오:**
 * 1. 사용자가 부모 노드를 삭제하면서 "자식 유지" 선택
 * 2. 자식 노드들이 detachedSelectionMap에 등록됨
 * 3. UI에서 각 자식에 대해 "연결" 또는 "해제" 선택 가능
 * 4. 연결: 지정된 새 부모에 연결 / 해제: 그냥 dismiss
 *
 * @param nodes - 전체 노드 배열
 * @param handleEditNode - 노드 수정 핸들러 (부모 연결 변경용)
 * @returns detached selection 상태 및 핸들러들
 */
export function useDetachedSelection(
  nodes: NodeData[],
  handleEditNode: (payload: EditNodePayload) => void
) {
  const [detachedSelectionMap, setDetachedSelectionMap] = useState<Record<string, DetachedSelectionState>>({});

  /**
   * 노드 삭제 시 자식들을 detached selection으로 등록
   * - 자식 노드들의 parentId를 null로 설정 (임시로 분리)
   * - detachedSelectionMap에 재연결 대기 상태로 등록
   */
  const handleKeepChildrenDelete = useCallback(({
    deletedNodeId,
    parentId = null,
  }: {
    deletedNodeId: string;
    parentId?: string | null;
  }) => {
    const orphanRoots = nodes.filter((node) => node.parentId === deletedNodeId);
    if (orphanRoots.length === 0) return;

    const timestamp = Date.now();
    setDetachedSelectionMap((prev) => {
      const next = { ...prev };
      orphanRoots.forEach((child, index) => {
        next[child.id] = {
          id: `${deletedNodeId}-${child.id}-${timestamp + index}`,
          anchorNodeId: child.id,
          originalParentId: deletedNodeId,
          targetParentId: parentId,
        };
      });
      return next;
    });

    // Temporarily disconnect children from deleted parent
    orphanRoots.forEach((child) => {
      handleEditNode({ nodeId: child.id, newParentId: null });
    });
  }, [handleEditNode, nodes]);

  /**
   * Detached selection을 새 부모에 연결
   * - detachedSelectionMap에서 제거하고 targetParentId로 연결
   */
  const handleConnectDetachedSelection = useCallback((anchorNodeId: string) => {
    let selection: DetachedSelectionState | undefined;
    setDetachedSelectionMap((prev) => {
      selection = prev[anchorNodeId];
      if (!selection) {
        return prev;
      }
      const { [anchorNodeId]: _, ...rest } = prev;
      return rest;
    });

    if (!selection) return;

    handleEditNode({
      nodeId: selection.anchorNodeId,
      newParentId: selection.targetParentId ?? null,
    });
  }, [handleEditNode]);

  /**
   * Detached selection 해제 (연결하지 않고 무시)
   */
  const handleDismissDetachedSelection = useCallback((anchorNodeId: string) => {
    setDetachedSelectionMap((prev) => {
      if (!prev[anchorNodeId]) return prev;
      const { [anchorNodeId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Auto-cleanup: anchor 노드가 삭제되면 detached selection도 제거
   */
  useEffect(() => {
    setDetachedSelectionMap((prev) => {
      let mutated = false;
      const next: Record<string, DetachedSelectionState> = { ...prev };

      Object.entries(prev).forEach(([anchorId, selection]) => {
        const anchorExists = nodes.some((node) => node.id === selection.anchorNodeId);
        if (!anchorExists) {
          delete next[anchorId];
          mutated = true;
        }
      });

      return mutated ? next : prev;
    });
  }, [nodes]);

  return {
    detachedSelectionMap,
    handleKeepChildrenDelete,
    handleConnectDetachedSelection,
    handleDismissDetachedSelection,
  };
}
