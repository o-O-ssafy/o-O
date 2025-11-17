import { useEffect, useRef } from "react";
import * as Y from "yjs";
import type { NodeData } from "../../types";
import {
  createMindmapNode,
  updateMindmapNode,
  deleteMindmapNode,
} from "@/services/mindmapService";

/**
 * 소수점 이하 좌표 변화를 무시하기 위한 threshold (1px)
 */
const POSITION_CHANGE_THRESHOLD = 1;

/**
 * 두 노드 데이터를 비교하여 실제 변경사항이 있는지 확인
 * 좌표 변화가 threshold 이하인 경우 변경사항 없음으로 판단
 */
function hasSignificantChanges(oldNode: NodeData, newNode: NodeData): boolean {
  // keyword, memo, color, type, analysisStatus, parentId 비교
  if (
    oldNode.keyword !== newNode.keyword ||
    oldNode.memo !== newNode.memo ||
    oldNode.color !== newNode.color ||
    oldNode.type !== newNode.type ||
    oldNode.analysisStatus !== newNode.analysisStatus ||
    oldNode.parentId !== newNode.parentId
  ) {
    return true;
  }

  // 좌표 변화 확인 (threshold 이상일 때만 변경으로 간주)
  const oldX = oldNode.x ?? 0;
  const oldY = oldNode.y ?? 0;
  const newX = newNode.x ?? 0;
  const newY = newNode.y ?? 0;

  const dx = Math.abs(newX - oldX);
  const dy = Math.abs(newY - oldY);

  if (dx >= POSITION_CHANGE_THRESHOLD || dy >= POSITION_CHANGE_THRESHOLD) {
    return true;
  }

  // 변경사항 없음
  return false;
}

/**
 * Y.Map 변경사항을 백엔드 REST API로 동기화하는 훅
 *
 * **동작 방식:**
 * 1. Y.Map에 observe 리스너 등록
 * 2. 로컬 변경(add/update/delete) 감지
 * 3. 해당 변경사항을 백엔드 API로 전송하여 DB에 저장
 * 4. 원격 변경(다른 사용자)은 무시 (이미 Yjs가 동기화함)
 *
 * **아키텍처:**
 * - Frontend Y.Map 변경 → WebSocket (실시간 협업) + REST API (DB 영속화)
 * - REST API: POST /mindmap/{workspaceId}/node (생성)
 * - REST API: PATCH /mindmap/{workspaceId}/node/{nodeId} (수정)
 * - REST API: DELETE /mindmap/{workspaceId}/node/{nodeId} (삭제)
 */
export function useMindmapSync(
  workspaceId: string,
  yMap: Y.Map<NodeData> | null,
  enabled: boolean = true
) {
  const syncInProgressRef = useRef<Set<string>>(new Set());
  const updateTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!yMap || !enabled) return;

    const handleYMapChange = (
      event: Y.YMapEvent<NodeData>,
      transaction: Y.Transaction
    ) => {
      // 원격 변경은 무시 (이미 동기화됨)
      // 로컬 사용자 작업만 처리 (mindmap-crud)
      // position-update는 useCollaborativeNodes에서 이미 서버에 저장하므로 제외
      if (transaction.origin !== "mindmap-crud") {
        return;
      }

      // 변경된 각 노드에 대해 백엔드 동기화
      event.keysChanged.forEach((key) => {
        const action = event.changes.keys.get(key);
        if (!action) return;

        // 중복 요청 방지
        if (syncInProgressRef.current.has(key)) {
          return;
        }

        syncInProgressRef.current.add(key);

        if (action.action === "add") {
          // 새 노드 생성
          const nodeData = yMap.get(key);
          if (!nodeData) {
            syncInProgressRef.current.delete(key);
            return;
          }

          // 이미 nodeId가 있으면 서버에 이미 생성된 노드 (중복 생성 방지)
          if (nodeData.nodeId) {
            syncInProgressRef.current.delete(key);
            return;
          }

          createMindmapNode(workspaceId, {
            parentId: nodeData.parentId ? Number(nodeData.parentId) : null,
            type: nodeData.type || "text",
            keyword: nodeData.keyword,
            memo: nodeData.memo,
            x: nodeData.x,
            y: nodeData.y,
            color: nodeData.color,
          })
            .then((createdNode) => {
              // 백엔드에서 받은 nodeId를 로컬 노드에 반영 (조용히)
              yMap.doc?.transact(() => {
                const current = yMap.get(key);
                if (current && createdNode.nodeId) {
                  // 백엔드 nodeId 저장 (나중에 update/delete에 사용)
                  yMap.set(key, { ...current, nodeId: createdNode.nodeId });
                }
              }, "remote");
            })
            .catch((error) => {
              // Silently fail
            })
            .finally(() => {
              syncInProgressRef.current.delete(key);
            });
        } else if (action.action === "update") {
          // 노드 수정
          const nodeData = yMap.get(key);
          if (!nodeData) {
            syncInProgressRef.current.delete(key);
            return;
          }

          // nodeId가 없으면 아직 백엔드에 생성되지 않은 노드
          if (!nodeData.nodeId) {
            syncInProgressRef.current.delete(key);
            return;
          }

          // 이전 값과 비교하여 실제 변경사항이 있는지 확인
          const oldNodeData = action.oldValue as NodeData | undefined;
          if (oldNodeData && !hasSignificantChanges(oldNodeData, nodeData)) {
            syncInProgressRef.current.delete(key);
            return;
          }

          // 기존 대기 중인 업데이트 취소
          const existingTimeout = updateTimeoutsRef.current.get(key);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          // 300ms 후에 서버 업데이트 (드래그 중 연속 업데이트 방지)
          const timeout = setTimeout(() => {
            // Y.Map에서 최신 데이터 다시 가져오기 (setTimeout 동안 변경되었을 수 있음)
            const latestNodeData = yMap.get(key);
            if (!latestNodeData || !latestNodeData.nodeId) {
              syncInProgressRef.current.delete(key);
              updateTimeoutsRef.current.delete(key);
              return;
            }

            updateMindmapNode(workspaceId, latestNodeData.nodeId as number, {
              keyword: latestNodeData.keyword,
              memo: latestNodeData.memo,
              x: latestNodeData.x,
              y: latestNodeData.y,
              color: latestNodeData.color,
              parentId: latestNodeData.parentId ? Number(latestNodeData.parentId) : null,
              type: latestNodeData.type,
              analysisStatus: latestNodeData.analysisStatus,
            })
              .then((updatedNode) => {
                // Success
              })
              .catch((error) => {
                // Silently fail
              })
              .finally(() => {
                syncInProgressRef.current.delete(key);
                updateTimeoutsRef.current.delete(key);
              });
          }, 300);

          updateTimeoutsRef.current.set(key, timeout);
        } else if (action.action === "delete") {
          // 노드 삭제
          const oldNodeData = action.oldValue as NodeData | undefined;
          if (!oldNodeData?.nodeId) {
            syncInProgressRef.current.delete(key);
            return;
          }

          deleteMindmapNode(workspaceId, oldNodeData.nodeId)
            .then(() => {
              // Success
            })
            .catch((error) => {
              // Silently fail
            })
            .finally(() => {
              syncInProgressRef.current.delete(key);
            });
        }
      });
    };

    yMap.observe(handleYMapChange);

    return () => {
      yMap.unobserve(handleYMapChange);

      // 대기 중인 모든 업데이트 타임아웃 취소
      updateTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      updateTimeoutsRef.current.clear();
    };
  }, [yMap, workspaceId, enabled]);
}
