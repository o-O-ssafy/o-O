/**
 * Kafka Producer Service - 마인드맵 노드 변경사항을 Kafka로 전송
 *
 * 왜 Kafka를 사용하나?
 * - Y.js는 메모리에만 데이터를 저장 (서버 재시작하면 데이터 손실)
 * - Kafka로 변경사항을 전송하면, 다른 서비스(MongoDB 저장 서비스)가 받아서 DB에 영구 저장
 * - 이벤트 소싱 패턴: 모든 변경사항을 이벤트로 기록하여 히스토리 추적 가능
 *
 * 배치 전송 전략:
 * - 5초마다 자동으로 모아서 전송 (기본값)
 * - 또는 변경사항이 10개 이상 쌓이면 즉시 전송
 * - 서버 종료 시 남은 변경사항 모두 전송 (데이터 손실 방지)
 *
 * Phase 1: Stub mode (Kafka 없이 로그만 출력)
 * Phase 2: 실제 Kafka 연결 및 전송
 */

import { Kafka } from 'kafkajs';
import { logger } from '../utils/logger.js';
import { ydocManager } from '../yjs/ydoc-manager.js';

class KafkaProducerService {
  constructor() {
    this.kafka = null;          // Kafka 클라이언트 인스턴스
    this.producer = null;        // Kafka Producer 인스턴스
    this.isEnabled = false;      // Kafka 사용 여부 (환경변수로 제어)
    this.isConnected = false;    // Kafka 연결 상태

    // 배치 전송 설정
    this.batchInterval = parseInt(process.env.YDOC_PERSISTENCE_INTERVAL || '5000');  // 5초마다 배치 전송
    this.batchThreshold = 10;  // 변경사항이 10개 이상이면 즉시 전송 (큰 변경 시 빠른 저장)

    logger.info('KafkaProducerService initialized (stub mode)');
  }

  /**
   * Kafka Producer 초기화 및 연결
   * 환경변수 KAFKA_BROKERS가 설정되어 있으면 실제 Kafka에 연결
   * 없으면 stub mode로 동작 (로그만 출력)
   */
  async initialize() {
    try {
      const brokers = process.env.KAFKA_BROKERS;  // 예: "localhost:9092,localhost:9093"

      // Kafka 브로커 주소가 없으면 stub mode
      if (!brokers) {
        logger.warn('KAFKA_BROKERS not set. Running in stub mode (logs only)');
        this.isEnabled = false;
        return;
      }

      // Kafka 클라이언트 생성
      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'mindmap-websocket-service',  // 클라이언트 식별자
        brokers: brokers.split(','),  // 쉼표로 구분된 브로커 주소 배열로 변환
      });

      // Producer 인스턴스 생성
      this.producer = this.kafka.producer();

      // Kafka 브로커에 연결 시도
      await this.producer.connect();
      this.isConnected = true;
      this.isEnabled = true;

