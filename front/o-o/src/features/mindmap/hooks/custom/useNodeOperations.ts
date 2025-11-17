import { useCallback, type RefObject } from "react";
import type { Core } from "cytoscape";
import type { YMapCrud } from "../../../workspace/hooks/custom/yMapCrud";
import type { NodeData, MindmapMode, DeleteNodePayload, EditNodePayload } from "../../types";
import type { WorkspaceRole } from "@/services/dto/workspace.dto";
import { canEditWorkspace } from "@/shared/utils/permissionUtils";
import { useToast } from "@/shared/ui/ToastProvider";

/**
 * 노드 CRUD 작업 핸들러를 제공하는 커스텀 훅
 *
 * **주요 기능:**
 * - 노드 추가 (텍스트박스, 자식 노드 생성)
 * - 노드 수정 (텍스트, 색상, 부모 관계)
 * - 노드 삭제 (자식 포함/미포함)
 * - 노드 위치 변경 (단일/배치)
 * - 테마 색상 일괄 적용
 *
 * **좌표 계산:**
 * - 새 노드 추가 시 viewport 중심을 model coordinates로 변환
 * - 겹침 방지를 위해 `findNonOverlappingPosition` 사용
 *
 * **권한 체크:**
 * - 모든 CRUD 작업 전 canEditWorkspace(myRole) 체크
 * - 권한 없으면 토스트 메시지 표시 후 중단
 *
 * @param params.crud - Y.Map CRUD 작업 래퍼
 * @param params.nodes - 현재 노드 배열
 * @param params.cyRef - Cytoscape 인스턴스 참조
 * @param params.mode - 현재 마인드맵 모드 (edit/analyze)
 * @param params.myRole - 현재 사용자의 워크스페이스 역할
 * @param params.getRandomThemeColor - 랜덤 테마 색상 생성 함수
 * @param params.findNonOverlappingPosition - 겹치지 않는 위치 찾기 함수
 * @returns 모든 노드 작업 핸들러 함수들
 */
