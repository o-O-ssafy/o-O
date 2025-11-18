// useYjsCollaboration.ts
import { useEffect, useState, useRef, useCallback } from "react";
import * as Y from "yjs";
import { createYClient, type YClient } from "./yjsClient";
import { createYMapCrud, type YMapCrud } from "./yMapCrud";
import { NODES_YMAP_KEY } from "@/constants/mindmapCollaboration";
import type { NodeData } from "../../../mindmap/types";
import { useAppSelector } from "@/store/hooks";
import { fetchWebSocketToken } from "@/services/websocketTokenService";
import type { WorkspaceRole } from "@/services/dto/workspace.dto";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMindmapNodes } from "@/services/mindmapService";
import { mapDtoToNodeData } from "@/services/dto/mindmap.dto";
import {
  isInitialCreateDoneNotification,
  isRoleUpdateNotification,
} from "../../types/websocket.types";
import { useLoadingStore } from "@/shared/store/loadingStore";

type UseYjsCollaborationOptions = {
  /** 이 훅을 활성화할지 여부 (페이지에 따라 on/off 가능) */
  enabled?: boolean;
  /** 인증 실패 등 더 이상 재연결 시도하면 안 되는 상황에서 호출 */
  onAuthError?: () => void;
  /** 현재 사용자의 워크스페이스 역할 (awareness에 포함) */
  myRole?: WorkspaceRole;
};

/**
 * Yjs 기반 협업(마인드맵) 로직을 초기화하고 관리하는 커스텀 훅
 *
 * 기능:
 * - Yjs client + WebSocket provider 초기화 및 정리
 * - Awareness 상태 (사용자 정보 + 커서 + 채팅) 관리
 * - Cytoscape 마우스 위치를 Awareness로 브로드캐스트
 * - Y.Map CRUD 유틸 제공
 */