      logger.info('Kafka producer connected successfully', { brokers });
    } catch (error) {
      // 연결 실패 시 stub mode로 fallback (서비스 중단 방지)
      logger.error('Failed to initialize Kafka producer', {
        error: error.message,
        stack: error.stack,
      });
      this.isEnabled = false;
    }
  }

  /**
   * 주기적인 배치 전송 스케줄러 시작
   * 기본 5초마다 sendBatch() 실행하여 쌓인 변경사항 전송
   */
  startBatchScheduler() {
    setInterval(() => {
      this.sendBatch();  // 5초마다 배치 전송
    }, this.batchInterval);

    logger.info(`Batch scheduler started (interval: ${this.batchInterval}ms)`);
  }

  /**
   * 배치로 쌓인 변경사항들을 Kafka로 전송
   * 5초마다 스케줄러에 의해 자동 실행됨
   */
  async sendBatch() {
    // 변경사항이 있는 모든 워크스페이스 ID 가져오기
    const workspaces = ydocManager.getWorkspacesWithChanges();

    if (workspaces.length === 0) {
      return; // 전송할 변경사항 없음
    }

    // 각 워크스페이스마다 변경사항 전송
    for (const workspaceId of workspaces) {
      // pending 큐에서 변경사항 가져오고 비우기
      const changes = ydocManager.flushPendingChanges(workspaceId);

      if (changes.length === 0) continue;  // 빈 배열이면 스킵

      // Phase 1: Stub mode - Kafka 없이 로그만 출력
      if (!this.isEnabled || !this.isConnected) {
        logger.info(`[STUB] Would send ${changes.length} changes to Kafka`, {
          workspaceId,
          changes: changes.slice(0, 3), // 처음 3개만 로그에 출력 (간결성)
        });
        continue;
      }

      // Phase 2: 실제 Kafka 전송
      try {
        await this.sendToKafka(workspaceId, changes);
        logger.info(`Sent ${changes.length} changes to Kafka`, { workspaceId });
      } catch (error) {
        // 전송 실패 시 에러 로그
        logger.error('Failed to send changes to Kafka', {
          workspaceId,
          error: error.message,
        });

        // 실패한 변경사항을 다시 pending 큐에 추가 (재시도 대기)
        ydocManager.addPendingChanges(workspaceId, changes);
      }
    }
  }

  /**
   * 실제로 Kafka 토픽에 메시지 전송
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {Array} changes - 변경사항 배열 (노드 추가/수정/삭제 이벤트들)
   */
  async sendToKafka(workspaceId, changes) {
    if (!this.producer || !this.isConnected) {
      throw new Error('Kafka producer not connected');
    }

    // Kafka 토픽 이름 (환경변수 또는 기본값)
    const topic = process.env.KAFKA_TOPIC_NODE_EVENTS || 'mindmap.node.events';

    await this.producer.send({
      topic,  // 메시지를 보낼 토픽
      messages: [
        {
          key: workspaceId.toString(),  // Partition key: 같은 워크스페이스는 같은 파티션으로 (순서 보장)
          value: JSON.stringify(changes),  // 변경사항 배열을 JSON으로 직렬화
          headers: {  // 메타데이터
            'content-type': 'application/json',
            'service': 'mindmap-websocket-service',  // 어떤 서비스에서 보냈는지
            'timestamp': new Date().toISOString(),
          },
        },
      ],
    });
  }

  /**
   * 변경사항을 즉시 전송 (배치 스케줄러를 기다리지 않음)
   * 사용 시나리오:
   * 1. 변경사항이 10개 이상 쌓였을 때
   * 2. 사용자가 연결을 끊을 때 (데이터 손실 방지)
   * 3. 서버 종료 전 (graceful shutdown)
   *
   * @param {string|number} workspaceId - 워크스페이스 ID
   */
  async sendImmediately(workspaceId) {
    const changes = ydocManager.flushPendingChanges(workspaceId);

    if (changes.length === 0) return;  // 전송할 게 없으면 리턴

    // Stub mode에서는 로그만 출력
    if (!this.isEnabled || !this.isConnected) {
      logger.info(`[STUB] Would immediately send ${changes.length} changes`, {
        workspaceId,
      });
      return;
    }

    // 실제 Kafka 전송
    try {
      await this.sendToKafka(workspaceId, changes);
      logger.info(`Immediately sent ${changes.length} changes to Kafka`, {
        workspaceId,
      });
    } catch (error) {
      logger.error('Failed to immediately send changes', {
        workspaceId,
        error: error.message,
      });
      // 실패 시 다시 pending 큐에 추가
      ydocManager.addPendingChanges(workspaceId, changes);
    }
  }

  /**
   * 변경사항이 임계값을 초과하는지 확인하고, 초과하면 즉시 전송
   * 큰 변경사항이 발생했을 때 빠르게 저장하기 위함
   * @param {string|number} workspaceId - 워크스페이스 ID
   */
  checkThreshold(workspaceId) {
    const changes = ydocManager.pendingChanges.get(workspaceId) || [];

    // 변경사항이 10개 이상이면 즉시 전송 (배치를 기다리지 않음)
    if (changes.length >= this.batchThreshold) {
      logger.info(`Threshold reached for workspace ${workspaceId}, sending immediately`);
      this.sendImmediately(workspaceId);
    }
  }

  /**
   * Kafka producer 연결 종료 (graceful shutdown)
   * 서버 종료 시 호출되어 안전하게 연결을 끊음
   */
  async disconnect() {
    if (this.producer && this.isConnected) {
      await this.producer.disconnect();
      logger.info('Kafka producer disconnected');
    }
  }

  /**
   * Kafka 서비스 상태 정보 반환
   * /health, /stats 엔드포인트에서 사용
   */
  getStatus() {
    return {
      enabled: this.isEnabled,          // Kafka 사용 여부
      connected: this.isConnected,      // 연결 상태
      batchInterval: this.batchInterval,  // 배치 전송 주기 (ms)
      batchThreshold: this.batchThreshold,  // 즉시 전송 임계값
    };
  }
}

// Export singleton instance
export const kafkaProducer = new KafkaProducerService();
