// yjsClient.ts
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { WorkspaceNotification } from "../../types/websocket.types";

export type CustomMessageHandler = (message: WorkspaceNotification) => void;

export type YClient = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  /** 숫자 워크스페이스 ID (예: "3") */
  workspaceId: string;
  wsToken: string;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
  /** JSON 메시지 핸들러 등록 */
  onJsonMessage: (handler: (data: any) => void) => void;
  /** 커스텀 메시지 리스너 등록 (role-update 등) */
  onCustomMessage: (handler: CustomMessageHandler) => () => void;
};

/**
 * Yjs 문서 + y-websocket provider 생성
 *
 * - wsUrl: "wss://api.o-o.io.kr/mindmap/ws"
 * - workspaceId: "3" 같은 워크스페이스 ID (숫자 문자열)
 * - wsToken: ST (짧은 유효기간 토큰)
 *
 * 최종 WebSocket URL 형식:
 *   wss://api.o-o.io.kr/mindmap/ws/workspace:3?token=...
 */
export const createYClient = (
  wsUrl: string,
  workspaceId: string, // "3" 같은 값 기대
  wsToken: string,
  options?: { connect?: boolean }
): YClient => {
  if (!wsUrl) throw new Error("wsUrl missing");
  if (!workspaceId) throw new Error("workspaceId missing");
  if (!wsToken) throw new Error("wsToken missing");

  const doc = new Y.Doc();

  // 혹시 "workspace:3" 형태로 들어와도 숫자만 추출
  const numericWorkspaceId = workspaceId.replace(/^workspace:/, "");

  // y-websocket이 path에 붙일 room 이름 → backend 요구사항에 맞게 "workspace:3"
  const roomName = `workspace:${numericWorkspaceId}`;

  // JSON 메시지 핸들러들을 저장할 배열
  const jsonMessageHandlers: Array<(data: any) => void> = [];

  // 최종 URL:
  //   ${wsUrl}/${roomName}?token=...
  //   → wss://api.o-o.io.kr/mindmap/ws/workspace:3?token=...
  const provider = new WebsocketProvider(wsUrl, roomName, doc, {
    // ✅ backend가 원하는 쿼리: ?token=...
    params: {
      token: wsToken,
    },
  });

  provider.on(
    "status",
    (event: { status: "connected" | "disconnected" | "connecting" }) => {
      console.log("[WebSocket] Status changed:", event.status);
    }
  );

  provider.on("sync", (isSynced: boolean) => {
    console.log("[WebSocket] Sync status changed:", isSynced);
  });

  // WebSocket 원시 메시지 감지 및 JSON 메시지 처리
  if (provider.ws) {
    const originalOnMessage = provider.ws.onmessage;
    provider.ws.onmessage = (event) => {
      console.log("🔴 [RAW WebSocket] Message received:", {
        data: event.data,
        type: typeof event.data,
        timestamp: new Date().toISOString(),
      });

      // 텍스트 메시지인 경우 JSON 파싱 후 처리
      if (typeof event.data === "string") {
        try {
          const parsed = JSON.parse(event.data);
          console.log("📨 [RAW WebSocket] Parsed JSON:", parsed);

          // 등록된 모든 JSON 메시지 핸들러 호출
          jsonMessageHandlers.forEach((handler) => {
            try {
              handler(parsed);
            } catch (err) {
              console.error("Error in JSON message handler:", err);
            }
          });

          // JSON 메시지는 Yjs 핸들러로 보내지 않고 여기서 처리
          // (Yjs는 바이너리만 처리 가능하므로 에러 방지)
          return;
        } catch (e) {
          console.log("📨 [RAW WebSocket] Text message:", event.data);
        }
      }

      // 바이너리 메시지만 원래 Yjs 핸들러로 전달
      if (originalOnMessage && provider.ws) {
        originalOnMessage.call(provider.ws, event);
      }
    };
  }

  // Y.Doc 업데이트 감지 (실제 WebSocket으로 데이터가 올 때)
  doc.on("update", (update: Uint8Array, origin: any) => {
    console.log("🔥 [WebSocket] Y.Doc Update received!", {
      updateSize: update.length,
      origin: origin,
      isFromWebSocket: origin === provider,
      timestamp: new Date().toISOString(),
    });

    // WebSocket에서 온 업데이트인 경우 Y.Map 내용 확인
    if (origin === provider) {
      const mindmapNodes = doc.getMap("mindmap:nodes");
      console.log("📊 [WebSocket] Current Y.Map size:", mindmapNodes.size);
      console.log("📊 [WebSocket] All nodes in Y.Map:", mindmapNodes.toJSON());
    }
  });

  const connect = () => provider.connect();
  const disconnect = () => provider.disconnect();
  const destroy = () => {
    provider.destroy();
    doc.destroy();
  };

  const onJsonMessage = (handler: (data: any) => void) => {
    jsonMessageHandlers.push(handler);
  };

  /**
   * 커스텀 메시지 리스너 등록
   * WebSocket의 raw message 이벤트를 활용하여 서버에서 보낸 커스텀 메시지 수신
   *
   * @param handler - 메시지를 처리할 콜백 함수
   * @returns cleanup 함수 (리스너 제거용)
   */
  const onCustomMessage = (handler: CustomMessageHandler): (() => void) => {
    const messageHandler = (event: MessageEvent) => {
      try {
        // WebSocket 메시지 데이터 처리
        let text: string;

        if (typeof event.data === "string") {
          text = event.data;
        } else if (event.data instanceof ArrayBuffer) {
          text = new TextDecoder().decode(event.data);
        } else if (event.data instanceof Blob) {
          // Blob은 비동기 처리가 필요하지만, y-websocket은 주로 ArrayBuffer 사용
          return;
        } else {
          return;
        }

        // JSON 파싱 시도 (커스텀 메시지는 JSON 형태로 가정)
        try {
          const message = JSON.parse(text) as unknown;

          // 디버깅: 모든 JSON 메시지 로깅
          console.log("[yjsClient] Raw WebSocket message:", message);

          // WorkspaceNotification 타입 체크는 handler 내부에서 수행
          if (
            typeof message === "object" &&
            message !== null &&
            "type" in message
          ) {
            handler(message as WorkspaceNotification);
          }
        } catch {
          // JSON이 아닌 데이터는 무시 (Yjs sync 바이너리 메시지)
        }
      } catch (error) {
        console.error("[yjsClient] Failed to process custom message:", error);
      }
    };

    // WebSocket의 raw message 이벤트 리스닝
    // provider.ws는 연결 후 생성되므로 존재 여부 확인
    const ws = provider.ws;
    if (ws) {
      ws.addEventListener("message", messageHandler);
    }

    // Cleanup 함수 반환
    return () => {
      const ws = provider.ws;
      if (ws) {
        ws.removeEventListener("message", messageHandler);
      }
    };
  };

  return {
    doc,
    provider,
    workspaceId: numericWorkspaceId, // 내부적으로는 숫자만 유지
    wsToken,
    connect,
    disconnect,
    destroy,
    onJsonMessage,
    onCustomMessage,
  };
};