export function useYjsCollaboration(
  wsUrl: string,
  roomId: string,
  cursorColor: string,
  options: UseYjsCollaborationOptions & {
    onAiRecommendation?: (data: {
      nodeId: number;
      aiList?: Array<{ tempId: string | null; parentId: number | null; keyword: string; memo: string }>;
      trendList?: Array<{ keyword: string; score: number; rank: number }>;
      // 기존 형식 호환성 (legacy)
      nodes?: Array<{ keyword: string; memo: string }>;
    }) => void;
  } = {}
) {
  const { enabled = true, onAuthError, myRole, onAiRecommendation } = options;

  const [collab, setCollab] = useState<{ client: YClient; map: Y.Map<NodeData> } | null>(null);
  const [crud, setCrud] = useState<YMapCrud<NodeData> | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const currentUser = useAppSelector((state) => state.user.user);
  const queryClient = useQueryClient();
  const setIsLoading = useLoadingStore.getState().setIsLoading;

  // refs
  const currentClientRef = useRef<YClient | null>(null);
  const mountedRef = useRef<boolean>(true);
  const reconnectingRef = useRef<boolean>(false);
  const statusCleanupRef = useRef<(() => void) | null>(null);
  const connectionCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customMessageCleanupRef = useRef<(() => void) | null>(null);
  const enabledRef = useRef<boolean>(enabled);
  const onAuthErrorRef = useRef<(() => void) | undefined>(onAuthError);

  // enabled / onAuthError ref 동기화
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onAuthErrorRef.current = onAuthError;
  }, [onAuthError]);

  // WebSocket/Client 초기화 & 정리
  useEffect(() => {
    mountedRef.current = true;

    const clearConnectionCheckTimeout = () => {
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
        connectionCheckTimeoutRef.current = null;
      }
    };

    const cleanupClient = () => {
      if (statusCleanupRef.current) {
        statusCleanupRef.current();
        statusCleanupRef.current = null;
      }
      if (customMessageCleanupRef.current) {
        customMessageCleanupRef.current();
        customMessageCleanupRef.current = null;
      }
      clearConnectionCheckTimeout();

      if (currentClientRef.current) {
        try {
          console.log("[useYjsCollaboration] cleanup: destroying client");

          // ✅ 재연결 시도를 먼저 중단 (중요!)
          const provider = currentClientRef.current.provider;
          provider.shouldConnect = false;  // 자동 재연결 비활성화
          provider.disconnect();           // 현재 연결 종료

          // 그 다음 destroy 호출
          currentClientRef.current.destroy();
        } catch (e) {
          console.error("[useYjsCollaboration] error destroying client:", e);
        }
        currentClientRef.current = null;
      }

      // 언마운트 이후 setState 호출 방지
      if (mountedRef.current) {
        setCollab(null);
        setCrud(null);
      }
    };

    const scheduleConnectionCheck = (client: YClient) => {
      clearConnectionCheckTimeout();
      connectionCheckTimeoutRef.current = setTimeout(() => {
        if (client.provider.wsconnected) {
          console.log("[useYjsCollaboration] WebSocket connection established");
          setConnectionError(false);
        } else {
          console.error("[useYjsCollaboration] WebSocket connection failed after 3 seconds");
          setConnectionError(true);
        }
      }, 3000);
    };

    const refreshTokenAndReconnect = async () => {
      if (
        reconnectingRef.current ||
        !mountedRef.current ||
        !currentClientRef.current ||
        !enabledRef.current
      ) {
        return;
      }

      reconnectingRef.current = true;
      try {
        console.log("[useYjsCollaboration] refreshing ws-token after disconnect");
        const nextToken = await fetchWebSocketToken();
        if (!mountedRef.current || !currentClientRef.current || !enabledRef.current) {
          return;
        }

        currentClientRef.current.wsToken = nextToken;

        const provider = currentClientRef.current.provider;
        
        provider.params = {
          token: nextToken,
        };

        provider.shouldConnect = true;
        provider.connect();
      } catch (error: any) {
        console.error("[useYjsCollaboration] failed to refresh ws-token:", error);
        setConnectionError(true);

        // 예: 401/403 등 인증 에러라면 더 이상 재시도하지 않도록 콜백 호출
        if (onAuthErrorRef.current) {
          onAuthErrorRef.current();
        }
      } finally {
        reconnectingRef.current = false;
      }
    };

    const attachStatusListener = (client: YClient) => {
      if (statusCleanupRef.current) {
        statusCleanupRef.current();
        statusCleanupRef.current = null;
      }

      const handleStatus = (event: { status: "connected" | "disconnected" | "connecting" }) => {
        console.log("[useYjsCollaboration] provider status:", event.status);
        if (!enabledRef.current) return;

        if (event.status === "disconnected") {
          // 여기서 바로 새 ST 받아서 재연결 시도
          refreshTokenAndReconnect();
        } else if (event.status === "connected") {
          setConnectionError(false);
        }
      };

      client.provider.on("status", handleStatus);
      statusCleanupRef.current = () => {
        client.provider.off("status", handleStatus);
      };
    };

    // 커스텀 메시지 리스너 등록
    const attachCustomMessageListener = (client: YClient) => {
      if (customMessageCleanupRef.current) {
        customMessageCleanupRef.current();
        customMessageCleanupRef.current = null;
      }

      let isHydratingInitialNodes = false;

      // initial-create-done 알림 수신 시 REST API로 노드 동기화
      const hydrateMindmapNodesFromRest = async () => {
        if (isHydratingInitialNodes || !mountedRef.current || !enabledRef.current) {
          return;
        }

        isHydratingInitialNodes = true;
        try {
          console.log("[useYjsCollaboration] initial-create-done: fetching nodes from REST");
          const restNodes = await fetchMindmapNodes(roomId);
          console.log("[useYjsCollaboration] initial-create-done: fetched", restNodes.length, "nodes");

          if (!mountedRef.current || !enabledRef.current || restNodes.length === 0) {
            return;
          }

          const nodesMap = client.doc.getMap<NodeData>(NODES_YMAP_KEY);

          client.doc.transact(() => {
            restNodes.forEach((node) => {
              const existingNode = nodesMap.get(node.id);
              const nextNode = existingNode ? { ...existingNode, ...node } : node;
              nodesMap.set(node.id, nextNode);
            });
          }, "initial-create-done");
        } catch (error) {
          console.error(
            "[useYjsCollaboration] failed to hydrate nodes after initial-create-done:",
            error
          );
        } finally {
          isHydratingInitialNodes = false;
          setIsLoading(false);
          console.log("🎉 Initial create done (REST path) - loading cleared");
        }
      };

      const cleanup = client.onCustomMessage((message) => {
        console.log("[useYjsCollaboration] received custom message:", message);

        // 역할 변경 알림 처리 (최소 정보만 확인)
        if (isRoleUpdateNotification(message)) {
          console.log("[useYjsCollaboration] role-update notification received, refetching workspace data");

          // workspace 데이터 재조회하여 myRole 갱신
          // 이것이 자동으로 isReadOnly, canEdit 등을 재계산하여 UI 업데이트 트리거
          // roomId는 workspaceId와 동일
          queryClient.invalidateQueries({ queryKey: ["workspace", roomId] });
        }

        // initial-create-done: nodes 배열이 없을 때만 REST API 호출
        // nodes가 포함되어 있으면 onJsonMessage 핸들러에서 처리
        if (isInitialCreateDoneNotification(message)) {
          const msg = message as any;
          if (!msg.nodes || !Array.isArray(msg.nodes) || msg.nodes.length === 0) {
            console.log("[useYjsCollaboration] initial-create-done (no nodes in message), fetching from REST");
            void hydrateMindmapNodesFromRest();
          } else {
            console.log("[useYjsCollaboration] initial-create-done (nodes included in message), handled by onJsonMessage");
          }
        }
      });

      customMessageCleanupRef.current = cleanup;
    };

    const initializeClient = async () => {
      if (!enabled) {
        console.log("[useYjsCollaboration] not enabled, skip initialize");
        return;
      }

      try {
        console.log("[useYjsCollaboration] fetching initial ws-token");
        const token = await fetchWebSocketToken();
        if (!mountedRef.current || !token || !enabledRef.current) return;

        console.log("[useYjsCollaboration] initializing YClient with workspace:", roomId);
        const client = createYClient(wsUrl, roomId, token);
        const map = client.doc.getMap<NodeData>(NODES_YMAP_KEY);

        if (!mountedRef.current || !enabledRef.current) {
          client.destroy();
          return;
        }

        currentClientRef.current = client;

        setCollab({ client, map });
        const crudOps = createYMapCrud(client.doc, map);
        setCrud(crudOps);
        setConnectionError(false);

        attachStatusListener(client);
        attachCustomMessageListener(client);
        console.log("[useYjsCollaboration] Custom message listener attached, ws readyState:", client.provider.ws?.readyState);

        client.provider.on("connection-close", (event: any) => {
          console.log(
            "🧯 [y-websocket] connection-close",
            "code =", event?.evt?.code,
            "reason =", event?.evt?.reason
          );
        });

        // JSON 메시지 핸들러 등록
        client.onJsonMessage(async (data) => {
          console.log("💬 [useYjsCollaboration] Received JSON message:", data);

          // 아이디어 추가 완료 (GPT 키워드 추출) - 두 가지 타입 모두 지원
          if ((data.type === "add-idea-done" || data.type === "initial-create-done") && data.nodes && Array.isArray(data.nodes)) {
            console.log(`💡 ${data.type}: syncing`, data.nodes.length, "nodes");

            const nodesMap = client.doc.getMap<NodeData>(NODES_YMAP_KEY);

            // DTO를 NodeData로 변환 (mapDtoToNodeData 사용)
            const nodeDatas = data.nodes.map((nodeDto: any) => mapDtoToNodeData(nodeDto));

            // 중복 제거: 같은 nodeId를 가진 노드가 이미 있으면 로컬 노드를 제거하고 서버 노드로 교체
            const existingNodeIds = new Map<number, string>();
            nodesMap.forEach((node, id) => {
              if (node.nodeId) {
                existingNodeIds.set(node.nodeId as number, id);
              }
            });

            // Y.Doc에 새 노드 추가 (origin: "remote"로 설정하여 useMindmapSync 재진입 방지)
            client.doc.transact(() => {
              for (const nodeData of nodeDatas) {
                if (nodeData.nodeId && existingNodeIds.has(nodeData.nodeId as number)) {
                  const existingId = existingNodeIds.get(nodeData.nodeId as number)!;

                  // 서버 노드(MongoDB ID)가 아닌 로컬 노드(타임스탬프 ID)만 교체
                  if (existingId !== nodeData.id && existingId.includes("-")) {
                    // 로컬 노드를 제거하고 서버 노드로 교체
                    nodesMap.delete(existingId);
                    nodesMap.set(nodeData.id, nodeData);
                    existingNodeIds.set(nodeData.nodeId as number, nodeData.id);
                  }
                  // 이미 서버 노드가 있으면 건너뜀
                  continue;
                }

                if (!nodesMap.has(nodeData.id)) {
                  nodesMap.set(nodeData.id, nodeData);
                }
              }
            }, "remote");

            console.log(`✅ ${data.type} nodes synced to Y.Map`);

            // initial-create-done인 경우 로딩 해제
            if (data.type === "initial-create-done") {
              setIsLoading(false);
              console.log("🎉 Initial create done - loading cleared");
            }
            // add-idea-done인 경우: 로딩 해제는 position calculation 완료 후 (useCollaborativeNodes에서 처리)
            // 노드들이 0,0에 모였다가 → calculate position → 진짜 position 렌더링 → 로딩 해제
          }
          // Ask Popo 재구조화 완료 - Y.Map 완전 교체
          else if (data.type === "restructure_apply" && data.nodes && Array.isArray(data.nodes)) {
            console.log(`🔄 restructure_apply: replacing entire Y.Map with`, data.nodes.length, "nodes");

            const nodesMap = client.doc.getMap<NodeData>(NODES_YMAP_KEY);

            // DTO를 NodeData로 변환 및 parentId 타입 정규화
            const nodeDatas = data.nodes.map((nodeDto: any) => {
              const nodeData = mapDtoToNodeData(nodeDto);
              return {
                ...nodeData,
                // parentId를 숫자로 정규화 (null 제외)
                parentId: nodeData.parentId === null ? null : Number(nodeData.parentId),
              };
            });

            // position 계산 필요 여부 확인
            const { calculateNodePositions } = await import("./useCollaborativeNodes");
            const processedNodes = await calculateNodePositions(nodeDatas);

            // Y.Map 완전 교체 (기존 노드 전부 삭제 후 새로운 노드로 재구성)
            client.doc.transact(() => {
              // 1. 기존 노드 모두 제거
              nodesMap.clear();

              // 2. 새 노드 추가
              for (const nodeData of processedNodes) {
                nodesMap.set(nodeData.id, nodeData);
              }
            }, "remote");

            console.log(`✅ restructure_apply: Y.Map completely replaced with ${processedNodes.length} nodes`);
          }
          // AI + 트렌드 통합 추천 결과
          else if (data.type === "ai_suggestion" && data.targetNodeId) {
            console.log("🤖 AI+Trend Recommendation received for node:", data.targetNodeId);

            if (onAiRecommendation) {
              onAiRecommendation({
                nodeId: data.targetNodeId,
                aiList: data.aiList || [],
                trendList: data.trendList || [],
              });
            }
          }
          // 기존 AI 분석 결과 형식도 호환성을 위해 유지 (status: "SUCCESS", nodes: [...])
          else if (data.status === "SUCCESS" && data.nodes && data.nodeId) {
            console.log("🤖 AI Recommendation (legacy) received for node:", data.nodeId);

            if (onAiRecommendation) {
              onAiRecommendation({
                nodeId: data.nodeId,
                nodes: data.nodes,
              });
            }
          } else {
            console.log("❓ Unknown message type:", data);
          }
        });

        scheduleConnectionCheck(client);

        console.log("[useYjsCollaboration] YClient initialized");
      } catch (error: any) {
        console.error("[useYjsCollaboration] failed to initialize YClient:", error);
        setConnectionError(true);
        cleanupClient();

        // 초기 ST 발급 자체가 인증 에러라면 여기서도 onAuthError 호출
        if (onAuthErrorRef.current) {
          onAuthErrorRef.current();
        }
      }
    };

    // 🔑 enabled === false면 기존 연결을 정리하고 아무 것도 하지 않음
    if (enabled) {
      initializeClient();
    } else {
      cleanupClient();
    }

    // Cleanup
    return () => {
      cleanupClient();
      mountedRef.current = false;
    };
  }, [roomId, wsUrl, enabled]);

  // Awareness 초기화 (사용자 정보 + 기본 커서/채팅 상태)
  useEffect(() => {
    if (!collab) return;

    const awareness = collab.client.provider.awareness;
    if (!awareness) return;

    const setAwarenessState = () => {
      const initialState = {
        user: {
          userId: currentUser?.id, // 숫자형 userId 추가 (역할 변경 API용)
          name: currentUser?.nickname || "익명의 사용자",
          email: currentUser?.email || "",
          profileImage: currentUser?.profileImage,
          color: cursorColor,
          role: myRole, // 워크스페이스 역할 추가 (MAINTAINER, EDIT, VIEW)
        },
        cursor: null, // mousemove에서 갱신
        chat: null, // 채팅 입력 시 갱신
      };
      console.log("[useYjsCollaboration] set initial awareness state:", initialState);
      awareness.setLocalState(initialState);
    };

    if (collab.client.provider.wsconnected) {
      setAwarenessState();
    } else {
      const handleStatus = (event: { status: string }) => {
        if (event.status === "connected") {
          setAwarenessState();
          collab.client.provider.off("status", handleStatus);
        }
      };
      collab.client.provider.on("status", handleStatus);

      return () => {
        collab.client.provider.off("status", handleStatus);
      };
    }

    return () => {
      awareness.setLocalState(null);
    };
  }, [collab, cursorColor, currentUser, myRole]);

  // 채팅 상태 업데이트 메서드
  const updateChatState = useCallback((
    chatData: { isTyping: boolean; currentText: string; timestamp: number } | null
  ) => {
    if (!collab) return;
    const awareness = collab.client.provider.awareness;
    if (!awareness) return;
    awareness.setLocalStateField("chat", chatData);
  }, [collab]);

  return {
    collab,
    crud,
    cursorColor,
    updateChatState,
    connectionError,
  };
}