export function useNodeOperations(params: {
  crud: YMapCrud<NodeData> | null;
  nodes: NodeData[];
  cyRef: RefObject<Core | null>;
  mode: MindmapMode;
  workspaceId: string;
  myRole: WorkspaceRole | undefined;
  getRandomThemeColor: () => string;
  findNonOverlappingPosition: (nodes: NodeData[], baseX: number, baseY: number) => { x: number; y: number };
  findEmptySpace: (nodes: NodeData[], preferredX: number, preferredY: number, minDistance?: number) => { x: number; y: number };
}) {
  const { crud, nodes, cyRef, mode, workspaceId, myRole, getRandomThemeColor, findNonOverlappingPosition, findEmptySpace } = params;
  const { showToast } = useToast();

  /**
   * 텍스트박스에서 새 노드 추가
   * - Viewport 중심에 배치 (model coordinates)
   */
  const handleAddNode = useCallback((text: string) => {
    if (mode === "analyze" || !crud) return;

    if (!canEditWorkspace(myRole)) {
      showToast("노드를 추가할 권한이 없습니다", "error");
      return;
    }
    const randomColor = getRandomThemeColor();

    let baseX = 0;
    let baseY = 0;

    // Calculate viewport center in model coordinates
    if (cyRef.current) {
      const pan = cyRef.current.pan();
      const zoom = cyRef.current.zoom();
      const container = cyRef.current.container();

      if (container) {
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        // Convert screen center to model coordinates
        baseX = (centerX - pan.x) / zoom;
        baseY = (centerY - pan.y) / zoom;
      }
    }

    const { x, y } = findNonOverlappingPosition(nodes, baseX, baseY);
    console.log("[Mindmap] New node base position", { x, y });

    const newNode: NodeData = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      parentId: null,
      workspaceId: parseInt(workspaceId, 10),
      type: 'text',
      analysisStatus: 'NONE',
      keyword: text,
      x,
      y,
      color: randomColor,
      operation: 'ADD',
    };
    crud.set(newNode.id, newNode);
  }, [crud, findNonOverlappingPosition, getRandomThemeColor, mode, nodes, cyRef, workspaceId, myRole, showToast]);

  /**
   * 자식 노드 생성
   * - 캔버스 전체에서 가장 빈 공간을 찾아 배치
   * - 선호 위치: 부모 노드 오른쪽
   */
  const handleCreateChildNode = useCallback(({
    parentId,
    parentX,
    parentY,
    keyword,
    memo,
  }: {
    parentId: string;
    parentX: number;
    parentY: number;
    keyword: string;
    memo?: string;
  }) => {
    if (!crud || !keyword) return;

    if (!canEditWorkspace(myRole)) {
      showToast("노드를 추가할 권한이 없습니다", "error");
      return;
    }

    // 부모 노드 찾기 (nodeId를 가져오기 위해)
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) {
      console.error("[handleCreateChildNode] parent node not found", parentId);
      return;
    }

    // 선호 위치: 부모 노드 오른쪽 가까이
    const preferredX = parentX + 200;
    const preferredY = parentY;

    // 캔버스 전체에서 가장 빈 공간 찾기 (최소 거리 160px)
    const { x, y } = findEmptySpace(nodes, preferredX, preferredY, 160);

    const newNode: NodeData = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      parentId: parentNode.nodeId, // 부모 노드의 nodeId 사용
      workspaceId: parseInt(workspaceId, 10),
      type: 'text',
      analysisStatus: 'NONE',
      keyword: keyword,
      x,
      y,
      color: getRandomThemeColor(),
      operation: 'ADD',
      ...(memo ? { memo } : {}),
    };

    console.log("[handleCreateChildNode] Creating new child node:", {
      id: newNode.id,
      parentId: newNode.parentId,
      parentNodeId: parentNode.nodeId,
      keyword: newNode.keyword,
    });

    crud.set(newNode.id, newNode);
  }, [crud, findEmptySpace, getRandomThemeColor, nodes, workspaceId, myRole, showToast]);

  /**
   * 노드 삭제
   * - deleteDescendants=true: 자식 노드도 재귀적으로 삭제
   * - deleteDescendants=false: 자식은 유지 (detached selection 처리 필요)
   */
  const handleDeleteNode = useCallback(({ nodeId, deleteDescendants }: DeleteNodePayload) => {
    if (!crud) return;

    if (!canEditWorkspace(myRole)) {
      showToast("노드를 삭제할 권한이 없습니다", "error");
      return;
    }

    const idsToDelete = new Set<string>([nodeId]);

    if (deleteDescendants) {
      // Build children map
      const childrenMap = nodes.reduce<Record<string, string[]>>((acc, node) => {
        if (!node.parentId) {
          return acc;
        }
        if (!acc[node.parentId]) {
          acc[node.parentId] = [];
        }
        acc[node.parentId]!.push(node.id);
        return acc;
      }, {});

      // DFS to collect all descendants
      const stack = [nodeId];
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        const children = childrenMap[currentId];
        if (!children) continue;
        children.forEach((childId) => {
          if (!idsToDelete.has(childId)) {
            idsToDelete.add(childId);
            stack.push(childId);
          }
        });
      }
    }

    // Batch delete for performance
    crud.transact((map) => {
      idsToDelete.forEach((id) => {
        map.delete(id);
      });
    });
  }, [crud, nodes, myRole, showToast]);

  /**
   * 노드 수정
   * - 텍스트, 메모, 색상, 부모 관계, 위치 변경
   */
  const handleEditNode = useCallback(({ nodeId, newText, newMemo, newColor, newParentId, x, y }: EditNodePayload & { x?: number; y?: number }) => {
    if (!crud) return;

    if (!canEditWorkspace(myRole)) {
      showToast("노드를 수정할 권한이 없습니다", "error");
      return;
    }
    crud.update(nodeId, (current) => {
      if (!current) return current;
      return {
        ...current,
        ...(newText !== undefined ? { keyword: newText } : {}),
        ...(newMemo !== undefined ? { memo: newMemo } : {}),
        ...(newColor !== undefined ? { color: newColor } : {}),
        ...(newParentId !== undefined ? { parentId: newParentId ?? undefined } : {}),
        ...(x !== undefined ? { x } : {}),
        ...(y !== undefined ? { y } : {}),
        operation: 'UPDATE',
      };
    });
  }, [crud, myRole, showToast]);

  /**
   * 다수 노드 위치 일괄 변경
   * - Layout 재배치 후 호출
   */
  const handleBatchNodePositionChange = useCallback((positions: Array<{ id: string; x: number; y: number }>) => {
    if (!crud || positions.length === 0) return;

    if (!canEditWorkspace(myRole)) {
      showToast("노드를 이동할 권한이 없습니다", "error");
      return;
    }
    const positionMap = new Map(positions.map((pos) => [pos.id, pos]));

    crud.transact((map) => {
      positionMap.forEach(({ id, x, y }) => {
        const current = map.get(id);
        if (!current) return;
        map.set(id, { ...current, x, y, operation: 'UPDATE' });
      });
    });
  }, [crud, myRole, showToast]);

  /**
   * 테마 색상 일괄 적용
   * - 모든 노드에 순환 방식으로 색상 배정
   */
  const handleApplyTheme = useCallback((colors: string[]) => {
    if (!crud || colors.length === 0) return;

    if (!canEditWorkspace(myRole)) {
      showToast("테마를 적용할 권한이 없습니다", "error");
      return;
    }
    const entries = nodes.map((node, index) => [
      node.id,
      {
        ...node,
        color: colors[index % colors.length],
        operation: 'UPDATE',
      },
    ]) as Array<[string, NodeData]>;
    crud.setMany(entries);
  }, [crud, nodes, myRole, showToast]);

  return {
    handleAddNode,
    handleCreateChildNode,
    handleDeleteNode,
    handleEditNode,
    handleBatchNodePositionChange,
    handleApplyTheme,
  };
}
