/**
 * WebRTC Signaling Manager - 음성 채팅 시그널링 관리자
 *
 * 역할:
 * - WebRTC 피어 간 연결을 위한 시그널링 서버
 * - offer/answer/ice candidate를 중계
 * - 워크스페이스당 최대 6명 제한
 * - 음소거 상태 브로드캐스트
 *
 * 아키텍처:
 * - Mesh topology (P2P): 서버는 시그널만 중계, 실제 오디오는 클라이언트 간 직접 전송
 * - 각 워크스페이스는 독립적인 VoiceRoom 인스턴스 보유
 */

import { logger } from '../utils/logger.js';
import { gptSessionManager } from '../gpt/gpt-session-manager.js';
import { meetingMinutesManager } from '../meeting/meeting-minutes-manager.js';

const MAX_PARTICIPANTS = 6;

/**
 * VoiceRoom - 워크스페이스별 음성 채팅 방
 */
class VoiceRoom {
  constructor(workspaceId) {
    this.workspaceId = workspaceId;
    // userId → { conn: WebSocket, userId: string, voiceState: { muted: boolean, speaking: boolean } }
    this.participants = new Map();
    // 회의록 생성용 STT 수집 배열
    this.transcripts = [];
    logger.info(`[SignalingManager] VoiceRoom created for workspace ${workspaceId}`);
  }

  /**
   * 참가자 추가
   */
  addParticipant(userId, conn) {
    if (this.participants.size >= MAX_PARTICIPANTS) {
      logger.warn(`[SignalingManager] Workspace ${this.workspaceId} is full (${MAX_PARTICIPANTS} max)`);
      return false;
    }

    this.participants.set(userId, {
      conn,
      userId,
      voiceState: {
        muted: true,  // 기본값: 음소거
        speaking: false,
      },
    });

    logger.info(`[SignalingManager] User ${userId} joined voice room (workspace: ${this.workspaceId}, total: ${this.participants.size})`);
    return true;
  }

  /**
   * 참가자 제거
   */
  removeParticipant(userId) {
    const removed = this.participants.delete(userId);
    if (removed) {
      logger.info(`[SignalingManager] User ${userId} left voice room (workspace: ${this.workspaceId}, remaining: ${this.participants.size})`);
    }
    return removed;
  }

  /**
   * 특정 사용자에게 메시지 전송
   */
  sendToUser(userId, message) {
    const participant = this.participants.get(userId);
    if (participant && participant.conn.readyState === 1) {  // WebSocket.OPEN === 1
      try {
        participant.conn.send(JSON.stringify(message));
        logger.debug(`[SignalingManager] Message sent to user ${userId}:`, message.type);
      } catch (error) {
        logger.error(`[SignalingManager] Failed to send message to user ${userId}:`, error.message);
      }
    } else {
      logger.warn(`[SignalingManager] User ${userId} not found or connection closed`);
    }
  }

  /**
   * 특정 사용자를 제외한 모든 참가자에게 브로드캐스트
   */
  broadcast(message, excludeUserId = null) {
    let sentCount = 0;
    for (const [userId, participant] of this.participants.entries()) {
      if (userId !== excludeUserId && participant.conn.readyState === 1) {
        try {
          participant.conn.send(JSON.stringify(message));
          sentCount++;
        } catch (error) {
          logger.error(`[SignalingManager] Failed to broadcast to user ${userId}:`, error.message);
        }
      }
    }
    logger.debug(`[SignalingManager] Broadcast sent to ${sentCount} participant(s) in workspace ${this.workspaceId}:`, message.type);
  }

  /**
   * 현재 참가자 목록 반환
   */
  getParticipants() {
    return Array.from(this.participants.values()).map(p => ({
      userId: p.userId,
      voiceState: p.voiceState,
    }));
  }

  /**
   * 음성 상태 업데이트
   */
  updateVoiceState(userId, voiceState) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.voiceState = { ...participant.voiceState, ...voiceState };
      logger.debug(`[SignalingManager] User ${userId} voice state updated:`, participant.voiceState);
      return true;
    }
    return false;
  }

  /**
   * 방이 비어있는지 확인
   */
  isEmpty() {
    return this.participants.size === 0;
  }

  /**
   * 방이 가득 찼는지 확인
   */
  isFull() {
    return this.participants.size >= MAX_PARTICIPANTS;
  }

  /**
   * 음성 채팅 중 STT 추가 (회의록용)
   */
  addTranscript(userId, userName, text, timestamp) {
    this.transcripts.push({ userId, userName, text, timestamp });
    logger.debug(`[SignalingManager] Transcript added to room ${this.workspaceId}`, {
      userId,
      userName,
      textLength: text.length,
      totalTranscripts: this.transcripts.length,
    });
  }

  /**
   * 수집된 transcript 가져오기
   */
  getTranscripts() {
    return this.transcripts;
  }

  /**
   * transcript 정리 (메모리 관리)
   */
  clearTranscripts() {
    const count = this.transcripts.length;
    this.transcripts = [];
    logger.info(`[SignalingManager] Transcripts cleared for room ${this.workspaceId}`, {
      clearedCount: count,
    });
  }
}

