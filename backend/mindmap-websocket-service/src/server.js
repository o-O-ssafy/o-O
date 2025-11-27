/** 
 * ========================================
 * o-O Mindmap 실시간 협업 WebSocket 서버
 * ========================================
 *
 * 이 서버의 역할:
 * 1. 여러 사용자가 동시에 마인드맵을 편집할 수 있게 함 (실시간 동기화)
 * 2. 다른 사용자의 커서 위치를 실시간으로 공유
 * 3. Figma처럼 "/" 키로 임시 채팅 가능
 * 4. 모든 변경사항을 Kafka로 전송하여 MongoDB에 영구 저장
 *
 * 기술 스택:
 * - Y.js: CRDT 알고리즘 기반 실시간 협업 (충돌 없이 자동 병합)
 * - WebSocket: 실시간 양방향 통신
 * - Express: HTTP 서버 (헬스체크, 통계 API)
 * - Kafka: 변경사항 메시지 큐 (다른 서비스로 전달)
 *
 * 연결 방법:
 * - 직접 연결: ws://localhost:3000/mindmap/ws?workspace=123
 * - Gateway 경유: ws://gateway:8080/mindmap/ws?workspace=123&token=xxx
 *   (Gateway가 JWT 검증 후 X-Workspace-ID, X-USER-ID 헤더로 전달)
 */

import 'dotenv/config';  // .env 파일에서 환경변수 로드
import express from 'express';
import { WebSocketServer } from 'ws';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';  // Y.js WebSocket 유틸
import * as Y from 'yjs';
import http from 'http';
import { logger } from './utils/logger.js';
import { ydocManager } from './yjs/ydoc-manager.js';
import { awarenessManager } from './yjs/awareness.js';
import { kafkaProducer } from './kafka/producer.js';
import { kafkaConsumer } from './kafka/consumer.js';
import { signalingManager } from './webrtc/signaling-manager.js';

const app = express();
const PORT = process.env.PORT || 8084;  // 기본 포트 8084

// ===== workspace별 사용자 연결 추적 =====
// Map<workspaceId, Map<userId(Number), WebSocket>>
const workspaceConnections = new Map();

/**
 * workspace의 특정 사용자에게 메시지 전송
 * @param {string} workspaceId - workspace ID
 * @param {number} userId - 사용자 ID (Number)
 * @param {object} message - 전송할 메시지 객체
 */
