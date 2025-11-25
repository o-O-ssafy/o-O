"""
Kafka Producer 테스트 스크립트
AI 분석 요청을 Kafka로 전송하여 테스트합니다.
"""
import os
import sys
import json
from kafka import KafkaProducer
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'k13d202.p.ssafy.io:9092')
KAFKA_REQUEST_TOPIC = os.getenv('KAFKA_REQUEST_TOPIC', 'ai.analysis.request')


class KafkaTestProducer:
    """Kafka 테스트 메시지 전송 클래스"""

    def __init__(self):
        """Kafka Producer 초기화"""
        print(f"🔗 Kafka 서버 연결 중: {KAFKA_BOOTSTRAP_SERVERS}")
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
                value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
                acks='all',
                retries=3
            )
            print("✅ Kafka Producer 연결 성공\n")
        except Exception as e:
            print(f"❌ Kafka Producer 연결 실패: {e}")
            sys.exit(1)

    def send_message(self, message: dict, description: str):
        """메시지 전송"""
        print(f"📤 {description}")
        print(f"📝 메시지 내용:")
        print(json.dumps(message, indent=2, ensure_ascii=False))
        print()

        try:
            future = self.producer.send(KAFKA_REQUEST_TOPIC, value=message)
            result = future.get(timeout=10)
            print(f"✅ 전송 성공!")
            print(f"   - Topic: {result.topic}")
            print(f"   - Partition: {result.partition}")
            print(f"   - Offset: {result.offset}")
            print()
        except Exception as e:
            print(f"❌ 전송 실패: {e}")
            print()

    def test_initial_text(self):
        """INITIAL - TEXT 타입 테스트"""
        message = {
            "workspaceId": 1001,
            "nodeId": 100,
            "analysisType": "INITIAL",
            "contentType": "TEXT",
            "contentUrl": None,
            "prompt": "인공지능의 발전 과정과 미래 전망에 대해 마인드맵을 만들어줘"
        }
        self.send_message(message, "INITIAL 분석 - TEXT 타입")

    def test_initial_video(self):
        """INITIAL - VIDEO 타입 테스트"""
        message = {
            "workspaceId": 1002,
            "nodeId": 200,
            "analysisType": "INITIAL",
            "contentType": "VIDEO",
            "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "prompt": "이 영상의 주요 내용을 마인드맵으로 정리해줘"
        }
        self.send_message(message, "INITIAL 분석 - VIDEO 타입")

    def test_initial_image(self):
        """INITIAL - IMAGE 타입 테스트"""
        message = {
            "workspaceId": 1003,
            "nodeId": 300,
            "analysisType": "INITIAL",
            "contentType": "IMAGE",
            "contentUrl": "https://raw.githubusercontent.com/pytorch/pytorch/main/docs/source/_static/img/pytorch-logo-dark.png",
            "prompt": "이 이미지의 내용을 분석하고 마인드맵을 만들어줘"
        }
        self.send_message(message, "INITIAL 분석 - IMAGE 타입")

    def test_contextual_text(self):
        """CONTEXTUAL - TEXT 타입 테스트"""
        message = {
            "workspaceId": 1004,
            "nodeId": 402,
            "analysisType": "CONTEXTUAL",
            "contentType": "TEXT",
            "nodes": [
                {
                    "nodeId": 400,
                    "keyword": "인공지능",
                    "memo": "AI 기술 전반에 대한 내용"
                },
                {
                    "nodeId": 401,
                    "keyword": "머신러닝",
                    "memo": "데이터 기반 학습 방법론"
                },
                {
                    "nodeId": 402,
                    "keyword": "딥러닝",
                    "memo": "신경망 기반 학습 방법"
                }
            ]
        }
        self.send_message(message, "CONTEXTUAL 분석 - TEXT 타입")

    def test_contextual_video(self):
        """CONTEXTUAL - VIDEO 타입 테스트"""
        message = {
            "workspaceId": 1005,
            "nodeId": 502,
            "analysisType": "CONTEXTUAL",
            "contentType": "VIDEO",
            "nodes": [
                {
                    "nodeId": 500,
                    "keyword": "프로그래밍",
                    "memo": "코딩 기초"
                },
                {
                    "nodeId": 501,
                    "keyword": "Python",
                    "memo": "파이썬 프로그래밍"
                },
                {
                    "nodeId": 502,
                    "keyword": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "memo": "파이썬 튜토리얼 영상"
                }
            ]
        }
        self.send_message(message, "CONTEXTUAL 분석 - VIDEO 타입")

    def test_contextual_image(self):
        """CONTEXTUAL - IMAGE 타입 테스트"""
        message = {
            "workspaceId": 1006,
            "nodeId": 602,
            "analysisType": "CONTEXTUAL",
            "contentType": "IMAGE",
            "nodes": [
                {
                    "nodeId": 600,
                    "keyword": "딥러닝 프레임워크",
                    "memo": "신경망 학습 도구"
                },
                {
                    "nodeId": 601,
                    "keyword": "PyTorch",
                    "memo": "동적 계산 그래프 기반 프레임워크"
                },
                {
                    "nodeId": 602,
                    "keyword": "https://raw.githubusercontent.com/pytorch/pytorch/main/docs/source/_static/img/pytorch-logo-dark.png",
                    "memo": "PyTorch 로고 이미지"
                }
            ]
        }
        self.send_message(message, "CONTEXTUAL 분석 - IMAGE 타입")

    def close(self):
        """Producer 종료"""
        self.producer.flush()
        self.producer.close()
        print("🔌 Kafka Producer 연결 종료")


def print_menu():
    """메뉴 출력"""
    print("\n" + "="*60)
    print("🧪 Kafka AI 분석 요청 테스트")
    print("="*60)
    print("\n📋 INITIAL 분석 (최초 컨텐츠 분석)")
    print("  1. TEXT    - 텍스트 프롬프트로 마인드맵 생성")
    print("  2. VIDEO   - YouTube 영상 분석")
    print("  3. IMAGE   - 이미지 URL 분석")
    print("\n📋 CONTEXTUAL 분석 (노드 확장)")
    print("  4. TEXT    - 부모 노드 문맥 기반 확장")
    print("  5. VIDEO   - YouTube 영상 기반 확장")
    print("  6. IMAGE   - 이미지 기반 확장")
    print("\n📋 기타")
    print("  7. 전체 테스트 (1~6 순차 실행)")
    print("  0. 종료")
    print("="*60)


def main():
    """메인 함수"""
    producer = KafkaTestProducer()

    test_functions = {
        '1': producer.test_initial_text,
        '2': producer.test_initial_video,
        '3': producer.test_initial_image,
        '4': producer.test_contextual_text,
        '5': producer.test_contextual_video,
        '6': producer.test_contextual_image,
    }

    while True:
        print_menu()
        choice = input("\n선택 (0-7): ").strip()

        if choice == '0':
            print("\n👋 종료합니다.")
            break
        elif choice == '7':
            print("\n🚀 전체 테스트 실행 중...\n")
            for i in range(1, 7):
                test_functions[str(i)]()
                input("⏸️  다음 테스트를 진행하려면 Enter를 누르세요...")
        elif choice in test_functions:
            test_functions[choice]()
            input("\n⏸️  계속하려면 Enter를 누르세요...")
        else:
            print("\n❌ 잘못된 입력입니다.")

    producer.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  사용자에 의해 중단되었습니다.")
        sys.exit(0)
