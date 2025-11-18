import { useEffect, useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import {
  fetchMindmapNodes,
  batchUpdateNodePositions,
} from "@/services/mindmapService";
import { useYMapState } from "./useYMapState";
import type { NodeData } from "../../../mindmap/types";
import type { YClient } from "./yjsClient";

/**
 * x, y가 null인 노드들에게 자동으로 위치를 할당
 *
 * 레이아웃 전략:
 * - 소규모 업데이트 (null 노드 <= 5개): parentCenteredLayout 사용 (부모 근처에 조밀하게 배치)
 * - 대규모 업데이트 (null 노드 > 5개): radialLayout 사용 (전체 트리 구조 재배치)
 *
 * - 방사형(radial) 레이아웃: 루트 중심, depth별 동심원 배치
 * - 부모-자식 근접 배치 (각도 기반)
 * - D3 force simulation으로 노드 겹침 방지 및 edge crossing 최소화
 */
async function calculateNodePositions(nodes: NodeData[]): Promise<NodeData[]> {
  if (nodes.length === 0) return nodes;

  // x, y가 null인 노드 확인
  const nullPositionNodes = nodes.filter((n) => n.x == null || n.y == null);

  if (nullPositionNodes.length === 0) {
    // 모든 노드에 이미 좌표가 있음
    return nodes;
  }

  const CANVAS_CENTER_X = 2500;
  const CANVAS_CENTER_Y = 2500;

  // 조건: null 좌표 노드가 5개 이하면 parentCenteredLayout 사용
  if (nullPositionNodes.length <= 5) {
    console.log(`[calculateNodePositions] Using parentCenteredLayout for ${nullPositionNodes.length} new nodes`);

    const { calculateParentCenteredPositions } = await import(
      "../../../mindmap/utils/parentCenteredLayout"
    );

    const processedNodes = await calculateParentCenteredPositions(nodes);
    return processedNodes;
  }

  // 대규모 업데이트: radialLayout + Force Simulation 사용
  console.log(`[calculateNodePositions] Using radialLayoutWithForces for ${nullPositionNodes.length} new nodes`);

  const { applyRadialLayoutWithForcesToNodes } = await import(
    "../../../mindmap/utils/radialLayoutWithForces"
  );

  const BASE_RADIUS = 200; // depth당 기본 반경 (350 → 200으로 축소)

  // parentId를 string으로 변환 (radialLayoutWithForces 타입 요구사항)
  const nodesWithStringParentId = nodes.map((node) => ({
    ...node,
    parentId: node.parentId != null ? String(node.parentId) : null,
  }));

  const processedNodes = await applyRadialLayoutWithForcesToNodes(
    nodesWithStringParentId,
    CANVAS_CENTER_X,
    CANVAS_CENTER_Y,
    BASE_RADIUS
  );

  return processedNodes;
}

/**
 * 협업 노드 상태 관리 및 REST 부트스트랩 훅
 *
 * **주요 기능:**
 * - Y.Map과 동기화된 노드 상태를 React state로 관리
 * - 워크스페이스당 1회만 REST API에서 초기 데이터 로드 (부트스트랩)
 * - 부트스트랩 진행 상태 추적
 *
 * **부트스트랩 로직:**
 * 1. Y.Map이 비어있고, 아직 부트스트랩하지 않았으면 REST API 호출
 * 2. 받아온 노드들을 Y.Map에 transaction으로 한 번에 추가
 * 3. 워크스페이스 변경 시 부트스트랩 가드 리셋
 *
 * @param collab - Yjs client + map 객체 (null이면 아직 초기화 전)
 * @param workspaceId - 현재 워크스페이스 ID
 * @returns {object} nodes (배열), nodesState (Record), isBootstrapping (boolean)
 */
export function useCollaborativeNodes(
  collab: { client: YClient; map: Y.Map<NodeData> } | null,
  workspaceId: string
) {
  // Prevents duplicate REST bootstraps per workspace
  const hasBootstrappedRef = useRef(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // Reset bootstrap guard whenever the workspace changes
  useEffect(() => {
    hasBootstrappedRef.current = false;
  }, [workspaceId]);

  // Seed the collaborative document with REST data exactly once
  useEffect(() => {
    if (!collab || hasBootstrappedRef.current) {
      return;
    }

    // If the map already has data (from other peers), skip bootstrap
    if (collab.map.size > 0) {
      hasBootstrappedRef.current = true;
      return;
    }

    hasBootstrappedRef.current = true;
    setIsBootstrapping(true);
    let cancelled = false;

    const run = async () => {
      try {
        const restNodes = await fetchMindmapNodes(workspaceId);

        if (cancelled || restNodes.length === 0) {
          setIsBootstrapping(false);
          return;
        }

        // Calculate positions for nodes with null x/y
        const processedNodes = await calculateNodePositions(restNodes);

        // 🔥 좌표가 정규화된 노드들과 자동 계산된 노드들을 추적 (서버에 저장하기 위해)
        const nodesToUpdate = processedNodes.filter((processed, index) => {
          const original = restNodes[index];
          if (
            !original ||
            processed.nodeId == null ||
            processed.x == null ||
            processed.y == null
          ) {
            return false;
          }

          // 1. null 좌표가 자동 계산된 경우
          if (original.x == null || original.y == null) {
            return true;
          }

          // 2. 좌표가 0~5000 범위로 정규화된 경우 (_wasClamped 플래그)
          const wasClamped = (processed as any)._wasClamped === true;

          return wasClamped;
        });

        // Use transaction to batch all insertions for performance

        // 중복 제거: 같은 nodeId를 가진 노드가 이미 있으면 로컬 노드를 제거하고 서버 노드로 교체
        const existingNodeIds = new Map<number, string>();
        collab.map.forEach((node, id) => {
          if (node.nodeId) {
            existingNodeIds.set(node.nodeId as number, id);
          }
        });

        collab.client.doc.transact(() => {
          for (const node of processedNodes) {
            const { _wasClamped, ...cleanNode } = node as any;

            if (node.nodeId && existingNodeIds.has(node.nodeId as number)) {
              const existingId = existingNodeIds.get(node.nodeId as number)!;

              // 서버 노드(MongoDB ID)가 아닌 로컬 노드(타임스탬프 ID)만 교체
              if (existingId !== node.id && existingId.includes("-")) {
                // 로컬 노드를 제거하고 서버 노드로 교체
                collab.map.delete(existingId);
                collab.map.set(cleanNode.id, cleanNode);
                existingNodeIds.set(node.nodeId as number, node.id);
              }
              // 이미 서버 노드가 있으면 건너뜀
              continue;
            }

            if (!collab.map.has(node.id)) {
              collab.map.set(cleanNode.id, cleanNode);
            }
          }
        }, "mindmap-bootstrap");

        // 정규화/자동 계산된 좌표를 서버에 저장
        if (nodesToUpdate.length > 0) {
          const positionUpdates = nodesToUpdate.map((node: NodeData) => ({
            nodeId: node.nodeId as number,
            x: node.x,
            y: node.y,
          }));

          try {
            await batchUpdateNodePositions(workspaceId, positionUpdates);
          } catch (error) {
            console.error(
              `[useCollaborativeNodes] Failed to save position updates:`,
              error
            );
          }
        }

        setIsBootstrapping(false);
      } catch (error) {
        if (!cancelled) {
          hasBootstrappedRef.current = false;
          setIsBootstrapping(false);
          console.error(
            "[useCollaborativeNodes] Failed to bootstrap nodes:",
            error
          );
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [collab, workspaceId]);

  // Sync Y.Map state to React state
  const nodesState = useYMapState<NodeData>(collab?.map);

  // 🔧 노드 배열 참조 안정화: nodesState의 키 목록이 변경되지 않으면 같은 배열 참조 유지
  const nodes = useMemo<NodeData[]>(() => {
    const nodeArray = Object.values(nodesState);
    return nodeArray;
  }, [nodesState]);

  // 🔥 좌표가 null인 노드들을 자동으로 재계산하여 업데이트
  const isCalculatingRef = useRef(false);

  useEffect(() => {
    if (!collab || nodes.length === 0) return;

    const nullPositionNodes = nodes.filter((n) => n.x == null || n.y == null);

    if (nullPositionNodes.length === 0) {
      // 모든 노드에 좌표가 있으면 스킵
      return;
    }

    // 이미 계산 중이면 스킵 (중복 실행 방지)
    if (isCalculatingRef.current) {
      console.log("[useCollaborativeNodes] 🔧 Position calculation already in progress, skipping...");
      return;
    }

    // 전체 노드에 대해 좌표 재계산 (async)
    const updatePositions = async () => {
      isCalculatingRef.current = true;
      console.log("[useCollaborativeNodes] 🔧 Starting position calculation for", nullPositionNodes.length, "nodes");

      try {
        const processedNodes = await calculateNodePositions(nodes);

        // 자동 계산된 좌표를 추적 (서버에 저장하기 위해)
        const updatedNodesForServer: Array<{
          nodeId: number;
          x: number;
          y: number;
        }> = [];

        // Yjs map에 업데이트
        collab.client.doc.transact(() => {
          for (const node of processedNodes) {
            if (node.x != null && node.y != null) {
              const existingNode = collab.map.get(node.id);
              if (
                existingNode &&
                (existingNode.x == null || existingNode.y == null)
              ) {
                collab.map.set(node.id, {
                  ...existingNode,
                  x: node.x,
                  y: node.y,
                });

                // nodeId가 있으면 서버 업데이트 목록에 추가
                if (existingNode.nodeId) {
                  updatedNodesForServer.push({
                    nodeId: existingNode.nodeId as number,
                    x: node.x,
                    y: node.y,
                  });
                }
              }
            }
          }
        }, "position-update");

        // 자동 계산된 좌표를 서버에 저장
        if (updatedNodesForServer.length > 0) {
          try {
            await batchUpdateNodePositions(workspaceId, updatedNodesForServer);
            console.log("[useCollaborativeNodes] ✅ Position calculation complete, saved", updatedNodesForServer.length, "nodes");
          } catch (error) {
            console.error(
              `[useCollaborativeNodes] 🔧 Failed to save position updates:`,
              error
            );
          }
        }
      } finally {
        isCalculatingRef.current = false;
      }
    };

    updatePositions();
  }, [collab, nodes, workspaceId]); // workspaceId 추가

  // 서버에서 노드 목록을 다시 가져와서 Y.Map에 추가하는 함수
  const refetchAndMergeNodes = async () => {
    if (!collab) {
      console.warn("[useCollaborativeNodes] Cannot refetch: collab is null");
      return;
    }

    try {
      const restNodes = await fetchMindmapNodes(workspaceId);

      if (restNodes.length === 0) {
        return;
      }

      // Calculate positions for nodes with null x/y
      const processedNodes = await calculateNodePositions(restNodes);

      // 좌표가 자동 계산된 노드들을 추적 (서버에 저장하기 위해)
      const nodesToUpdate = processedNodes.filter((processed, index) => {
        const original = restNodes[index];
        if (
          !original ||
          processed.nodeId == null ||
          processed.x == null ||
          processed.y == null
        ) {
          return false;
        }

        // null 좌표가 자동 계산된 경우
        if (original.x == null || original.y == null) {
          return true;
        }

        // 좌표가 정규화된 경우
        const wasClamped = (processed as any)._wasClamped === true;
        return wasClamped;
      });

      // 중복 제거: 같은 nodeId를 가진 노드가 이미 있으면 로컬 노드를 제거하고 서버 노드로 교체
      const existingNodeIds = new Map<number, string>();
      collab.map.forEach((node, id) => {
        if (node.nodeId) {
          existingNodeIds.set(node.nodeId as number, id);
        }
      });

      // 새로운 노드만 Y.Map에 추가
      let addedCount = 0;
      collab.client.doc.transact(() => {
        for (const node of processedNodes) {
          const { _wasClamped, ...cleanNode } = node as any;

          if (node.nodeId && existingNodeIds.has(node.nodeId as number)) {
            const existingId = existingNodeIds.get(node.nodeId as number)!;

            // 서버 노드(MongoDB ID)가 아닌 로컬 노드(타임스탬프 ID)만 교체
            if (existingId !== node.id && existingId.includes("-")) {
              // 로컬 노드를 제거하고 서버 노드로 교체
              collab.map.delete(existingId);
              collab.map.set(cleanNode.id, cleanNode);
              existingNodeIds.set(node.nodeId as number, node.id);
              addedCount++;
            }
            // 이미 서버 노드가 있으면 건너뜀
            continue;
          }

          if (!collab.map.has(node.id)) {
            collab.map.set(cleanNode.id, cleanNode);
            addedCount++;
          }
        }
      }, "mindmap-refetch");

      // 정규화/자동 계산된 좌표를 서버에 저장
      if (nodesToUpdate.length > 0) {
        const positionUpdates = nodesToUpdate.map((node: NodeData) => ({
          nodeId: node.nodeId as number,
          x: node.x,
          y: node.y,
        }));

        try {
          await batchUpdateNodePositions(workspaceId, positionUpdates);
        } catch (error) {
          console.error(
            `[useCollaborativeNodes] Failed to save position updates:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("[useCollaborativeNodes] Failed to refetch nodes:", error);
    }
  };

  return {
    nodes,
    nodesState,
    isBootstrapping,
    refetchAndMergeNodes,
  };
}
