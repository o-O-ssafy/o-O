import { useEffect, useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import { fetchMindmapNodes, batchUpdateNodePositions } from "@/services/mindmapService";
import { useYMapState } from "./useYMapState";
import type { NodeData } from "../../../mindmap/types";
import type { YClient } from "./yjsClient";
import { CANVAS_CENTER_X, CANVAS_CENTER_Y, clampNodePosition } from "../../../mindmap/utils/d3Utils";

/**
 * x, y가 null인 노드들에게 자동으로 위치를 할당
 * - 기존 노드들의 가장 오른쪽에 배치하여 겹치지 않도록 함
 */
async function calculateNodePositions(nodes: NodeData[]): Promise<NodeData[]> {
  if (nodes.length === 0) return nodes;

  // x, y가 null인 노드 확인
  const nullPositionNodes = nodes.filter(n => n.x == null || n.y == null);

  if (nullPositionNodes.length === 0) {
    // 모든 노드에 이미 좌표가 있음
    return nodes;
  }

  // 좌표가 있는 노드들만 모아서 경계 박스 계산
  const nodesWithPosition = nodes.filter(n => n.x != null && n.y != null);

  let startX: number;
  let startY: number;

  if (nodesWithPosition.length === 0) {
    // 모든 노드가 null 좌표인 경우 (새 마인드맵) - 캔버스 중심에서 시작
    startX = CANVAS_CENTER_X;
    startY = CANVAS_CENTER_Y;
  } else {
    // 기존 노드들의 경계 박스 계산
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodesWithPosition.forEach(node => {
      if (node.x! > maxX) maxX = node.x!;
      if (node.y! < minY) minY = node.y!;
      if (node.y! > maxY) maxY = node.y!;
    });

    // 가장 오른쪽 + 여유 공간(500px)에서 시작
    startX = maxX + 500;
    // Y는 기존 노드들의 중간 높이에서 시작
    startY = (minY + maxY) / 2;
  }

  // null 좌표 노드들을 아래쪽으로 배치 (150px 간격)
  const verticalSpacing = 150;
  let currentY = startY;

  const processedNodes = nodes.map(node => {
    if (node.x == null || node.y == null) {
      // 좌표를 100~4900 범위로 제한 (노드가 경계에서 잘리지 않도록)
      const clamped = clampNodePosition(startX, currentY);

      // 다음 노드를 위해 Y 좌표 증가
      currentY += verticalSpacing;

      return {
        ...node,
        x: clamped.x,
        y: clamped.y,
      };
    }

    return node;
  });

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
          if (!original || processed.nodeId == null || processed.x == null || processed.y == null) {
            return false;
          }

          // 1. null 좌표가 자동 계산된 경우
          if ((original.x == null || original.y == null)) {
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
              if (existingId !== node.id && existingId.includes('-')) {
                // 로컬 노드를 제거하고 서버 노드로 교체
                console.log(`[useCollaborativeNodes] 🔄 Replacing local node ${existingId} with server node ${node.id} (nodeId: ${node.nodeId})`);
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
            console.error(`[useCollaborativeNodes] Failed to save position updates:`, error);
          }
        }

        setIsBootstrapping(false);
      } catch (error) {
        if (!cancelled) {
          hasBootstrappedRef.current = false;
          setIsBootstrapping(false);
          console.error("[useCollaborativeNodes] Failed to bootstrap nodes:", error);
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
  const nodes = useMemo<NodeData[]>(() => Object.values(nodesState), [nodesState]);

  // 🔍 디버깅: Y.Map 크기와 노드 개수 로그
  useEffect(() => {
    if (collab) {
      console.log(`[useCollaborativeNodes] 🔍 Y.Map size: ${collab.map.size}, React nodes count: ${nodes.length}`);
      console.log(`[useCollaborativeNodes] 🔍 Nodes:`, nodes.map(n => ({ id: n.id, nodeId: n.nodeId, keyword: n.keyword })));
    }
  }, [collab, nodes]);

  // 🔥 좌표가 null인 노드들을 자동으로 재계산하여 업데이트
  useEffect(() => {
    if (!collab || nodes.length === 0) return;

    const nullPositionNodes = nodes.filter(n => n.x == null || n.y == null);

    if (nullPositionNodes.length === 0) {
      // 모든 노드에 좌표가 있으면 스킵
      return;
    }

    // 전체 노드에 대해 좌표 재계산 (async)
    const updatePositions = async () => {
      const processedNodes = await calculateNodePositions(nodes);

      // 자동 계산된 좌표를 추적 (서버에 저장하기 위해)
      const updatedNodesForServer: Array<{ nodeId: number; x: number; y: number }> = [];

      // Yjs map에 업데이트
      collab.client.doc.transact(() => {
        for (const node of processedNodes) {
          if (node.x != null && node.y != null) {
            const existingNode = collab.map.get(node.id);
            if (existingNode && (existingNode.x == null || existingNode.y == null)) {
              collab.map.set(node.id, { ...existingNode, x: node.x, y: node.y });

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
        } catch (error) {
          console.error(`[useCollaborativeNodes] 🔧 Failed to save position updates:`, error);
        }
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
      console.log("[useCollaborativeNodes] 🔄 Refetching nodes from server...");
      const restNodes = await fetchMindmapNodes(workspaceId);

      if (restNodes.length === 0) {
        console.log("[useCollaborativeNodes] No new nodes to merge");
        return;
      }

      // Calculate positions for nodes with null x/y
      const processedNodes = await calculateNodePositions(restNodes);

      // 좌표가 자동 계산된 노드들을 추적 (서버에 저장하기 위해)
      const nodesToUpdate = processedNodes.filter((processed, index) => {
        const original = restNodes[index];
        if (!original || processed.nodeId == null || processed.x == null || processed.y == null) {
          return false;
        }

        // null 좌표가 자동 계산된 경우
        if ((original.x == null || original.y == null)) {
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
            if (existingId !== node.id && existingId.includes('-')) {
              // 로컬 노드를 제거하고 서버 노드로 교체
              console.log(`[refetchAndMergeNodes] 🔄 Replacing local node ${existingId} with server node ${node.id} (nodeId: ${node.nodeId})`);
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

      console.log(`[useCollaborativeNodes] ✅ Added ${addedCount} new nodes to Y.Map`);

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
          console.error(`[useCollaborativeNodes] Failed to save position updates:`, error);
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
