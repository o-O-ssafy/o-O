import { useCallback, type RefObject } from "react";
import type { Core } from "cytoscape";
import type { YMapCrud } from "../../../workspace/hooks/custom/yMapCrud";
import type { NodeData, MindmapMode, DeleteNodePayload, EditNodePayload } from "../../types";

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
 * @param params.crud - Y.Map CRUD 작업 래퍼
 * @param params.nodes - 현재 노드 배열
 * @param params.cyRef - Cytoscape 인스턴스 참조
 * @param params.mode - 현재 마인드맵 모드 (edit/analyze)
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
  getRandomThemeColor: () => string;
  findNonOverlappingPosition: (nodes: NodeData[], baseX: number, baseY: number) => { x: number; y: number };
}) {
  const { crud, nodes, cyRef, mode, workspaceId, getRandomThemeColor, findNonOverlappingPosition } = params;

  /**
   * 텍스트박스에서 새 노드 추가
   * - Viewport 중심에 배치 (model coordinates)
   */
  const handleAddNode = useCallback((text: string) => {
    if (mode === "analyze" || !crud) return;
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
      id: Date.now().toString(),
      parentId: 0,  // 루트 노드는 parentId: 0
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
  }, [crud, findNonOverlappingPosition, getRandomThemeColor, mode, nodes, cyRef, workspaceId]);

  /**
   * 자식 노드 생성
   * - 부모 노드 오른쪽에 배치
   * - 형제 노드들은 수직으로 분산 배치
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

    // 같은 부모를 가진 형제 노드들 찾기
    const siblings = nodes.filter(node => node.parentId === parentId);
    const siblingCount = siblings.length;
    const childIndex = siblingCount; // 새로 추가될 자식의 인덱스

    // 수직 간격 설정 (자식 개수에 따라 조정)
    const verticalSpacing = 180;

    // 중심을 기준으로 균등 분산
    // 예: 자식 3개 → [-1, 0, 1] * spacing → [-180, 0, 180]
    const totalHeight = siblingCount * verticalSpacing;
    const startOffset = -totalHeight / 2;
    const baseY = parentY + startOffset + (childIndex * verticalSpacing);

    const { x, y } = findNonOverlappingPosition(nodes, parentX + 200, baseY);

    const newNode: NodeData = {
      id: Date.now().toString(),
      parentId: parseInt(parentId, 10),  // 부모 노드의 id (timestamp)를 number로 변환
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

    crud.set(newNode.id, newNode);
  }, [crud, findNonOverlappingPosition, getRandomThemeColor, nodes, workspaceId]);

  /**
   * 노드 삭제
   * - deleteDescendants=true: 자식 노드도 재귀적으로 삭제
   * - deleteDescendants=false: 자식은 유지 (detached selection 처리 필요)
   */
  const handleDeleteNode = useCallback(({ nodeId, deleteDescendants }: DeleteNodePayload) => {
    if (!crud) return;

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
  }, [crud, nodes]);

  /**
   * 노드 수정
   * - 텍스트, 메모, 색상, 부모 관계 변경
   */
  const handleEditNode = useCallback(({ nodeId, newText, newMemo, newColor, newParentId }: EditNodePayload) => {
    if (!crud) return;
    crud.update(nodeId, (current) => {
      if (!current) return current;
      return {
        ...current,
        ...(newText !== undefined ? { keyword: newText } : {}),
        ...(newMemo !== undefined ? { memo: newMemo } : {}),
        ...(newColor !== undefined ? { color: newColor } : {}),
        ...(newParentId !== undefined ? { parentId: newParentId ?? undefined } : {}),
        operation: 'UPDATE',
      };
    });
  }, [crud]);

  /**
   * 다수 노드 위치 일괄 변경
   * - Layout 재배치 후 호출
   */
  const handleBatchNodePositionChange = useCallback((positions: Array<{ id: string; x: number; y: number }>) => {
    if (!crud || positions.length === 0) return;
    const positionMap = new Map(positions.map((pos) => [pos.id, pos]));

    crud.transact((map) => {
      positionMap.forEach(({ id, x, y }) => {
        const current = map.get(id);
        if (!current) return;
        map.set(id, { ...current, x, y, operation: 'UPDATE' });
      });
    });
  }, [crud]);

  /**
   * 테마 색상 일괄 적용
   * - 모든 노드에 순환 방식으로 색상 배정
   */
  const handleApplyTheme = useCallback((colors: string[]) => {
    if (!crud || colors.length === 0) return;
    const entries = nodes.map((node, index) => [
      node.id,
      {
        ...node,
        color: colors[index % colors.length],
        operation: 'UPDATE',
      },
    ]) as Array<[string, NodeData]>;
    crud.setMany(entries);
  }, [crud, nodes]);

  return {
    handleAddNode,
    handleCreateChildNode,
    handleDeleteNode,
    handleEditNode,
    handleBatchNodePositionChange,
    handleApplyTheme,
  };
}