function sendToUser(workspaceId, userId, message) {
  logger.info(`[sendToUser] Attempting to send message`, {
    workspaceId,
    userId,
    messageType: message.type,
  });

  const users = workspaceConnections.get(workspaceId);
  if (!users) {
    logger.warn(`[sendToUser] Workspace ${workspaceId} not found in connections map`);
    return false;
  }

  const conn = users.get(userId);
  if (!conn) {
    logger.warn(`[sendToUser] User ${userId} not found in workspace ${workspaceId}`, {
      availableUsers: Array.from(users.keys()),
    });
    return false;
  }

  try {
    const messageStr = JSON.stringify(message);
    conn.send(messageStr);
    logger.info(`[sendToUser] Message sent successfully`, {
      workspaceId,
      userId,
      messageType: message.type,
      messageSize: messageStr.length,
    });
    return true;
  } catch (error) {
    logger.error(`[sendToUser] Failed to send message`, {
      workspaceId,
      userId,
      messageType: message.type,
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
}

/**
 * workspace에 사용자 연결 추가
 * @param {string} workspaceId - workspace ID
 * @param {number} userId - 사용자 ID (Number)
 * @param {WebSocket} conn - WebSocket 연결
 */
function addUserConnection(workspaceId, userId, conn) {
  if (!workspaceConnections.has(workspaceId)) {
    workspaceConnections.set(workspaceId, new Map());
    logger.info(`[Connections] New workspace created in connections map`, { workspaceId });
  }

  const users = workspaceConnections.get(workspaceId);
  users.set(userId, conn);

  logger.info(`[Connections] User connected`, {
    workspaceId,
    userId,
    totalUsersInWorkspace: users.size,
    totalWorkspaces: workspaceConnections.size,
  });
}

/**
 * workspace에서 사용자 연결 제거
 * @param {string} workspaceId - workspace ID
 * @param {number} userId - 사용자 ID (Number)
 */
function removeUserConnection(workspaceId, userId) {
  const users = workspaceConnections.get(workspaceId);
  if (!users) {
    logger.warn(`[Connections] Cannot remove user: workspace ${workspaceId} not found`, { userId });
    return;
  }

  const existed = users.delete(userId);
  if (!existed) {
    logger.warn(`[Connections] User ${userId} was not in workspace ${workspaceId}`);
    return;
  }

  logger.info(`[Connections] User disconnected`, {
    workspaceId,
    userId,
    remainingUsersInWorkspace: users.size,
  });

  // workspace에 사용자가 없으면 Map에서 제거
  if (users.size === 0) {
    workspaceConnections.delete(workspaceId);
    logger.info(`[Connections] Workspace removed from connections map (no users left)`, {
      workspaceId,
      remainingWorkspaces: workspaceConnections.size,
    });
  }
}

/**
 * workspace의 모든 사용자에게 메시지 전송
 * @param {string} workspaceId - workspace ID
 * @param {object} message - 전송할 메시지 객체
 * @returns {number} 메시지를 성공적으로 보낸 사용자 수
 */
function sendToWorkspace(workspaceId, message) {
  logger.info(`[sendToWorkspace] Attempting to send message to all users`, {
    workspaceId,
    messageType: message.type,
  });

  const users = workspaceConnections.get(workspaceId);
  if (!users) {
    logger.warn(`[sendToWorkspace] Workspace ${workspaceId} not found in connections map`);
    return 0;
  }

  let sentCount = 0;
  const messageStr = JSON.stringify(message);

  for (const [userId, conn] of users) {
    try {
      conn.send(messageStr);
      sentCount++;
      logger.debug(`[sendToWorkspace] Message sent to user ${userId}`, {
        workspaceId,
        messageType: message.type,
      });
    } catch (error) {
      logger.error(`[sendToWorkspace] Failed to send message to user ${userId}`, {
        workspaceId,
        messageType: message.type,
        error: error.message,
      });
    }
  }

  logger.info(`[sendToWorkspace] Message sent successfully`, {
    workspaceId,
    messageType: message.type,
    totalUsers: users.size,
    sentCount,
  });

  return sentCount;
}

// ===== HTTP 엔드포인트 =====

/**
 * 헬스체크 엔드포인트
 * 모니터링 시스템(Kubernetes, AWS ECS 등)에서 서버 상태 확인용
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mindmap-websocket-service',
    timestamp: new Date().toISOString(),
    stats: {
      ydoc: ydocManager.getStats(),           // Y.Doc 통계 (워크스페이스 수, 노드 수 등)
      awareness: awarenessManager.getStats(),  // Awareness 통계 (접속자 수)
      kafka: {
        producer: kafkaProducer.getStatus(),   // Kafka Producer 상태
        consumer: kafkaConsumer.getStatus(),   // Kafka Consumer 상태
      },
    },
  });
});

/**
 * 통계 정보 엔드포인트
 * 개발/디버깅용 - 현재 서버 상태 상세 조회
 * GET /stats
 */
app.get('/stats', (req, res) => {
  res.json({
    ydoc: ydocManager.getStats(),
    awareness: awarenessManager.getStats(),
    voiceChat: signalingManager.getStats(),
    kafka: {
      producer: kafkaProducer.getStatus(),
      consumer: kafkaConsumer.getStatus(),
    },
  });
});

// ===== WebSocket 서버 설정 =====

// HTTP 서버 생성 (Express 앱을 기반으로)
const server = http.createServer(app);

// WebSocket 서버 생성 (HTTP 서버에 연결)
// path를 제거하고 noServer: false로 설정하여 모든 경로 허용
// 대신 connection 핸들러에서 URL 검증 수행
const wss = new WebSocketServer({
  server,       // HTTP 서버에 WebSocket 서버 연결
  // path를 지정하지 않으면 모든 WebSocket 요청을 받음
  // y-websocket이 만드는 /mindmap/ws/{roomId} 형태도 처리 가능
});

logger.info('WebSocket server created (accepts /mindmap/ws for Y.js sync and /mindmap/voice for voice chat)');

setPersistence({
    // 문서에 첫 클라이언트가 붙을 때마다 한 번씩 호출됨
    bindState: async (docName, ydoc) => {
        // docName 예: "workspace:53"
        const workspaceId = docName.replace(/^workspace:/, '');

        logger.info('[YWS][PERSIST] bindState called', {
            docName,
            workspaceId,
        });

        // y-websocket 내부에서 쓰는 ydoc을 우리 매니저에 등록 + observer 붙이기
        ydocManager.registerExternalDoc(workspaceId, ydoc);
    },

    // 마지막 클라이언트가 떠나서 문서가 닫힐 때 호출됨
    writeState: async (docName, ydoc) => {
        const workspaceId = docName.replace(/^workspace:/, '');

        logger.info('[YWS][PERSIST] writeState called (no clients left)', {
            docName,
            workspaceId,
        });

        // 필요하면 여기서 flush / 정리 작업 추가
        // 지금은 그냥 로그만 찍고 끝
    },
});

/**
 * ============================================
 * WebSocket 연결 핸들러 (핵심 로직)
 * ============================================
 *
 * 클라이언트가 WebSocket으로 접속할 때마다 실행됨
 * URL 형식:
 * - Y.js 동기화: ws://localhost:8084/mindmap/ws?workspace=123
 * - 음성 채팅: ws://localhost:8084/mindmap/voice?workspace=123
 * - Gateway: ws://gateway:8080/mindmap/{ws|voice}?workspace=123&token=xxx
 *
 * 처리 흐름:
 * 1. URL 경로에 따라 라우팅 (Y.js vs 음성 채팅)
 * 2. workspace ID 추출 (헤더 우선, 쿼리 파라미터 fallback) 및 검증
 * 3. user ID 추출 (Gateway에서 JWT 검증 후 헤더로 전달)
 * 4-1. /mindmap/ws: Y.Doc, Awareness 인스턴스 가져오기 (없으면 생성)
 * 4-2. /mindmap/voice: SignalingManager로 음성 채팅 처리
 * 5. 이벤트 리스너 등록 (close, error, message)
 */
wss.on('connection', (conn, req) => {
  // URL에서 쿼리 파라미터 파싱
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 경로에 따라 라우팅: /mindmap/voice → 음성 채팅, /mindmap/ws → Y.js 동기화
  if (pathname.startsWith('/mindmap/voice')) {
    handleVoiceConnection(conn, req, url);
    return;
  }

  // 기본: Y.js 연결 처리
  handleYjsConnection(conn, req, url);
});

/**
 * ============================================
 * 초기 노드 생성 완료 이벤트 핸들러
 * ============================================
 *
 * Kafka에서 mindmap.node.update 토픽을 수신하면 호출됨
 * 해당 workspace의 모든 사용자에게 initial-create-done 이벤트를 전송
 * 클라이언트는 이 메시지를 받고 생성된 노드를 화면에 렌더링
 *
 * @param {string|number} workspaceId - workspace ID
 * @param {Array<object>} nodes - 생성된 노드 정보 배열 (옵션)
 *   예: [{ nodeId: 10, parentId: 3, keyword: '맛집 검색', memo: '...', type: 'text', color: '#FFE5E5', x: null, y: null }]
 */
function handleInitialCreateDone(workspaceId, nodes = null) {
  const workspaceIdStr = workspaceId.toString();

  logger.info(`[InitialCreateDone] Initial node creation completed`, {
    workspaceId: workspaceIdStr,
    hasNodes: nodes !== null,
    nodeCount: nodes ? nodes.length : 0,
  });

  // workspace의 모든 사용자에게 initial-create-done 이벤트 전송
  const payload = {
    type: 'initial-create-done',
    workspaceId: workspaceIdStr,
  };

  // 생성된 노드 정보가 있으면 포함
  if (nodes && Array.isArray(nodes) && nodes.length > 0) {
    payload.nodes = nodes;  // 전체 노드 정보
    payload.nodeCount = nodes.length;
  }

  const sentCount = sendToWorkspace(workspaceIdStr, payload);

  if (sentCount > 0) {
    logger.info(`[InitialCreateDone] Notification sent successfully`, {
      workspaceId: workspaceIdStr,
      sentCount,
      includedNodeData: nodes !== null,
      nodeCount: nodes ? nodes.length : 0,
    });
  } else {
    logger.warn(`[InitialCreateDone] No users connected to workspace`, {
      workspaceId: workspaceIdStr,
    });
  }
}

/**
 * ============================================
 * 역할 변경 이벤트 핸들러
 * ============================================
 *
 * 클라이언트가 다른 사용자의 역할을 변경하면 호출됨
 * 해당 사용자에게만 role-update 이벤트를 전송
 *
 * @param {string} workspaceId - workspace ID
 * @param {number|null} senderId - 이벤트를 보낸 사용자 ID
 * @param {object} data - 메시지 데이터
 * @param {number} data.targetUserId - 역할이 변경된 사용자 ID (Number)
 */
function handleRoleChanged(workspaceId, senderId, data) {
  logger.info(`[RoleChanged] Role change event received`, {
    workspaceId,
    senderId: senderId || 'anonymous',
    rawData: data,
  });

  const { targetUserId } = data;

  // targetUserId 검증
  if (typeof targetUserId !== 'number') {
    logger.warn(`[RoleChanged] Invalid targetUserId type`, {
      workspaceId,
      senderId: senderId || 'anonymous',
      targetUserId,
      actualType: typeof targetUserId,
      expectedType: 'number',
    });
    return;
  }

  // NaN 체크
  if (isNaN(targetUserId)) {
    logger.warn(`[RoleChanged] targetUserId is NaN`, {
      workspaceId,
      senderId: senderId || 'anonymous',
      targetUserId,
    });
    return;
  }

  logger.info(`[RoleChanged] Processing role change`, {
    workspaceId,
    senderId: senderId || 'anonymous',
    targetUserId,
  });

  // 역할이 변경된 사용자에게만 role-update 이벤트 전송
  const sent = sendToUser(workspaceId, targetUserId, {
    type: 'role-update',
  });

  if (sent) {
    logger.info(`[RoleChanged] Role update notification sent successfully`, {
      workspaceId,
      senderId: senderId || 'anonymous',
      targetUserId,
    });
  } else {
    logger.warn(`[RoleChanged] Role update notification failed - user not connected`, {
      workspaceId,
      senderId: senderId || 'anonymous',
      targetUserId,
      reason: 'User not found in workspace connections',
    });
  }
}

/**
 * ============================================
 * 음성 채팅 WebSocket 연결 핸들러
 * ============================================
 */
function handleVoiceConnection(conn, req, url) {
  // workspace ID 추출 (헤더 우선, 쿼리 파라미터 fallback)
  const workspaceId = req.headers['x-workspace-id'] || url.searchParams.get('workspace');

  // user ID 추출 (Gateway의 JWT 검증 결과)
  const userId = req.headers['x-user-id'] || url.searchParams.get('userId');

  // workspace ID가 없으면 연결 거부
  if (!workspaceId) {
    logger.warn('[VoiceChat] Connection rejected: missing workspace parameter');
    conn.close(1008, 'Missing workspace parameter');
    return;
  }

  // user ID가 없으면 연결 거부
  if (!userId) {
    logger.warn('[VoiceChat] Connection rejected: missing user ID');
    conn.close(1008, 'Missing user ID');
    return;
  }

  logger.info(`[VoiceChat] New connection to workspace ${workspaceId}`, {
    userId,
    source: req.headers['x-workspace-id'] ? 'gateway-header' : 'query-param'
  });

  // 음성 채팅 방에 참가
  const joined = signalingManager.joinVoice(workspaceId, userId, conn);
  if (!joined) {
    logger.warn(`[VoiceChat] Failed to join workspace ${workspaceId} for user ${userId}`);
    return;
  }

  // 메시지 핸들러 등록
  conn.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      logger.info(`[VoiceChat] Message received from user ${userId}`, {
        workspaceId,
        userId,
        type: message.type,
        fullMessage: message,
      });

      switch (message.type) {
        case 'offer':
          signalingManager.handleOffer(workspaceId, userId, message.toUserId, message.offer);
          break;

        case 'answer':
          signalingManager.handleAnswer(workspaceId, userId, message.toUserId, message.answer);
          break;

        case 'ice':
          signalingManager.handleIceCandidate(workspaceId, userId, message.toUserId, message.candidate);
          break;

        case 'voice-state':
          signalingManager.handleVoiceState(workspaceId, userId, message.voiceState);
          break;

        // GPT 관련 메시지
        case 'gpt-start-recording':
          signalingManager.handleGptStart(workspaceId, userId, conn);
          break;

        case 'gpt-transcript':
          signalingManager.handleGptTranscript(
            workspaceId,
            userId,
            message.userName,
            message.text,
            message.timestamp
          );
          break;

        case 'gpt-stop-recording':
          signalingManager.handleGptStop(workspaceId, userId);
          break;

        // 회의록 생성 관련 메시지
        case 'voice-transcript':
          signalingManager.handleVoiceTranscript(
            workspaceId,
            userId,
            message.userName,
            message.text,
            message.timestamp
          );
          break;

        case 'generate-meeting-minutes':
          await signalingManager.handleGenerateMeetingMinutes(workspaceId, userId, conn);
          break;

        case 'role-changed':
          logger.info(`[VoiceChat] role-changed received on VOICE websocket (should use YJS websocket)`, {
            workspaceId,
            userId,
            targetUserId: message.targetUserId,
          });
          // 음성 채팅 WebSocket이 아닌 Y.js WebSocket으로 보내야 함을 알림
          conn.send(JSON.stringify({
            type: 'error',
            message: 'role-changed should be sent to Y.js WebSocket, not voice WebSocket',
          }));
          break;

        default:
          logger.warn(`[VoiceChat] Unknown message type: ${message.type}`, {
            workspaceId,
            userId,
            receivedType: message.type,
            fullMessage: message,
          });
      }
    } catch (error) {
      logger.error(`[VoiceChat] Error handling message from user ${userId}`, {
        workspaceId,
        userId,
        error: error.message,
        stack: error.stack,
      });
    }
  });

  // 연결 종료 핸들러
  conn.on('close', () => {
    logger.info(`[VoiceChat] Connection closed for workspace ${workspaceId}, user ${userId}`);
    signalingManager.leaveVoice(workspaceId, userId);
  });

  // 에러 핸들러
  conn.on('error', (error) => {
    logger.error(`[VoiceChat] WebSocket error for user ${userId}:`, error.message);
  });
}

