/**
 * Awareness Manager - 사용자 인식 관리자
 *
 * Awareness란?
 * - 다른 사용자의 실시간 상태를 공유하는 시스템
 * - 문서 내용(Y.Doc)과는 별개로, "누가 어디를 보고 있는지" 같은 임시 정보를 공유
 * - 연결이 끊기면 자동으로 사라지는 휘발성 데이터 (영구 저장 X)
 *
 * 주요 기능:
 * 1. cursor:move - 실시간 커서 위치 공유 (Google Docs처럼 다른 사용자 커서 표시)
 * 2. chat:temp - 임시 채팅 (Figma처럼 "/" 키를 누르면 채팅 입력)
 * 3. user:info - 사용자 정보 공유 (이름, 이메일, 색상 등)
 */

import { Awareness } from 'y-protocols/awareness';
import { logger } from '../utils/logger.js';

class AwarenessManager {
  constructor() {
    // 워크스페이스ID -> Awareness 인스턴스 매핑
    // 각 워크스페이스마다 독립적인 Awareness 관리
    this.awarenessInstances = new Map();
    logger.info('AwarenessManager initialized');
  }

  /**
   * 워크스페이스의 Awareness 인스턴스 가져오기 또는 생성
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {Y.Doc} ydoc - Y.js 문서 객체
   * @returns {Awareness} Awareness 인스턴스
   */
  getAwareness(workspaceId, ydoc) {
    logger.debug(`[AwarenessManager] getAwareness called for workspace ${workspaceId}`);

    if (!this.awarenessInstances.has(workspaceId)) {
      logger.info(`[AwarenessManager] Creating new Awareness for workspace ${workspaceId}`);
      const awareness = new Awareness(ydoc);  // Y.Doc과 연결된 Awareness 생성

      // Awareness 변경 감지 이벤트 리스너 등록
      // 누군가 커서를 움직이거나, 채팅을 입력하면 실행됨
      awareness.on('change', ({ added, updated, removed }) => {
        this.handleAwarenessChange(workspaceId, { added, updated, removed }, awareness);
      });

      this.awarenessInstances.set(workspaceId, awareness);
      logger.info(`[AwarenessManager] Awareness created for workspace ${workspaceId}`);
    } else {
      logger.debug(`[AwarenessManager] Returning existing Awareness for workspace ${workspaceId}`);
    }

    return this.awarenessInstances.get(workspaceId);
  }

  /**
   * Awareness 변경사항 처리 (커서 이동, 채팅, 사용자 정보 등)
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {object} changes - 변경된 클라이언트 ID 목록 {added, updated, removed}
   * @param {Awareness} awareness - Awareness 인스턴스
   */
  handleAwarenessChange(workspaceId, { added, updated, removed }, awareness) {
    logger.debug(`[AwarenessManager] Awareness change in workspace ${workspaceId}: +${added.length} ~${updated.length} -${removed.length}`);

    // 추가, 업데이트, 제거된 모든 클라이언트 ID를 하나의 배열로 합침
    const changes = [...added, ...updated, ...removed];

    changes.forEach((clientId) => {
      // 해당 클라이언트의 현재 상태 가져오기
      const clientState = awareness.getStates().get(clientId);

      if (clientState) {
        // 커서 위치가 변경된 경우 로그 출력
        if (clientState.cursor) {
          logger.debug(`[AwarenessManager] Workspace ${workspaceId} - Client ${clientId} cursor:`, {
            x: clientState.cursor.x,  // 캔버스 X 좌표
            y: clientState.cursor.y,  // 캔버스 Y 좌표
          });
        }

        // 임시 채팅 메시지가 있는 경우 로그 출력
        // 클라이언트는 'chat' 필드를 사용 (tempChat이 아님)
        if (clientState.chat) {
          logger.info(`[AwarenessManager] Workspace ${workspaceId} - Client ${clientId} chat:`, {
            isTyping: clientState.chat.isTyping,         // 입력 중 여부
            currentText: clientState.chat.currentText,   // 현재 입력 텍스트
            timestamp: clientState.chat.timestamp,       // 타임스탬프
          });
        }

        // 사용자 정보가 업데이트된 경우 로그 출력
        if (clientState.user) {
          logger.info(`[AwarenessManager] Workspace ${workspaceId} - Client ${clientId} user:`, {
            name: clientState.user.name,    // 사용자 이름
            color: clientState.user.color,  // 커서/하이라이트 색상
          });
        }
      }
    });

    // 새로 추가된 클라이언트
    if (added.length > 0) {
      logger.info(`[AwarenessManager] Workspace ${workspaceId} - ${added.length} client(s) connected`);
    }

    // 연결 해제된 클라이언트가 있으면 로그 출력
    if (removed.length > 0) {
      logger.info(`[AwarenessManager] Workspace ${workspaceId} - ${removed.length} client(s) disconnected`);
    }
  }

  // NOTE: setCursor, setTempChat, clearTempChat, setUser 메서드 제거됨
  // 클라이언트가 직접 awareness.setLocalStateField()를 호출하면
  // Yjs 프로토콜을 통해 자동으로 동기화되므로 서버에서 별도 설정 불필요
  // handleAwarenessChange()에서 변경사항을 감지하여 로깅만 수행

  /**
   * Get all connected clients in a workspace
   * @param {string|number} workspaceId
   * @returns {Array}
   */
  getConnectedClients(workspaceId) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (!awareness) return [];

    const clients = [];
    awareness.getStates().forEach((state, clientId) => {
      clients.push({
        clientId,
        user: state.user,
        cursor: state.cursor,
        chat: state.chat,  // 'tempChat'이 아닌 'chat' 사용
      });
    });

    return clients;
  }

  /**
   * Remove client from awareness
   * @param {number} clientId
   * @param {string|number} workspaceId
   */
  removeClient(clientId, workspaceId) {
    logger.debug(`[AwarenessManager] Removing client ${clientId} from workspace ${workspaceId}`);
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      awareness.setLocalState(null);
      logger.info(`[AwarenessManager] Client ${clientId} removed from workspace ${workspaceId}`);
    } else {
      logger.warn(`[AwarenessManager] Awareness not found for workspace ${workspaceId}`);
    }
  }

  /**
   * Destroy awareness instance for a workspace
   * @param {string|number} workspaceId
   */
  destroyAwareness(workspaceId) {
    logger.debug(`[AwarenessManager] Attempting to destroy Awareness for workspace ${workspaceId}`);
    if (this.awarenessInstances.has(workspaceId)) {
      const awareness = this.awarenessInstances.get(workspaceId);
      awareness.destroy();
      this.awarenessInstances.delete(workspaceId);
      logger.info(`[AwarenessManager] Destroyed Awareness for workspace ${workspaceId}`);
    } else {
      logger.debug(`[AwarenessManager] No Awareness found to destroy for workspace ${workspaceId}`);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalWorkspaces: this.awarenessInstances.size,
      workspaces: [],
    };

    for (const [workspaceId, awareness] of this.awarenessInstances.entries()) {
      stats.workspaces.push({
        workspaceId,
        connectedClients: awareness.getStates().size,
      });
    }

    return stats;
  }
}

// Export singleton instance
export const awarenessManager = new AwarenessManager();
