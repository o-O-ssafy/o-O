import { useCallback, type RefObject } from "react";
import type * as Y from "yjs";
import type { YMapCrud } from "../../../workspace/hooks/custom/yMapCrud";
import type {
  NodeData,
  MindmapMode,
  DeleteNodePayload,
  EditNodePayload,
} from "../../types";
import type { WorkspaceRole } from "@/services/dto/workspace.dto";
import { canEditWorkspace } from "@/shared/utils/permissionUtils";
import { useToast } from "@/shared/ui/ToastProvider";
import { addIdeaToMindmap, createInitialMindmap } from "@/services/mindmapService";
import type { InitialMindmapRequestDTO } from "@/services/dto/mindmap.dto";
import { calculateChildPosition } from "../../utils/parentCenteredLayout";
import { clampNodePosition } from "../../utils/d3Utils";
import { useLoadingStore } from "@/shared/store/loadingStore";

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
 * @param params.cyRef - D3 canvas ref (backward compatibility)
 * @param params.mode - 현재 마인드맵 모드 (edit/analyze)
 * @param params.myRole - 현재 사용자의 워크스페이스 역할
 * @param params.getRandomThemeColor - 랜덤 테마 색상 생성 함수
 * @param params.findNonOverlappingPosition - 겹치지 않는 위치 찾기 함수
 * @param params.yMap - Y.Map 인스턴스 (doc 접근용)
 * @returns 모든 노드 작업 핸들러 함수들
 */