/**
 * ============================================
 * Y.js 동기화 WebSocket 연결 핸들러
 * ============================================
 */
function handleYjsConnection(conn, req, url) {
  // workspace ID 추출 (헤더 우선, 쿼리 파라미터 fallback)
  // Gateway를 통해 들어오면 X-Workspace-ID 헤더로 전달됨
  const t0 = Date.now();

  const urlStr = req.url;
  const workspaceId = req.headers['x-workspace-id'] || url.searchParams.get('workspace');

  // user ID 추출 (Gateway의 JWT 검증 결과) - Number로 변환
  const userIdStr = req.headers['x-user-id'];
  const userId = userIdStr ? Number(userIdStr) : null;

  const t1 = Date.now();

  // workspace ID가 없으면 연결 거부
  if (!workspaceId) {
    logger.warn('Connection rejected: missing workspace parameter');
    conn.close(1008, 'Missing workspace parameter');  // WebSocket 연결 종료 (오류 코드 1008)
    return;
  }

  logger.info(`New Y.js connection to workspace ${workspaceId}`, {
    userId: userId || 'anonymous',
    hasUserId: userId !== null,
    source: req.headers['x-workspace-id'] ? 'gateway-header' : 'query-param',
    userIdSource: userIdStr ? (req.headers['x-user-id'] ? 'gateway-header' : 'query-param') : 'none',
  });

  // userId가 있으면 연결 추적 Map에 저장
  if (userId !== null) {
    logger.info(`[YJS] Registering user connection for role-change events`, {
      workspaceId,
      userId,
    });
    addUserConnection(workspaceId, userId, conn);
  } else {
    logger.warn(`[YJS] User connected without userId - role-change events will not work for this connection`, {
      workspaceId,
    });
  }

  // 해당 워크스페이스의 Y.Doc 가져오기 또는 생성
  // Y.Doc: 실제 마인드맵 데이터를 저장하는 CRDT 문서
  // 클라이언트가 이미 HTTP로 초기 데이터를 로드한 상태에서 연결함
  const ydoc = ydocManager.getDoc(workspaceId);


  logger.info('[YJS] Using Y.Doc from manager', {
      workspaceId,
      guid: ydoc.guid,
  });

  // 해당 워크스페이스의 Awareness 가져오기 또는 생성
  // Awareness: 커서 위치, 사용자 정보 등 임시 상태 공유
  const awareness = awarenessManager.getAwareness(workspaceId, ydoc);

  const originalSend = conn.send;

  conn.send = function patchedSend(data, ...args) {
      try {
          const isBuffer = Buffer.isBuffer(data) || data instanceof Uint8Array;
          const isArrayBuffer = data instanceof ArrayBuffer;

          if (isBuffer || isArrayBuffer) {
              const size = isBuffer
                  ? data.length
                  : isArrayBuffer
                      ? data.byteLength
                      : undefined;

              logger.info('[YJS][OUTBOUND] Binary WS message sending', {
                  workspaceId,
                  isBuffer,
                  isArrayBuffer,
                  size,
              });

            // 원하면 hex 프리뷰도 찍기 (짧게만)
            // const buf = Buffer.isBuffer(data)
            //   ? data
            //   : Buffer.from(new Uint8Array(data as ArrayBuffer));
            // logger.debug('[YJS][OUTBOUND] hexPreview', buf.toString('hex').slice(0, 80));
          } else if (typeof data === 'string') {
              // 이건 우리가 보내는 JSON들 (sendToWorkspace / sendToUser 등)
              logger.debug('[WS][OUTBOUND_JSON]', {
                  workspaceId,
                  size: data.length,
                  preview: data.slice(0, 120),
              });
          }
      } catch (e) {
          logger.error('[WS][OUTBOUND_LOG_ERROR]', {
              workspaceId,
              error: e.message,
          });
      }

      // 실제 전송
      return originalSend.call(this, data, ...args);
  };

  const t2 = Date.now();

  logger.info(`[YJS] Setting up Y.js sync for workspace=${workspaceId}`);

  // Y.js WebSocket 연결 설정 (y-websocket 라이브러리 유틸 사용)
  // 이 함수가 Y.js 프로토콜을 처리해줌 (동기화, 업데이트 전파 등)
  // awareness를 주입하면 클라이언트 간 커서/채팅 자동 동기화됨
  setupWSConnection(conn, req, {
      docName: `workspace:${workspaceId}`,
      gc: process.env.YDOC_GC_ENABLED === 'true',
  }, ydoc, awareness);



  // 커스텀 메시지 핸들러
  conn.on('message', (msg) => {
      const isBuffer = Buffer.isBuffer(msg);
      const isArrayBuffer = msg instanceof ArrayBuffer;
      logger.info('[YJS][RAW] WS message received', {
          workspaceId,
          isBuffer,
          isArrayBuffer,
          type: typeof msg,
          size: isBuffer
              ? msg.length
              : isArrayBuffer
                  ? msg.byteLength
                  : undefined,
      });

      // 1) 바이너리면 → Yjs sync 메시지라고 보고, 그냥 통과 (우리는 관여 X)
      if (isBuffer) {
          // setupWSConnection 쪽 리스너가 따로 처리하니까 여기선 손 안댐
          return;
      }

      // 2) 문자열이면 → 커스텀 JSON 메시지로 시도
      let msgString;
      try {
          msgString = msg.toString();
      } catch (e) {
          return;
      }

      try {
          const data = JSON.parse(msgString);

          logger.info(`[YJS] Custom JSON message received`, {
              workspaceId,
              userId: userId || 'anonymous',
              type: data.type,
              fullData: data,
          });

          switch (data.type) {
              case 'role-changed':
                  logger.info(`[YJS] Routing to handleRoleChanged`, {
                      workspaceId,
                      userId,
                      targetUserId: data.targetUserId,
                  });
                  handleRoleChanged(workspaceId, userId, data);
                  break;

              default:
                  logger.warn(`[YJS] Unknown custom message type: ${data.type}`, {
                      workspaceId,
                      userId: userId || 'anonymous',
                      availableTypes: ['role-changed'],
                      receivedData: data,
                  });
          }
      } catch (error) {
          // JSON 파싱 실패 → Yjs 바이너리였던 거면 이미 위에서 걸렸음
          return;
      }
  });

  const t3 = Date.now();

  logger.info(`[PROFILE][YJS] workspace=${workspaceId} timings(ms)`, {
      parseUrl: t1 - t0,
      docAndAwareness: t2 - t1,
      setupWS: t3 - t2,
      total: t3 - t0,
  });

  // 각 연결에 고유 ID 부여 (로깅용)
  const connectionId = Math.random().toString(36).substr(2, 9);

  /**
   * 연결 종료 이벤트 핸들러
   * 사용자가 브라우저를 닫거나 네트워크가 끊겼을 때 실행
   */
  conn.on('close', () => {
    logger.info(`[YJS] Connection closed for workspace ${workspaceId}`, {
      connectionId,
      userId: userId || 'anonymous',
      hasUserId: userId !== null,
    });

    // userId가 있으면 연결 추적 Map에서 제거
    if (userId !== null) {
      logger.info(`[YJS] Removing user from connections map`, {
        workspaceId,
        userId,
      });
      removeUserConnection(workspaceId, userId);
    }

    // 현재 워크스페이스 통계 확인
    const stats = ydocManager.getStats();
    const workspace = stats.workspaces.find(w => w.workspaceId === workspaceId);

    // 아직 Kafka로 전송되지 않은 변경사항이 있으면 즉시 전송
    // (사용자가 나갈 때 변경사항이 손실되지 않도록)
    if (workspace && workspace.pendingChanges > 0) {
      logger.info(`Flushing pending changes for workspace ${workspaceId} on disconnect`);
      kafkaProducer.sendImmediately(workspaceId);
    }

    // 메모리 누수 방지: 해당 workspace에 연결된 유저가 0명이면 메모리 정리
    // 1차 기준: workspaceConnections(Map)에 남은 유저 수
   const users = workspaceConnections.get(workspaceId);
    const remainingUsers = users ? users.size : 0;

    if (remainingUsers === 0) {
        // 참고용으로 awareness 상태도 같이 로깅 (꼬였는지 디버깅용)
        const awarenessClients = awarenessManager.getConnectedClients(workspaceId);

        logger.info(
            `No users left in workspace ${workspaceId}, cleaning up memory (connections=${remainingUsers}, awarenessStates=${awarenessClients.length})`
        );

        // Y.Doc 및 Awareness 인스턴스 삭제 (메모리 해제)
        ydocManager.destroyDoc(workspaceId);
        awarenessManager.destroyAwareness(workspaceId);

        logger.info(`Memory cleanup completed for workspace ${workspaceId}`);
    } else {
        // 아직 접속해 있는 유저가 있으므로 정리하지 않음
        logger.info(
            `Workspace ${workspaceId} still has ${remainingUsers} connected user(s)`
        );
    }
    });

  /**
   * WebSocket 에러 핸들러
   * 네트워크 오류, 프로토콜 오류 등 발생 시 실행
   */
  conn.on('error', (error) => {
    logger.error(`WebSocket error for workspace ${workspaceId}`, {
      error: error.message,
      connectionId,
    });
  });

  // NOTE: 커스텀 메시지 핸들러 제거됨
  // Yjs의 setupWSConnection이 awareness를 주입받아서 자동으로 처리하므로
  // 클라이언트의 awareness.setLocalStateField() 호출이 자동으로 동기화됨
  // 서버에서는 awareness.on('change') 이벤트로 변경사항을 감지할 수 있음 (awareness.js 참고)
}

