"""
Kafka Consumer/Producer 핸들러
- ai.analysis.request 토픽에서 분석 요청 수신
- ai.analysis.result 토픽으로 분석 결과 전송
"""
import json
import logging
import os
import threading
from typing import Dict, Any, Optional
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class KafkaHandler:
    """Kafka Consumer/Producer 핸들러"""

    def __init__(self, topics: Optional[Dict[str, str]] = None):
        """
        초기화

        Args:
            topics: 토픽 설정 딕셔너리 (None이면 기본 analysis 토픽 사용)
                예: {"request": "ai.analysis.request", "response": "ai.analysis.result"}
        """
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')

        if topics:
            self.request_topic = topics.get('request')
            self.response_topic = topics.get('response')
        else:
            self.request_topic = os.getenv('KAFKA_REQUEST_TOPIC', 'ai.analysis.request')
            self.response_topic = os.getenv('KAFKA_RESPONSE_TOPIC', 'ai.analysis.result')

        self.group_id = os.getenv('KAFKA_GROUP_ID', 'ai-analysis-consumer')

        self.consumer: Optional[KafkaConsumer] = None
        self.producer: Optional[KafkaProducer] = None
        self.running = False
        self.consumer_thread: Optional[threading.Thread] = None

        # 분석 콜백 함수 (외부에서 설정)
        self.analysis_callback = None

        logger.info(f"Kafka Handler 초기화: {self.bootstrap_servers}")
        logger.info(f"Request Topic: {self.request_topic}")
        logger.info(f"Response Topic: {self.response_topic}")

    def connect_producer(self):
        """Kafka Producer 연결"""
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
                acks='all',  # 모든 replica가 메시지를 받을 때까지 대기
                retries=3,
                max_in_flight_requests_per_connection=1
            )
            logger.info(f"✅ Kafka Producer 연결 성공: {self.bootstrap_servers}")
            return True
        except Exception as e:
            logger.error(f"❌ Kafka Producer 연결 실패: {e}")
            return False

    def connect_consumer(self):
        """Kafka Consumer 연결"""
        try:
            self.consumer = KafkaConsumer(
                self.request_topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',  # 최신 메시지부터 읽기
                enable_auto_commit=True,
                consumer_timeout_ms=1000  # 1초마다 타임아웃 (종료 체크용)
            )
            logger.info(f"✅ Kafka Consumer 연결 성공: {self.request_topic}")
            return True
        except Exception as e:
            logger.error(f"❌ Kafka Consumer 연결 실패: {e}")
            return False

    def set_analysis_callback(self, callback):
        """
        분석 콜백 함수 설정

        Args:
            callback: 분석 요청을 처리할 함수
                      시그니처: callback(request_data: Dict) -> Dict
        """
        self.analysis_callback = callback
        logger.info("분석 콜백 함수 설정 완료")

    def send_result(self, result: Dict[str, Any]) -> bool:
        """
        분석 결과를 Kafka로 전송

        Args:
            result: 분석 결과 딕셔너리

        Returns:
            전송 성공 여부
        """
        if not self.producer:
            logger.error("Producer가 초기화되지 않았습니다.")
            return False

        try:
            future = self.producer.send(self.response_topic, result)
            # 전송 완료 대기 (최대 10초)
            record_metadata = future.get(timeout=10)

            logger.info(f"✅ Kafka 결과 전송 완료: topic={record_metadata.topic}, "
                       f"partition={record_metadata.partition}, offset={record_metadata.offset}")
            return True

        except KafkaError as e:
            logger.error(f"❌ Kafka 전송 실패: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ 예상치 못한 오류: {e}")
            return False

    def _process_message(self, message_value: Dict[str, Any]):
        """
        Kafka 메시지 처리

        Args:
            message_value: Kafka 메시지 내용
        """
        try:
            # workspaceId를 int로 변환 (Java long과 호환)
            raw_workspace_id = message_value.get('workspaceId')
            if raw_workspace_id is None:
                raise ValueError("workspaceId is required")

            try:
                workspace_id = int(raw_workspace_id)
            except (ValueError, TypeError) as e:
                raise ValueError(f"workspaceId must be a valid integer, got: {raw_workspace_id}")

            node_id = message_value.get('nodeId')
            analysis_type = message_value.get('analysisType')

            logger.info(f"📨 Kafka 메시지 수신: workspaceId={workspace_id}, "
                       f"nodeId={node_id}, type={analysis_type}")

            if not self.analysis_callback:
                logger.error("분석 콜백 함수가 설정되지 않았습니다.")
                # 실패 응답 전송
                error_result = {
                    "workspaceId": workspace_id,
                    "status": "FAILED",
                    "error": "Analysis callback not configured"
                }
                self.send_result(error_result)
                return

            # 분석 수행
            result = self.analysis_callback(message_value)

            # 결과 전송
            if result:
                self.send_result(result)
            else:
                # 실패 응답 전송
                error_result = {
                    "workspaceId": workspace_id,
                    "status": "FAILED",
                    "error": "Analysis failed"
                }
                self.send_result(error_result)

        except Exception as e:
            logger.error(f"❌ 메시지 처리 중 오류: {e}", exc_info=True)
            # 실패 응답 전송
            error_result = {
                "workspaceId": message_value.get('workspaceId'),
                "status": "FAILED",
                "error": str(e)
            }
            self.send_result(error_result)

    def _consume_loop(self):
        """Consumer 메인 루프"""
        logger.info("🔄 Kafka Consumer 시작")

        while self.running:
            try:
                # 메시지 polling (timeout 1초)
                for message in self.consumer:
                    if not self.running:
                        break

                    logger.debug(f"메시지 수신: offset={message.offset}, "
                                f"partition={message.partition}")

                    # 메시지 처리
                    self._process_message(message.value)

            except Exception as e:
                if self.running:
                    logger.error(f"❌ Consumer 루프 오류: {e}", exc_info=True)
                    # 오류 발생 시 잠시 대기 후 재시도
                    import time
                    time.sleep(5)

        logger.info("🛑 Kafka Consumer 종료")

    def start(self):
        """Kafka Consumer 백그라운드 스레드 시작"""
        if self.running:
            logger.warning("Kafka Consumer가 이미 실행 중입니다.")
            return False

        # Producer 연결
        if not self.connect_producer():
            return False

        # Consumer 연결
        if not self.connect_consumer():
            return False

        # Consumer 스레드 시작
        self.running = True
        self.consumer_thread = threading.Thread(target=self._consume_loop, daemon=True)
        self.consumer_thread.start()

        logger.info("✅ Kafka Handler 시작 완료")
        return True

    def stop(self):
        """Kafka Consumer/Producer 종료"""
        logger.info("Kafka Handler 종료 중...")

        self.running = False

        # Consumer 종료
        if self.consumer:
            try:
                self.consumer.close()
                logger.info("Consumer 종료 완료")
            except Exception as e:
                logger.error(f"Consumer 종료 오류: {e}")

        # Producer 종료
        if self.producer:
            try:
                self.producer.flush()
                self.producer.close()
                logger.info("Producer 종료 완료")
            except Exception as e:
                logger.error(f"Producer 종료 오류: {e}")

        # 스레드 종료 대기
        if self.consumer_thread and self.consumer_thread.is_alive():
            self.consumer_thread.join(timeout=10)

        logger.info("✅ Kafka Handler 종료 완료")


# 전역 인스턴스
kafka_handler = KafkaHandler()
