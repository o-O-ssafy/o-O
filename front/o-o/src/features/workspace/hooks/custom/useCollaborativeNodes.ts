import { useEffect, useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import { fetchMindmapNodes } from "@/services/mindmapService";
import { useYMapState } from "./useYMapState";
import type { NodeData } from "../../../mindmap/types";
import type { YClient } from "./yjsClient";
import { useLoadingStore } from "@/shared/store/loadingStore";

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
export async function calculateNodePositions(nodes: NodeData[]): Promise<NodeData[]> {
  if (nodes.length === 0) return nodes;

  // x, y가 null인 노드 확인
  const nullPositionNodes = nodes.filter((n) => n.x == null || n.y == null);

  if (nullPositionNodes.length === 0) {
    // 모든 노드에 이미 좌표가 있음
    return nodes;
  }

  const CANVAS_CENTER_X = 2500;
  const CANVAS_CENTER_Y = 2500;

  // 항상 전역 방사형 레이아웃 사용 (null 좌표 노드를 전체 트리 기준으로 배치)
  console.log(`[calculateNodePositions] Using radialLayoutWithForces for ${nullPositionNodes.length} new nodes`);

  const { applyRadialLayoutWithForcesToNodes } = await import(
    "../../../mindmap/utils/radialLayoutWithForces"
  );

  const BASE_RADIUS = 200; // depth당 기본 반경

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

    // ✅ 플래그를 먼저 설정하여 중복 실행 방지
    hasBootstrappedRef.current = true;

    // ✅ 임시 ID 판별 헬퍼
    const isTempId = (id: string): boolean => {
      // 1. 순수 숫자 문자열 (예: "12", "13")
      if (/^\d+$/.test(id)) {
        return true;
      }
      // 2. 하이픈 포함 (예: "1234567890-uuid", "temp-123")
      if (id.includes("-")) {
        return true;
      }
      // 3. MongoDB ObjectId가 아닌 경우 (24자 hex)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return false; // 길이가 24가 아니거나 hex가 아니면 판단 보류
      }
      return false; // ObjectId 형식이면 영속 ID
    };

    let cancelled = false;
    let syncedHandler: ((isSynced: boolean) => void) | null = null;

    const runBootstrap = async () => {
      try {
        // ✅ WebSocket 동기화 완료 후 Y.Map 사이즈 재확인
        if (collab.map.size > 0) {
          console.log("[Bootstrap] Y.Map already has data after sync, skipping bootstrap");
          setIsBootstrapping(false);
          return;
        }

        console.log(`📊 [Bootstrap] Fetching nodes from REST API for workspace="${workspaceId}"`);
        const restNodes = await fetchMindmapNodes(workspaceId);
        console.log(`📊 [Bootstrap] Fetched ${restNodes.length} nodes from REST`);

        if (cancelled || restNodes.length === 0) {
          setIsBootstrapping(false);
          return;
        }

        // Calculate positions for nodes with null x/y
        const processedNodes = await calculateNodePositions(restNodes);

        // ✅ 삽입 직전 최종 재검증: WebSocket 동기화 중 데이터가 들어왔을 수 있음
        if (collab.map.size > 0) {
          console.log(`⚠️ [Bootstrap] Y.Map has ${collab.map.size} nodes after REST fetch, skipping insertion`);
          setIsBootstrapping(false);
          return;
        }

        // Use transaction to batch all insertions for performance

        // ✅ 강화된 중복 제거: id와 nodeId 모두 검사
        // - existingNodeIds: nodeId → id 매핑 (MongoDB ID 기준 중복 검사)
        // - existingIds: Set<id> (Y.Map key 기준 중복 검사)
        const existingNodeIds = new Map<number, string>();
        const existingIds = new Set<string>();

        collab.map.forEach((node, id) => {
          existingIds.add(id);
          if (node.nodeId) {
            existingNodeIds.set(node.nodeId as number, id);
          }
        });

        // 📊 [LOG] Y.Map 상태 확인 (Bootstrap 삽입 전)
        console.log(`📊 [Bootstrap Before Insert] Y.Map size: ${collab.map.size}`);
        console.log(`📊 [Bootstrap Before Insert] Nodes to insert: ${processedNodes.length}`);
        console.log(`📊 [Bootstrap Before Insert] Existing nodeIds:`, Array.from(existingNodeIds.entries()));
        console.log(`📊 [Bootstrap Before Insert] Existing ids:`, Array.from(existingIds));

        collab.client.doc.transact(() => {
          for (const node of processedNodes) {
            const { _wasClamped, ...cleanNode } = node as any;

            // ✅ 1차 검사: nodeId로 중복 확인 (MongoDB ID 기준)
            if (node.nodeId && existingNodeIds.has(node.nodeId as number)) {
              const existingId = existingNodeIds.get(node.nodeId as number)!;

              console.log(`🔍 [Bootstrap Duplicate Check] nodeId=${node.nodeId} already exists with id="${existingId}"`);

              // ✅ 임시 ID인 기존 노드를 영속 ID로 교체
              if (existingId !== node.id && isTempId(existingId)) {
                // 로컬 임시 노드를 제거하고 서버 영속 노드로 교체
                console.log(`🔄 [Bootstrap Replace] Replacing temp node "${existingId}" with persistent node "${node.id}"`);
                collab.map.delete(existingId);
                existingIds.delete(existingId);
                collab.map.set(cleanNode.id, cleanNode);
                existingIds.add(cleanNode.id);
                existingNodeIds.set(node.nodeId as number, node.id);
              } else {
                console.log(`⏭️ [Bootstrap Skip] Persistent node already exists, skipping`);
              }
              // 이미 서버 노드가 있으면 건너뜀
              continue;
            }

            // ✅ 2차 검사: id로 중복 확인 (Y.Map key 기준)
            if (existingIds.has(node.id)) {
              console.log(`⚠️ [Bootstrap Warning] Node id="${node.id}" already exists in Y.Map, skipping`);
              continue;
            }

            // ✅ 중복이 아닌 경우에만 삽입
            console.log(`➕ [Bootstrap Insert] Inserting new node id="${node.id}", nodeId=${node.nodeId}`);
            collab.map.set(cleanNode.id, cleanNode);
            existingIds.add(cleanNode.id);
            if (node.nodeId) {
              existingNodeIds.set(node.nodeId as number, node.id);
            }
          }
        }, "mindmap-bootstrap");

        // 📊 [LOG] Y.Map 상태 확인 (Bootstrap 삽입 후)
        console.log(`📊 [Bootstrap After Insert] Y.Map size: ${collab.map.size}`);

        // 좌표는 Y.doc에 저장되며, 백엔드가 Y.doc 변경을 감지하여 자동으로 DB에 저장함

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

    // ✅ WebSocket 동기화 완료를 기다린 후 Bootstrap 실행
    const provider = collab.client.provider;

    if (provider.synced) {
      // 이미 동기화 완료된 경우 즉시 실행
      console.log("[Bootstrap] Provider already synced, running bootstrap immediately");
      setIsBootstrapping(true);
      runBootstrap();
    } else {
      // 동기화 대기
      console.log("[Bootstrap] Waiting for provider to sync...");
      syncedHandler = (isSynced: boolean) => {
        if (isSynced && !cancelled) {
          console.log("[Bootstrap] Provider synced, running bootstrap");
          setIsBootstrapping(true);
          runBootstrap();
          // 한 번만 실행되도록 리스너 제거
          if (syncedHandler) {
            provider.off('sync', syncedHandler);
            syncedHandler = null;
          }
        }
      };
      provider.on('sync', syncedHandler);
    }

    return () => {
      cancelled = true;
      if (syncedHandler) {
        provider.off('sync', syncedHandler);
        syncedHandler = null;
      }
    };
  }, [collab, workspaceId]);

  // Sync Y.Map state to React state
  const nodesState = useYMapState<NodeData>(collab?.map);

  // 🔧 노드 배열 참조 안정화: nodesState의 키 목록이 변경되지 않으면 같은 배열 참조 유지
  const nodes = useMemo<NodeData[]>(() => {
    const nodeArray = Object.values(nodesState);
    return nodeArray;
  }, [nodesState]);

  // 🔍 디버깅: Y.Map 크기와 노드 개수 로그 (주석 처리)
  // useEffect(() => {
  //   if (collab) {
  //     console.log(`[useCollaborativeNodes] 🔍 Y.Map size: ${collab.map.size}, React nodes count: ${nodes.length}`);
  //     console.log(`[useCollaborativeNodes] 🔍 Nodes:`, nodes.map(n => ({ id: n.id, nodeId: n.nodeId, keyword: n.keyword })));
  //   }
  // }, [collab, nodes]);

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

        let updatedCount = 0;

        // Yjs map에 업데이트 (실제로 변경된 좌표만)
        // 백엔드가 Y.doc 변경을 감지하여 자동으로 DB에 저장함
        collab.client.doc.transact(() => {
          for (const node of processedNodes) {
            if (node.x != null && node.y != null) {
              const existingNode = collab.map.get(node.id);

              // ✅ 조건 1: 노드가 존재해야 함
              if (!existingNode) continue;

              // ✅ 조건 2: 좌표가 없거나 실제로 변경된 경우만 업데이트
              const needsUpdate =
                existingNode.x == null ||
                existingNode.y == null ||
                existingNode.x !== node.x ||
                existingNode.y !== node.y;

              if (needsUpdate) {
                console.log(`🔧 [Position Update] Updating node "${node.id}" from (${existingNode.x}, ${existingNode.y}) to (${node.x}, ${node.y})`);

                collab.map.set(node.id, {
                  ...existingNode,
                  x: node.x,
                  y: node.y,
                });

                updatedCount++;
              } else {
                console.log(`⏭️ [Position Update] Skipping node "${node.id}" - coordinates unchanged`);
              }
            }
          }
        }, "position-update");

        // 좌표 업데이트 완료 후 로딩 해제
        if (updatedCount > 0) {
          console.log("[useCollaborativeNodes] ✅ Position calculation complete, updated", updatedCount, "nodes (auto-synced to backend via Y.doc)");

          // Textbox 아이디어 추가 로딩 해제 (triple rAF로 완전한 렌더링 완료 후 실행)
          // Y.Map 업데이트 → React re-render → DOM paint → NodeOverlay mount 완료 대기
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                useLoadingStore.getState().setIsLoading(false);
                console.log("🎉 Position calculation done - loading cleared after render");
              });
            });
          });
        }
      } finally {
        isCalculatingRef.current = false;
      }
    };

    updatePositions();
  }, [collab, nodes]); // workspaceId 불필요 (REST API 호출 제거됨)

  // 서버에서 노드 목록을 다시 가져와서 Y.Map에 추가하는 함수
  const refetchAndMergeNodes = async () => {
    if (!collab) {
      console.warn("[useCollaborativeNodes] Cannot refetch: collab is null");
      return;
    }

    // ✅ 임시 ID 판별 헬퍼
    const isTempId = (id: string): boolean => {
      // 1. 순수 숫자 문자열 (예: "12", "13")
      if (/^\d+$/.test(id)) {
        return true;
      }
      // 2. 하이픈 포함 (예: "1234567890-uuid", "temp-123")
      if (id.includes("-")) {
        return true;
      }
      // 3. MongoDB ObjectId가 아닌 경우 (24자 hex)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return false; // 길이가 24가 아니거나 hex가 아니면 판단 보류
      }
      return false; // ObjectId 형식이면 영속 ID
    };

    try {
      const restNodes = await fetchMindmapNodes(workspaceId);

      if (restNodes.length === 0) {
        return;
      }

      // Calculate positions for nodes with null x/y
      const processedNodes = await calculateNodePositions(restNodes);

      // ✅ 강화된 중복 제거: id와 nodeId 모두 검사
      const existingNodeIds = new Map<number, string>();
      const existingIds = new Set<string>();

      collab.map.forEach((node, id) => {
        existingIds.add(id);
        if (node.nodeId) {
          existingNodeIds.set(node.nodeId as number, id);
        }
      });

      // 새로운 노드만 Y.Map에 추가
      let addedCount = 0;
      collab.client.doc.transact(() => {
        for (const node of processedNodes) {
          const { _wasClamped, ...cleanNode } = node as any;

          // ✅ 1차 검사: nodeId로 중복 확인 (MongoDB ID 기준)
          if (node.nodeId && existingNodeIds.has(node.nodeId as number)) {
            const existingId = existingNodeIds.get(node.nodeId as number)!;

            // ✅ 임시 ID인 기존 노드를 영속 ID로 교체
            if (existingId !== node.id && isTempId(existingId)) {
              // 로컬 임시 노드를 제거하고 서버 영속 노드로 교체
              collab.map.delete(existingId);
              existingIds.delete(existingId);
              collab.map.set(cleanNode.id, cleanNode);
              existingIds.add(cleanNode.id);
              existingNodeIds.set(node.nodeId as number, node.id);
              addedCount++;
            }
            // 이미 서버 노드가 있으면 건너뜀
            continue;
          }

          // ✅ 2차 검사: id로 중복 확인 (Y.Map key 기준)
          if (existingIds.has(node.id)) {
            continue;
          }

          // ✅ 중복이 아닌 경우에만 삽입
          collab.map.set(cleanNode.id, cleanNode);
          existingIds.add(cleanNode.id);
          if (node.nodeId) {
            existingNodeIds.set(node.nodeId as number, node.id);
          }
          addedCount++;
        }
      }, "mindmap-refetch");

      // 좌표는 Y.doc에 저장되며, 백엔드가 Y.doc 변경을 감지하여 자동으로 DB에 저장함
      console.log(`[useCollaborativeNodes] Refetch complete, added ${addedCount} nodes (auto-synced to backend via Y.doc)`);
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
