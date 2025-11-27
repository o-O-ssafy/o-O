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
    const attachCustomMessageListener = (
      client: YClient,
      safeTransact: (callback: () => void, origin: string) => void,
      isTempId: (id: string) => boolean
    ) => {
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

          safeTransact(() => {
            restNodes.forEach((node) => {
              // ✅ 중복 방지: 이미 있는 노드는 건너뜀
              if (!nodesMap.has(node.id)) {
                nodesMap.set(node.id, node);
              }
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

      // ✅ Transaction origin 검증 헬퍼 (이 함수 내에서 client를 참조)
      const createSafeTransact = (client: YClient) => {
        return (callback: () => void, origin: string) => {
          if (typeof origin !== 'string') {
            console.error('❌ [Yjs] Invalid transaction origin (expected string):', origin);
            console.error('   Type:', typeof origin);
            console.error('   Stack trace:', new Error().stack);
            origin = 'unknown';
          }
          client.doc.transact(callback, origin);
        };
      };

      try {
        console.log("[useYjsCollaboration] fetching initial ws-token");
        const token = await fetchWebSocketToken();
        if (!mountedRef.current || !token || !enabledRef.current) return;

        console.log("[useYjsCollaboration] initializing YClient with workspace:", roomId);
        const client = createYClient(wsUrl, roomId, token);
        const map = client.doc.getMap<NodeData>(NODES_YMAP_KEY);
        const safeTransact = createSafeTransact(client);

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
        attachCustomMessageListener(client, safeTransact, isTempId);
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
          console.log(`📨 [Message Stats] type="${data.type}", nodes count=${data.nodes?.length || 0}`);

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

            // 📊 [LOG] Y.Map 상태 확인 (삽입 전)
            console.log(`📊 [Y.Map Before Insert] Total nodes in Y.Map: ${nodesMap.size}`);
            console.log(`📊 [Y.Map Before Insert] Nodes to insert: ${nodeDatas.length}`, nodeDatas.map((n: NodeData) => ({ id: n.id, nodeId: n.nodeId })));
            console.log(`📊 [Y.Map Before Insert] Existing nodeIds:`, Array.from(existingNodeIds.entries()));

            // Y.Doc에 새 노드 추가 (origin: "remote"로 설정하여 useMindmapSync 재진입 방지)
            safeTransact(() => {
              for (const nodeData of nodeDatas) {
                if (nodeData.nodeId && existingNodeIds.has(nodeData.nodeId as number)) {
                  const existingId = existingNodeIds.get(nodeData.nodeId as number)!;

                  console.log(`🔍 [Duplicate Check] nodeId=${nodeData.nodeId} already exists with id="${existingId}"`);

                  // ✅ 임시 ID인 기존 노드를 영속 ID로 교체
                  if (existingId !== nodeData.id && isTempId(existingId)) {
                    // 로컬 임시 노드를 제거하고 서버 영속 노드로 교체
                    console.log(`🔄 [Replace] Replacing temp node "${existingId}" with persistent node "${nodeData.id}"`);
                    nodesMap.delete(existingId);
                    nodesMap.set(nodeData.id, nodeData);
                    existingNodeIds.set(nodeData.nodeId as number, nodeData.id);
                  } else {
                    console.log(`⏭️ [Skip] Persistent node already exists, skipping`);
                  }
                  // 이미 서버 노드가 있으면 건너뜀
                  continue;
                }

                if (!nodesMap.has(nodeData.id)) {
                  console.log(`➕ [Insert] Inserting new node id="${nodeData.id}", nodeId=${nodeData.nodeId}`);
                  nodesMap.set(nodeData.id, nodeData);
                } else {
                  console.log(`⚠️ [Warning] Node id="${nodeData.id}" already exists in Y.Map, skipping`);
                }
              }
            }, "remote");

            // 📊 [LOG] Y.Map 상태 확인 (삽입 후)
            console.log(`📊 [Y.Map After Insert] Total nodes in Y.Map: ${nodesMap.size}`);
            const allNodesAfter: Array<{ id: string; nodeId: number | null }> = [];
            nodesMap.forEach((node, id) => {
              allNodesAfter.push({ id, nodeId: node.nodeId ?? null });
            });
            console.log(`📊 [Y.Map After Insert] All nodes:`, allNodesAfter);

            console.log(`✅ ${data.type} nodes synced to Y.Map`);

            // initial-create-done인 경우 로딩 해제
            if (data.type === "initial-create-done") {
              setIsLoading(false);
              console.log("🎉 Initial create done - loading cleared");
            }
            // add-idea-done인 경우: 로딩 해제는 position calculation 완료 후 (useCollaborativeNodes에서 처리)
            // 노드들이 0,0에 모였다가 → calculate position → 진짜 position 렌더링 → 로딩 해제
          }
          // Ask Popo 재구조화 완료
          // 서버가 Y.Doc을 직접 수정하고 바이너리로 동기화해줌
          // 클라이언트는 로딩 해제만 담당 (Y.Map은 바이너리 sync로 자동 반영)
          else if (data.type === "restructure_apply") {
            console.log(`🔄 restructure_apply: 서버 Y.Doc 바이너리 동기화로 자동 반영`);

            // 재구조화 완료 - 로딩 해제
            setIsLoading(false);
            console.log("🎉 Restructure apply done - loading cleared");
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

    // 🔍 Awareness 변경 로그 리스너
    const handleAwarenessChange = (changes: { added: number[]; updated: number[]; removed: number[] }) => {
    //   const selfId = awareness.clientID;
    //   const states = awareness.getStates();

      // console.group("🌐 [Awareness] 상태 변경 감지");
      // console.log("├── 📌 내 clientID:", selfId);
      // console.log("├── 📊 변경 내역:", {
      //   추가됨: changes.added,
      //   업데이트됨: changes.updated,
      //   제거됨: changes.removed,
      // });
      // console.log("├── 👥 전체 참가자 수:", states.size);
      // console.log("└── 📋 모든 참가자 상태:");

      // states.forEach((state, clientId) => {
      //   const isMe = clientId === selfId;
      //   const prefix = isMe ? "    ├── 👤 [나]" : "    └── 👻 [다른 사용자]";

      //   console.group(`${prefix} clientID: ${clientId}`);
      //   console.log("    ├── 🧑 사용자 정보:", {
      //     userId: state?.user?.userId,
      //     name: state?.user?.name,
      //     email: state?.user?.email,
      //     color: state?.user?.color,
      //     role: state?.user?.role,
      //     profileImage: state?.user?.profileImage ? "있음" : "없음",
      //   });
      //   console.log("    ├── 🖱️ 커서 위치:", state?.cursor ? {
      //     x: state.cursor.x?.toFixed(2),
      //     y: state.cursor.y?.toFixed(2),
      //     color: state.cursor.color,
      //   } : "없음");
      //   console.log("    ├── 💬 채팅 상태:", state?.chat ? {
      //     isTyping: state.chat.isTyping,
      //     currentText: state.chat.currentText?.substring(0, 50) + (state.chat.currentText?.length > 50 ? "..." : ""),
      //     timestamp: state.chat.timestamp ? new Date(state.chat.timestamp).toLocaleTimeString() : "없음",
      //   } : "없음");
      //   console.log("    └── 🎙️ GPT 상태:", state?.gpt ? {
      //     isRecording: state.gpt.isRecording,
      //     startedBy: state.gpt.startedBy,
      //     keywordsCount: state.gpt.keywords?.length || 0,
      //   } : "없음");
      //   console.groupEnd();
      // });
      // console.groupEnd();
    };

    awareness.on("change", handleAwarenessChange);

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
      console.group("🚀 [Awareness] 초기 상태 설정");
      console.log("└── 📝 설정할 상태:", initialState);
      console.groupEnd();
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
        awareness.off("change", handleAwarenessChange);
      };
    }

    return () => {
      awareness.off("change", handleAwarenessChange);
      awareness.setLocalState(null);
      // console.log("🔌 [Awareness] 연결 해제 및 상태 초기화");
    };
  }, [collab, cursorColor, currentUser, myRole]);

  // 채팅 상태 업데이트 메서드
  const updateChatState = useCallback((
    chatData: { isTyping: boolean; currentText: string; timestamp: number } | null
  ) => {
    if (!collab) return;
    const awareness = collab.client.provider.awareness;
    if (!awareness) return;
    // console.log("💬 [Awareness] 채팅 상태 업데이트:", chatData ? {
    //   isTyping: chatData.isTyping,
    //   currentText: chatData.currentText?.substring(0, 30) + (chatData.currentText?.length > 30 ? "..." : ""),
    //   timestamp: new Date(chatData.timestamp).toLocaleTimeString(),
    // } : "null (초기화)");
    awareness.setLocalStateField("chat", chatData);
  }, [collab]);

  // GPT 상태 업데이트 메서드
  const updateGptState = useCallback((
    gptData: {
      isRecording: boolean;
      keywords: Array<{ id: string; label: string; children?: any[] }>;
      startedBy: string;
      timestamp: number;
    } | null
  ) => {
    if (!collab) return;
    const awareness = collab.client.provider.awareness;
    if (!awareness) return;
    // console.log("🎙️ [Awareness] GPT 상태 업데이트:", gptData ? {
    //   isRecording: gptData.isRecording,
    //   startedBy: gptData.startedBy,
    //   keywordsCount: gptData.keywords?.length || 0,
    //   keywords: gptData.keywords?.map(k => k.label).join(", ") || "없음",
    //   timestamp: new Date(gptData.timestamp).toLocaleTimeString(),
    // } : "null (초기화)");
    awareness.setLocalStateField("gpt", gptData);
  }, [collab]);

  return {
    collab,
    crud,
    cursorColor,
    updateChatState,
    updateGptState,
    connectionError,
  };
}
