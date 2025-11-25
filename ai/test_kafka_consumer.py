"""
Kafka Consumer 테스트 스크립트
AI 분석 결과를 Kafka에서 실시간으로 수신합니다.
"""
import os
import sys
import json
from kafka import KafkaConsumer
from dotenv import load_dotenv
from datetime import datetime

# .env 파일 로드
load_dotenv()

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'k13d202.p.ssafy.io:9092')
KAFKA_RESPONSE_TOPIC = os.getenv('KAFKA_RESPONSE_TOPIC', 'ai.analysis.result')


def print_result(message_value: dict):
    """결과 메시지 예쁘게 출력"""
    print("\n" + "="*80)
    print(f"⏰ 수신 시각: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)

    workspace_id = message_value.get('workspaceId', 'N/A')
    status = message_value.get('status', 'UNKNOWN')

    # 상태에 따라 색상 이모지 변경
    status_emoji = "✅" if status == "SUCCESS" else "❌"

    print(f"\n{status_emoji} 상태: {status}")
    print(f"📂 Workspace ID: {workspace_id}")

    if status == "SUCCESS":
        # INITIAL 결과
        if 'aiSummary' in message_value:
            # 제목 출력
            title = message_value.get('title', 'N/A')
            print(f"\n📌 마인드맵 제목: {title}")

            # keyword 출력 (TEXT 타입일 때만 존재)
            if 'keyword' in message_value:
                keyword = message_value.get('keyword')
                print(f"🔑 루트 키워드: {keyword}")

            print(f"\n📝 AI 요약:")
            print(f"   {message_value['aiSummary']}")

            nodes = message_value.get('nodes', [])
            print(f"\n🌳 생성된 노드: {len(nodes)}개")

            if nodes:
                print("\n노드 목록:")
                for idx, node in enumerate(nodes[:10], 1):  # 최대 10개만 출력
                    temp_id = node.get('tempId', '')
                    parent_id = node.get('parentId', '')
                    keyword = node.get('keyword', '')
                    memo = node.get('memo', '')

                    print(f"  {idx}. [{temp_id}] {keyword}")
                    print(f"     └─ 부모: {parent_id}")
                    print(f"     └─ 설명: {memo}")

                if len(nodes) > 10:
                    print(f"  ... 외 {len(nodes) - 10}개 노드")

        # CONTEXTUAL 결과
        elif 'nodeId' in message_value:
            node_id = message_value.get('nodeId')
            print(f"\n🔍 확장된 노드 ID: {node_id}")

            nodes = message_value.get('nodes', [])
            print(f"\n🌱 자식 노드: {len(nodes)}개")

            if nodes:
                print("\n자식 노드 목록:")
                for idx, node in enumerate(nodes, 1):
                    keyword = node.get('keyword', '')
                    memo = node.get('memo', '')

                    print(f"  {idx}. {keyword}")
                    print(f"     └─ {memo}")

    else:
        # 실패 시 에러 메시지 출력
        error = message_value.get('error', 'Unknown error')
        print(f"\n❌ 에러 메시지:")
        print(f"   {error}")

    print("\n" + "="*80)
    print()


def main():
    """메인 함수"""
    print("🔗 Kafka Consumer 시작 중...")
    print(f"📡 서버: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"📬 토픽: {KAFKA_RESPONSE_TOPIC}")
    print()

    try:
        consumer = KafkaConsumer(
            KAFKA_RESPONSE_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
            auto_offset_reset='latest',  # 최신 메시지부터 읽기
            enable_auto_commit=True,
            group_id='ai-result-monitor',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )

        print("✅ Kafka Consumer 연결 성공")
        print("🎧 AI 분석 결과를 실시간으로 수신 중...")
        print("   (Ctrl+C로 종료)\n")

        # 메시지 수신 대기
        for message in consumer:
            try:
                print_result(message.value)
            except Exception as e:
                print(f"⚠️  메시지 파싱 오류: {e}")
                print(f"   원본 메시지: {message.value}")

    except KeyboardInterrupt:
        print("\n\n⚠️  사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ Consumer 오류: {e}")
    finally:
        if 'consumer' in locals():
            consumer.close()
            print("🔌 Kafka Consumer 연결 종료")


if __name__ == "__main__":
    main()
