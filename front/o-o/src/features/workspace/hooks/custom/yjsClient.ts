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
  /** JSON 메시지를 텍스트로 전송 (바이너리 변환 방지) */
  sendJsonMessage: (message: object) => boolean;
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

  // WebSocket 연결 후 onmessage 래핑을 위한 플래그
  let isWsWrapped = false;

  const wrapWebSocket = () => {
    if (isWsWrapped || !provider.ws) return;
    isWsWrapped = true;

    console.log("[WebSocket] Wrapping onmessage handler");

    // 🔍 DEBUG: WebSocket send 래핑하여 송신 메시지 로깅
    // const originalSend = provider.ws.send.bind(provider.ws);
    // provider.ws.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    //   if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    //     console.log("📤 [WebSocket] Sending binary message:", {
    //       type: "binary",
    //       size: data instanceof ArrayBuffer ? data.byteLength : data.length,
    //       timestamp: new Date().toISOString(),
    //     });
    //   } else if (typeof data === "string") {
    //     console.log("📤 [WebSocket] Sending text message:", {
    //       type: "text",
    //       preview: data.substring(0, 100),
    //       timestamp: new Date().toISOString(),
    //     });
    //   }
    //   return originalSend(data);
    // };

    const originalOnMessage = provider.ws.onmessage;
    provider.ws.onmessage = (event) => {
      // 텍스트 메시지인 경우 JSON 파싱 후 처리
      if (typeof event.data === "string") {
        try {
          const parsed = JSON.parse(event.data);

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
          // JSON 파싱 실패 시 무시 (바이너리 메시지)
        }
      }

      // 바이너리 메시지는 원래 Yjs 핸들러로 전달
      if (originalOnMessage && provider.ws) {
        originalOnMessage.call(provider.ws, event);
      }
    };
  };

  provider.on(
    "status",
    (event: { status: "connected" | "disconnected" | "connecting" }) => {
      console.log("[WebSocket] Status changed:", event.status);

      // 연결 완료 후 WebSocket 래핑
      if (event.status === "connected") {
        wrapWebSocket();
      }
    }
  );

  provider.on("sync", (isSynced: boolean) => {
    console.log("[WebSocket] Sync status changed:", isSynced);
    console.log("[WebSocket] Provider synced:", provider.synced);
    console.log("[WebSocket] Doc clients count:", doc.store.clients.size);
    console.log("[WebSocket] Doc client IDs:", Array.from(doc.store.clients.keys()));
    console.log("[WebSocket] My client ID:", doc.clientID);
    console.log("[WebSocket] Doc isLoaded:", (doc as any).isLoaded);
    console.log("[WebSocket] Doc isSynced:", (doc as any).isSynced);
  });

  // Y.Doc 업데이트 감지 (실제 WebSocket으로 데이터가 올 때)
  doc.on("update", (update: Uint8Array, origin: any) => {
    console.log("\n🔥 ============ Yjs Update Received ============");
    console.log("📏 Size:", update.length, "bytes");
    console.log("🔑 Origin:", origin);
    console.log("🌐 From WebSocket:", origin === provider ? "YES" : "NO");
    console.log("⏰ Time:", new Date().toISOString());

    // 실제 변경된 내용 분석
    const mindmapNodes = doc.getMap("mindmap:nodes");

    console.log("\n📊 Current State:");
    console.log("  - Total nodes in Y.Map:", mindmapNodes.size);

    if (mindmapNodes.size > 0) {
      console.log("\n📝 All Nodes Content:");
      const allNodes = mindmapNodes.toJSON();
      Object.entries(allNodes).forEach(([key, value]) => {
        console.log(`\n  Node ID: ${key}`);
        console.log("  Full data:", JSON.stringify(value, null, 2));
      });
    }

    // 업데이트 구조 디코딩
    try {
      const decoded = Y.decodeUpdate(update);
      console.log("\n🔍 Update Details:");
      console.log("  - Number of changes:", decoded.structs?.length || 0);
      console.log("  - Has deletions:", decoded.ds ? "YES" : "NO");

      // 변경 타입 분석
      if (origin === provider) {
        console.log("  📥 Type: RECEIVED from server/other clients");
      } else if (origin === "mindmap-bootstrap") {
        console.log("  🚀 Type: INITIAL BOOTSTRAP");
      } else if (origin === "local") {
        console.log("  📤 Type: LOCAL CHANGE (will be sent to server)");
      } else {
        console.log("  ❓ Type:", origin);
      }
    } catch (err) {
      console.error("❌ Failed to decode:", err);
    }

    console.log("============================================\n");
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

  /**
   * JSON 메시지를 텍스트로 전송
   * y-websocket의 바이너리 모드를 우회하여 순수 텍스트로 전송
   */
  const sendJsonMessage = (message: object): boolean => {
    const ws = provider.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("[yjsClient] WebSocket not available or not open");
      return false;
    }

    try {
      const jsonString = JSON.stringify(message);
      // TextEncoder를 사용하지 않고 직접 문자열로 전송
      // WebSocket.send()에 문자열을 전달하면 텍스트 프레임으로 전송됨
      ws.send(jsonString);
      console.log("[yjsClient] Sent JSON message:", message);
      return true;
    } catch (error) {
      console.error("[yjsClient] Failed to send JSON message:", error);
      return false;
    }
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
    sendJsonMessage,
  };
};