/**
 * SignalingManager - 전체 시그널링 관리
 */
class SignalingManager {
  constructor() {
    // workspaceId → VoiceRoom
    this.voiceRooms = new Map();
    logger.info('[SignalingManager] SignalingManager initialized');
  }

  /**
   * 음성 채팅 방에 참가
   */
  joinVoice(workspaceId, userId, conn) {
    logger.debug(`[SignalingManager] joinVoice called: workspace=${workspaceId}, user=${userId}`);

    // 방이 없으면 생성
    if (!this.voiceRooms.has(workspaceId)) {
      this.voiceRooms.set(workspaceId, new VoiceRoom(workspaceId));
    }

    const room = this.voiceRooms.get(workspaceId);

    // 인원 제한 체크
    if (room.isFull()) {
      logger.warn(`[SignalingManager] Workspace ${workspaceId} is full, rejecting user ${userId}`);
      this.sendMessage(conn, {
        type: 'voice-full',
        workspaceId,
        maxParticipants: MAX_PARTICIPANTS,
      });
      return false;
    }

    // 참가자 추가
    const added = room.addParticipant(userId, conn);
    if (!added) {
      return false;
    }

    // 1. 현재 참가자 목록을 새로운 사용자에게 전송
    const participants = room.getParticipants();
    this.sendMessage(conn, {
      type: 'participants',
      workspaceId,
      participants,
    });

    // 2. 다른 참가자들에게 새로운 사용자 참가 알림
    room.broadcast({
      type: 'voice-joined',
      workspaceId,
      userId,
    }, userId);

    logger.info(`[SignalingManager] User ${userId} successfully joined workspace ${workspaceId}`);
    return true;
  }

  /**
   * 음성 채팅 방에서 퇴장
   */
  leaveVoice(workspaceId, userId) {
    logger.debug(`[SignalingManager] leaveVoice called: workspace=${workspaceId}, user=${userId}`);

    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    // 참가자 제거
    const removed = room.removeParticipant(userId);
    if (!removed) {
      logger.warn(`[SignalingManager] User ${userId} not found in workspace ${workspaceId}`);
      return;
    }

    // 다른 참가자들에게 퇴장 알림
    room.broadcast({
      type: 'voice-left',
      workspaceId,
      userId,
    });

    // 방이 비었으면 메모리 정리
    if (room.isEmpty()) {
      this.voiceRooms.delete(workspaceId);
      logger.info(`[SignalingManager] VoiceRoom destroyed for workspace ${workspaceId} (no participants left)`);
    }
  }

  /**
   * WebRTC Offer 처리 (Caller → Callee)
   */
  handleOffer(workspaceId, fromUserId, toUserId, offer) {
    logger.debug(`[SignalingManager] Relaying offer: ${fromUserId} → ${toUserId} (workspace: ${workspaceId})`);
    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    room.sendToUser(toUserId, {
      type: 'offer',
      workspaceId,
      fromUserId,
      offer,
    });
  }

  /**
   * WebRTC Answer 처리 (Callee → Caller)
   */
  handleAnswer(workspaceId, fromUserId, toUserId, answer) {
    logger.debug(`[SignalingManager] Relaying answer: ${fromUserId} → ${toUserId} (workspace: ${workspaceId})`);
    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    room.sendToUser(toUserId, {
      type: 'answer',
      workspaceId,
      fromUserId,
      answer,
    });
  }

  /**
   * ICE Candidate 처리 (양방향)
   */
  handleIceCandidate(workspaceId, fromUserId, toUserId, candidate) {
    logger.debug(`[SignalingManager] Relaying ICE candidate: ${fromUserId} → ${toUserId} (workspace: ${workspaceId})`);
    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    room.sendToUser(toUserId, {
      type: 'ice',
      workspaceId,
      fromUserId,
      candidate,
    });
  }

  /**
   * 음성 상태 변경 처리 (음소거, 발화 상태 등)
   */
  handleVoiceState(workspaceId, userId, voiceState) {
    logger.debug(`[SignalingManager] Voice state update: user=${userId}, workspace=${workspaceId}`, voiceState);
    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    // 상태 업데이트
    const updated = room.updateVoiceState(userId, voiceState);
    if (!updated) {
      logger.warn(`[SignalingManager] Failed to update voice state for user ${userId}`);
      return;
    }

    // 다른 참가자들에게 상태 변경 브로드캐스트
    room.broadcast({
      type: 'voice-state',
      workspaceId,
      userId,
      voiceState,
    }, userId);

    logger.info(`[SignalingManager] Voice state broadcasted for user ${userId}:`, voiceState);
  }