/**
 * ============================================
 * 서버 초기화 및 시작
 * ============================================
 *
 *
 * 실행 순서:
 * 1. Kafka producer 초기화
 * 2. Kafka consumer 초기화 및 시작
 * 3. 배치 전송 스케줄러 시작 (5초마다)
 * 4. HTTP/WebSocket 서버 시작
 * 5. Graceful shutdown 핸들러 등록
 */
async function startServer() {
  try {
    // 1. Kafka producer 초기화 (환경변수에 따라 실제 연결 또는 stub mode)
    await kafkaProducer.initialize();

    // 2. Kafka consumer 초기화 및 시작 (AI 업데이트 수신용)
    await kafkaConsumer.initialize();

    // 초기 노드 생성 완료 이벤트 핸들러 등록
    kafkaConsumer.setInitialCreateDoneHandler(handleInitialCreateDone);

// ✅ CONTEXTUAL AI + Trend 추천 핸들러 등록 (워크스페이스 전체 브로드캐스트 버전)
    kafkaConsumer.setAiSuggestionHandler((data) => {
        const {
            workspaceId,
            targetNodeId,
            aiList,
            trendList,
        } = data;

      // 기본 검증
        if (!workspaceId || !targetNodeId || !Array.isArray(aiList)) {
            logger.warn('[AiSuggestion] Invalid suggestion payload', { data });
            return;
        }

        const workspaceIdStr = workspaceId.toString();

        const payload = {
            type: 'ai_suggestion',     // 프론트에서 이 타입으로 구분해서 쓰면 됨
            workspaceId: workspaceIdStr,
            targetNodeId,
            aiList,                          // List<AiSuggestionNode>
            trendList: Array.isArray(trendList) ? trendList : [],  // List<TrendItem>
        };

      // 🔥 워크스페이스 전체 브로드캐스트
        const sentCount = sendToWorkspace(workspaceIdStr, payload);

        logger.info('[AiSuggestion] Broadcasted AI+Trend suggestions', {
            workspaceId: workspaceIdStr,
            targetNodeId,
            aiCount: aiList.length,
            trendCount: payload.trendList.length,
            sentCount,
        });
    });

    kafkaConsumer.setRestructureHandler((data) => {
        const { workspaceId, nodes, eventType } = data;

        if (!workspaceId) {
            logger.warn('Invalid restructure message: missing workspaceId', { data });
            return;
        }

        const workspaceIdStr = workspaceId.toString();

        // 🔹 Y.Doc 가져오기 (있을 때만 반영)
        const ydoc = ydocManager.docs.get(workspaceIdStr);
        const hasYDoc = !!ydoc;
        const metaMap = hasYDoc ? ydoc.getMap('meta') : null;
        const nodesMap = hasYDoc ? ydoc.getMap('mindmap:nodes') : null;

        /** 1) LOCK **/
        if (eventType === 'LOCK') {
            if (hasYDoc) {
                // 🔥 LOCK도 origin='db-sync'로: Kafka 무시
                ydoc.transact(() => {
                    metaMap.set('locked', true);
                }, 'db-sync');
            }

            const payload = {
                type: 'restructure_lock',
                workspaceId: workspaceIdStr,
            };

            const sentCount = sendToWorkspace(workspaceIdStr, payload);

            logger.info('[Restructure] LOCK broadcasted via WebSocket', {
                workspaceId: workspaceIdStr,
                sentCount,
            });

            return;
        }

        /** 2) APPLY **/
        if (eventType === 'APPLY') {
            if (!Array.isArray(nodes)) {
                logger.warn('APPLY event without nodes array', { data });
                return;
            }

            logger.info('Received restructure APPLY from Kafka', {
                workspaceId,
                nodeCount: nodes.length,
            });

            let success = true;

            if (hasYDoc) {
                try {
                    /**
                     * 🔥 핵심: origin='db-sync'
                     * - observer에서 Kafka로 절대 전송되지 않도록 함
                     * - 기존 노드 clear + 새 노드 전체 세팅
                     */
                    ydoc.transact(() => {
                        nodesMap.clear();

                        for (const node of nodes) {
                            nodesMap.set(String(node.nodeId), {
                                nodeId: node.nodeId,
                                parentId: node.parentId ?? null,
                                keyword: node.keyword,
                                memo: node.memo,
                                type: node.type || 'text',
                                color: node.color,
                                x: node.x ?? null,
                                y: node.y ?? null,
                            });
                        }

                        // 🔓 잠금 해제
                        metaMap.set('locked', false);
                    }, 'db-sync');

                    logger.info(
                        `[Restructure] Workspace ${workspaceId} Y.Doc updated with ${nodes.length} nodes`,
                    );
                } catch (error) {
                    success = false;
                    logger.error(
                        `[Restructure] Failed to update Y.Doc during APPLY for workspace ${workspaceId}`,
                        { error: error.message },
                    );
                }
            } else {
                logger.warn(
                    `[Restructure] APPLY received but Y.Doc not loaded for workspace ${workspaceId}`,
                );
            }

            if (!success) {
                const failPayload = {
                    type: 'restructure_failed',
                    workspaceId: workspaceIdStr,
                };

                const sentCount = sendToWorkspace(workspaceIdStr, failPayload);

                logger.warn('[Restructure] APPLY failed, broadcasted FAIL', {
                    workspaceId: workspaceIdStr,
                    sentCount,
                });

                return;
            }

            // 🔹 프론트에 "정리 완료" 알림
            const payload = {
                type: 'restructure_apply',
                workspaceId: workspaceIdStr,
                nodes,
            };

            const sentCount = sendToWorkspace(workspaceIdStr, payload);

            logger.info(
                `[Restructure] APPLY broadcasted via WebSocket (unlock) workspace=${workspaceIdStr}`,
                { nodeCount: nodes.length, sentCount },
            );

            return;
        }

        /** 3) 기타 타입 **/
        logger.warn('Unknown restructure eventType', { eventType, data });
    });





    await kafkaConsumer.start();

    // 3. 배치 전송 스케줄러 시작 (5초마다 자동으로 변경사항 전송)
    kafkaProducer.startBatchScheduler();

    // 4. HTTP/WebSocket 서버 시작
    server.listen(PORT, () => {
      logger.info(`🚀 Mindmap WebSocket Server running on port ${PORT}`);
      logger.info(`Y.js sync endpoint: ws://localhost:${PORT}/mindmap/ws?workspace=<workspace_id>`);
      logger.info(`Voice chat endpoint: ws://localhost:${PORT}/mindmap/voice?workspace=<workspace_id>&userId=<user_id>`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Stats: http://localhost:${PORT}/stats`);
      logger.info('');
      logger.info('Environment:');
      logger.info(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  - LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
      logger.info(`  - YDOC_GC_ENABLED: ${process.env.YDOC_GC_ENABLED || 'false'}`);
      logger.info(`  - Kafka: ${kafkaProducer.isEnabled ? 'enabled' : 'stub mode'}`);
    });

    /**
     * ============================================
     * Graceful Shutdown 핸들러
     * ============================================
     *
     * 서버 종료 시 안전하게 종료하기 위한 처리
     * SIGTERM, SIGINT 시그널 수신 시 실행 (Ctrl+C, Docker stop 등)
     *
     * 종료 순서:
     * 1. 남은 모든 변경사항을 Kafka로 전송 (데이터 손실 방지)
     * 2. Kafka 연결 종료
     * 3. MongoDB 연결 종료
     * 4. HTTP/WebSocket 서버 종료
     * 5. 프로세스 종료
     */
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');

      // 1. 모든 워크스페이스의 대기중인 변경사항 즉시 전송
      const workspaces = ydocManager.getWorkspacesWithChanges();
      for (const workspaceId of workspaces) {
        await kafkaProducer.sendImmediately(workspaceId);
      }

      // 2. 음성 채팅 방 정리
      signalingManager.cleanup();

      // 3. Kafka consumer 연결 종료
      await kafkaConsumer.disconnect();

      // 4. Kafka producer 연결 종료
      await kafkaProducer.disconnect();

      // 5. HTTP/WebSocket 서버 종료
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);  // 정상 종료
      });

      // 10초 안에 종료되지 않으면 강제 종료 (무한 대기 방지)
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);  // 강제 종료 (에러 코드)
      }, 10000);
    };

    // SIGTERM 시그널 핸들러 등록 (Docker, Kubernetes에서 컨테이너 종료 시)
    process.on('SIGTERM', shutdown);

    // SIGINT 시그널 핸들러 등록 (Ctrl+C로 종료 시)
    process.on('SIGINT', shutdown);

  } catch (error) {
    // 서버 시작 실패 시 에러 로그 출력 및 프로세스 종료
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// ===== 서버 시작 =====
startServer();

// Export functions for external modules (e.g., Kafka consumer)
export { handleInitialCreateDone };