export function useNodeOperations(params: {
  crud: YMapCrud<NodeData> | null;
  nodes: NodeData[];
  cyRef: RefObject<any>;
  mode: MindmapMode;
  workspaceId: string;
  myRole: WorkspaceRole | undefined;
  getRandomThemeColor: () => string;
  findNonOverlappingPosition: (nodes: NodeData[], baseX: number, baseY: number) => { x: number; y: number };
  findEmptySpace: (nodes: NodeData[], preferredX: number, preferredY: number, minDistance?: number) => { x: number; y: number };
  yMap?: Y.Map<NodeData> | null;
  isEmptyWorkspace: boolean;
}) {
  const { crud, nodes, cyRef, mode, workspaceId, myRole, getRandomThemeColor, findNonOverlappingPosition, findEmptySpace, yMap, isEmptyWorkspace } = params;
  const { showToast } = useToast();
  const setIsLoading = useLoadingStore.getState().setIsLoading;

  /**
   * 텍스트박스에서 아이디어 추가
   * - 빈 워크스페이스: /mindmap/initial API 호출 (workspaceId 포함)
   * - 노드 있음: /mindmap/{workspaceId}/add-idea API 호출
   * - GPT 키워드 자동 추출 API 호출
   * - WebSocket을 통해 생성된 노드들이 실시간으로 전달됨
   */
  const handleAddNode = useCallback(async ({ text }: {
    text: string;
  }) => {
    if (mode === "analyze" || !crud) return;

    if (!canEditWorkspace(myRole)) {
      showToast("노드를 추가할 권한이 없습니다", "error");
      return;
    }

    if (!text.trim()) {
      showToast("아이디어를 입력해주세요", "error");
      return;
    }

    try {
      // 로딩 시작
      setIsLoading(true);

      if (isEmptyWorkspace) {
        // 빈 워크스페이스: /mindmap/initial API 호출
        const request: InitialMindmapRequestDTO = {
          contentUrl: null,
          contentType: "TEXT",
          startPrompt: text.trim(),
          workspaceId: parseInt(workspaceId, 10),
        };

        const response = await createInitialMindmap(request);

        console.log("[handleAddNode] Initial mindmap created successfully:", {
          workspaceId: response.workspaceId,
          nodeId: response.nodeId,
          keyword: response.keyword,
        });

        showToast("마인드맵이 생성되었습니다", "success");
      } else {
        // 노드가 있는 워크스페이스: /mindmap/{workspaceId}/add-idea API 호출
        const response = await addIdeaToMindmap(workspaceId, text.trim());

        console.log("[handleAddNode] Idea added successfully:", {
          createdNodeCount: response.createdNodeCount,
          createdNodeIds: response.createdNodeIds,
        });

        showToast(
          `아이디어가 추가되었습니다 (생성된 노드: ${response.createdNodeCount}개)`,
          "success"
        );
      }

      // 로딩은 useCollaborativeNodes에서 position calculation 완료 시 해제됨
    } catch (error) {
      console.error("[handleAddNode] Failed to add idea:", error);

      // 로딩 해제
      setIsLoading(false);

      // 에러 타입별 메시지 처리
      if (error && typeof error === 'object') {
        const axiosError = error as { code?: string; response?: { status?: number } };

        // 타임아웃 에러
        if (axiosError.code === 'ECONNABORTED') {
          showToast("요청 시간이 초과되었습니다. 다시 시도해주세요", "error");
        }
        // HTTP 상태 코드 기반 에러
        else if ('response' in error && axiosError.response?.status) {
          if (axiosError.response.status === 400) {
            showToast("아이디어가 비어있거나 워크스페이스에 노드가 없습니다", "error");
          } else if (axiosError.response.status === 404) {
            showToast("워크스페이스를 찾을 수 없습니다", "error");
          } else {
            showToast("아이디어 추가에 실패했습니다", "error");
          }
        } else {
          showToast("아이디어 추가에 실패했습니다", "error");
        }
      } else {
        showToast("아이디어 추가에 실패했습니다", "error");
      }
    }
  }, [crud, mode, workspaceId, myRole, showToast, setIsLoading, isEmptyWorkspace]);

  /**
   * 자식 노드 생성
   * - 캔버스 전체에서 가장 빈 공간을 찾아 배치
   * - 선호 위치: 부모 노드 오른쪽
   */
  const handleCreateChildNode = useCallback(
    ({
      parentId,
      parentX,
      parentY,
      keyword,
      memo,
      mediaData,
    }: {
      parentId: string;
      parentX: number;
      parentY: number;
      keyword: string;
      memo?: string;
      mediaData?: import("@/features/home/types").MediaData;
    }) => {
      if (!crud || (!keyword && !mediaData?.type)) return;

      if (!canEditWorkspace(myRole)) {
        showToast("노드를 추가할 권한이 없습니다", "error");
        return;
      }

      // 부모 노드 찾기 (nodeId를 가져오기 위해)
      const parentNode = nodes.find((n) => n.id === parentId);
      if (!parentNode) {
        console.error(
          "[handleCreateChildNode] parent node not found",
          parentId
        );
        return;
      }

      // 부모 기준 원형 배치 (형제 노드 고려, 100px 기본 거리, 150px 최소 거리 유지)
      const { x, y } = calculateChildPosition(
        parentX,
        parentY,
        parentNode.nodeId ?? null,
        nodes,
        {
          baseRadius: 200, // 부모-자식 기본 거리
          minDistance: 150, // 노드 간 최소 거리
          angleBuffer: 15, // 형제 노드 각도 버퍼 (도)
          radiusStep: 50, // 충돌 시 반지름 증가량
          maxAttempts: 10, // 반지름 증가 최대 시도
        }
      );

      // 미디어 타입에 따라 노드 타입 결정
      let nodeType: "text" | "image" | "video" = "text";
      let contentUrl: string | undefined = undefined;

      if (mediaData?.type === "image") {
        nodeType = "image";
      } else if (mediaData?.type === "youtube") {
        nodeType = "video";
        contentUrl = mediaData.youtubeUrl;
      }

      const newNode: NodeData = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        parentId: parentNode.nodeId, // 부모 노드의 클라이언트 ID 사용 (Y.doc 기반)
        workspaceId: parseInt(workspaceId, 10),
        type: nodeType,
        analysisStatus: "NONE",
        keyword: keyword || (mediaData?.type === "image" ? mediaData.imageFile?.name : mediaData?.youtubeUrl) || "",
        x,
        y,
        color: getRandomThemeColor(),
        operation: "ADD",
        ...(memo ? { memo } : {}),
        ...(contentUrl ? { contentUrl } : {}),
        // 이미지 파일이 있으면 임시로 저장 (나중에 API 호출 시 사용)
        ...(mediaData?.type === "image" && mediaData.imageFile ? { _tempImageFile: mediaData.imageFile } : {}),
      };

      console.log("[handleCreateChildNode] Creating new child node:", {
        id: newNode.id,
        // parentId: newNode.parentId,
        parentNodeId: parentNode.nodeId,
        keyword: newNode.keyword,
        type: nodeType,
        hasImageFile: !!(mediaData?.type === "image" && mediaData.imageFile),
      });

      crud.set(newNode.id, newNode);
    },
    [crud, getRandomThemeColor, nodes, workspaceId, myRole, showToast]
  );

  /**
   * 노드 삭제
   * - deleteDescendants=true: 자식 노드도 재귀적으로 삭제
   * - deleteDescendants=false: 자식은 유지 (detached selection 처리 필요)
   */
  const handleDeleteNode = useCallback(
    ({ nodeId, deleteDescendants }: DeleteNodePayload) => {
      if (!crud) return;

      // 루트 노드(nodeId === 1) 삭제 방지
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (targetNode?.nodeId === 1) {
        console.warn("[useNodeOperations] 루트 노드는 삭제할 수 없습니다.");
        return;
      }

      if (!canEditWorkspace(myRole)) {
        showToast("노드를 삭제할 권한이 없습니다", "error");
        return;
      }

      const idsToDelete = new Set<string>([nodeId]);

      if (deleteDescendants) {
        // Build children map
        const childrenMap = nodes.reduce<Record<string, string[]>>(
          (acc, node) => {
            if (!node.parentId) {
              return acc;
            }
            if (!acc[node.parentId]) {
              acc[node.parentId] = [];
            }
            acc[node.parentId]!.push(node.id);
            return acc;
          },
          {}
        );

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
    },
    [crud, nodes, myRole, showToast]
  );

  /**
   * 노드 수정
   * - 텍스트, 메모, 색상, 부모 관계, 위치 변경
   */
  const handleEditNode = useCallback(
    ({
      nodeId,
      newText,
      newMemo,
      newColor,
      newParentId,
      x,
      y,
    }: EditNodePayload & { x?: number; y?: number }) => {
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
          ...(newParentId !== undefined
            ? { parentId: newParentId ?? undefined }
            : {}),
          ...(x !== undefined ? { x } : {}),
          ...(y !== undefined ? { y } : {}),
          operation: "UPDATE",
        };
      });
    },
    [crud, myRole, showToast]
  );

  /**
   * 다수 노드 위치 일괄 변경
   * - Layout 재배치 후 호출
   * - 위치를 캔버스 경계 내로 제한 (100px 마진 적용)
   * - "position-update" origin 사용 (중복 감지 스킵)
   */
  const handleBatchNodePositionChange = useCallback(
    (positions: Array<{ id: string; x: number; y: number }>) => {
      if (!yMap || positions.length === 0) return;

      if (!canEditWorkspace(myRole)) {
        showToast("노드를 이동할 권한이 없습니다", "error");
        return;
      }

      // 경계 제약 적용
      const validatedPositions = positions.map((pos) => {
        const clamped = clampNodePosition(pos.x, pos.y);
        return { id: pos.id, x: clamped.x, y: clamped.y };
      });

      const positionMap = new Map(
        validatedPositions.map((pos) => [pos.id, pos])
      );

      // "position-update" origin 사용하여 useYMapState에서 중복 체크 스킵
      yMap.doc?.transact(() => {
        positionMap.forEach(({ id, x, y }) => {
          const current = yMap.get(id);
          if (!current) return;
          yMap.set(id, { ...current, x, y, operation: "UPDATE" });
        });
      }, "position-update");
    },
    [yMap, myRole, showToast]
  );

  /**
   * 테마 색상 일괄 적용
   * - 모든 노드에 순환 방식으로 색상 배정
   */
  const handleApplyTheme = useCallback(
    (colors: string[]) => {
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
          operation: "UPDATE",
        },
      ]) as Array<[string, NodeData]>;
      crud.setMany(entries);
    },
    [crud, nodes, myRole, showToast]
  );

  return {
    handleAddNode,
    handleCreateChildNode,
    handleDeleteNode,
    handleEditNode,
    handleBatchNodePositionChange,
    handleApplyTheme,
  };
}