  /**
   * GPT 녹음 시작
   */
  handleGptStart(workspaceId, userId, conn) {
    logger.info(`[SignalingManager] GPT recording started by user ${userId} in workspace ${workspaceId}`);

    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    // GPT 세션 시작
    gptSessionManager.startSession(workspaceId);
    gptSessionManager.addConnection(workspaceId, conn);

    // 모든 참가자에게 알림
    room.broadcast({
      type: 'gpt-recording-started',
      workspaceId,
      startedBy: userId,
      timestamp: Date.now(),
    });
  }

  /**
   * GPT Transcript 처리
   */
  handleGptTranscript(workspaceId, userId, userName, text, timestamp) {
    logger.debug(`[SignalingManager] GPT transcript from ${userName} in workspace ${workspaceId}`);

    gptSessionManager.addTranscript(workspaceId, userId, userName, text, timestamp);
  }

  /**
   * GPT 녹음 종료
   */
  handleGptStop(workspaceId, userId) {
    logger.info(`[SignalingManager] GPT recording stopped by user ${userId} in workspace ${workspaceId}`);

    gptSessionManager.stopSession(workspaceId);
  }

  /**
   * 음성 채팅 중 STT 수집 (회의록용)
   */
  handleVoiceTranscript(workspaceId, userId, userName, text, timestamp) {
    logger.debug(`[SignalingManager] Voice transcript from ${userName} in workspace ${workspaceId}`);

    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      return;
    }

    // VoiceRoom에 transcript 추가
    room.addTranscript(userId, userName, text, timestamp);
  }

  /**
   * 회의록 생성 요청 처리
   */
  async handleGenerateMeetingMinutes(workspaceId, requesterId, conn) {
    logger.info(`[SignalingManager] Meeting minutes generation requested by user ${requesterId} in workspace ${workspaceId}`);

    const room = this.voiceRooms.get(workspaceId);
    if (!room) {
      logger.warn(`[SignalingManager] Room not found for workspace ${workspaceId}`);
      this.sendMessage(conn, {
        type: 'meeting-minutes-error',
        error: '음성 채팅 방을 찾을 수 없습니다.',
        timestamp: Date.now(),
      });
      return;
    }

    const transcripts = room.getTranscripts();
    if (transcripts.length === 0) {
      logger.warn(`[SignalingManager] No transcripts available for workspace ${workspaceId}`);
      this.sendMessage(conn, {
        type: 'meeting-minutes-error',
        error: '회의록을 생성할 대화 내용이 없습니다.',
        timestamp: Date.now(),
      });
      return;
    }

    logger.info(`[SignalingManager] Generating meeting minutes`, {
      workspaceId,
      transcriptCount: transcripts.length,
      requesterId,
    });

    // MeetingMinutesManager에게 회의록 생성 요청
    await meetingMinutesManager.generate(workspaceId, transcripts, conn);

    logger.info(`[SignalingManager] Meeting minutes generation completed for workspace ${workspaceId}`);
  }

  /**
   * WebSocket으로 메시지 전송
   */
  sendMessage(conn, message) {
    if (conn.readyState === 1) {  // WebSocket.OPEN === 1
      try {
        conn.send(JSON.stringify(message));
        logger.debug(`[SignalingManager] Message sent:`, message.type);
      } catch (error) {
        logger.error(`[SignalingManager] Failed to send message:`, error.message);
      }
    }
  }

  /**
   * 통계 정보 반환
   */
  getStats() {
    const stats = {
      totalRooms: this.voiceRooms.size,
      rooms: [],
    };

    for (const [workspaceId, room] of this.voiceRooms.entries()) {
      stats.rooms.push({
        workspaceId,
        participants: room.participants.size,
        isFull: room.isFull(),
        participantList: room.getParticipants(),
      });
    }

    return stats;
  }

  /**
   * 모든 방 정리 (서버 종료 시)
   */
  cleanup() {
    logger.info(`[SignalingManager] Cleaning up all voice rooms (${this.voiceRooms.size} rooms)`);

    for (const [workspaceId, room] of this.voiceRooms.entries()) {
      // 모든 참가자에게 연결 종료 알림
      room.broadcast({
        type: 'server-shutdown',
        message: 'Server is shutting down',
      });

      logger.info(`[SignalingManager] Voice room cleaned up for workspace ${workspaceId}`);
    }

    this.voiceRooms.clear();
    logger.info('[SignalingManager] All voice rooms cleaned up');
  }
}

// Export singleton instance
export const signalingManager = new SignalingManager();
