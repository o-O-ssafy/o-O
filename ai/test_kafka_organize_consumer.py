"""
Kafka Organize 결과 수신 테스트 스크립트
ai.organize.result 토픽에서 정리 결과를 수신하여 출력
"""
import json
import os
from kafka import KafkaConsumer
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()


def consume_organize_results():
    """Organize 결과를 Kafka에서 수신"""

    # Kafka Consumer 설정
    bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'k13d202.p.ssafy.io:9092')
    organize_result_topic = os.getenv('KAFKA_ORGANIZE_RESULT_TOPIC', 'ai.organize.result')

    print("=" * 80)
    print("🎧 Kafka Organize 결과 수신 대기 중...")
    print("=" * 80)
    print(f"📡 Kafka 서버: {bootstrap_servers}")
    print(f"📥 구독 토픽: {organize_result_topic}")
    print("=" * 80)
    print("💡 Ctrl+C를 눌러 종료하세요.\n")

    # Consumer 생성
    consumer = KafkaConsumer(
        organize_result_topic,
        bootstrap_servers=bootstrap_servers,
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='latest',  # 최신 메시지부터 읽기
        enable_auto_commit=True,
        group_id='organize-test-consumer'
    )

    try:
        for message in consumer:
            result = message.value

            print("\n" + "=" * 80)
            print(f"📬 메시지 수신 [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]")
            print("=" * 80)

            # 메타데이터
            print(f"📊 Offset: {message.offset}, Partition: {message.partition}")
            print(f"🏢 Workspace ID: {result.get('workspaceId')}")
            print(f"✅ Status: {result.get('status')}")
            print(f"🕐 Analyzed At: {result.get('analyzedAt')}")

            # 에러가 있으면 출력
            if result.get('error'):
                print(f"❌ Error: {result.get('error')}")

            # 노드 정보
            nodes = result.get('nodes', [])
            print(f"\n📌 노드 개수: {len(nodes)}개")

            # 타입별 노드 수 집계
            text_count = sum(1 for n in nodes if n.get('type') == 'text')
            image_count = sum(1 for n in nodes if n.get('type') == 'image')
            video_count = sum(1 for n in nodes if n.get('type') == 'video')

            print(f"   - text: {text_count}개")
            print(f"   - image: {image_count}개")
            print(f"   - video: {video_count}개")

            # 루트 노드 먼저 출력 (특별 강조)
            root_nodes = [n for n in nodes if n.get('type') == 'text' and n.get('parentId') is None]
            if root_nodes:
                print("\n🔒 루트 노드 (변경 여부 확인 필수!):")
                print("-" * 80)
                for node in root_nodes:
                    print(f"\n  [Node {node.get('nodeId')}] 🔑 ROOT")
                    print(f"  └─ Parent: {node.get('parentId')} (null 유지됨)")
                    print(f"  └─ Keyword: {node.get('keyword')}")
                    print(f"  └─ Memo: {node.get('memo')}")
                    print(f"  └─ Position: ({node.get('x')}, {node.get('y')})")
                    print(f"  └─ Color: {node.get('color')}")
                    print(f"  ⚠️  이 노드의 keyword와 memo는 원본과 동일해야 합니다!")

            # 일반 text 노드 출력
            non_root_text_nodes = [n for n in nodes if n.get('type') == 'text' and n.get('parentId') is not None]
            if non_root_text_nodes:
                print("\n📝 정리된 일반 text 노드:")
                print("-" * 80)
                for node in non_root_text_nodes:
                    print(f"\n  [Node {node.get('nodeId')}]")
                    print(f"  └─ Parent: {node.get('parentId')}")
                    print(f"  └─ Keyword: {node.get('keyword')}")
                    print(f"  └─ Memo: {node.get('memo')}")
                    print(f"  └─ Position: ({node.get('x')}, {node.get('y')})")
                    print(f"  └─ Color: {node.get('color')}")

            # image/video 노드
            non_text_nodes = [n for n in nodes if n.get('type') in ['image', 'video']]
            if non_text_nodes:
                print("\n🖼️ image/video 노드 (변경 없음):")
                print("-" * 80)
                for node in non_text_nodes:
                    print(f"\n  [Node {node.get('nodeId')}] {node.get('type').upper()}")
                    print(f"  └─ Keyword: {node.get('keyword')}")
                    print(f"  └─ Memo: {node.get('memo')[:50]}...")

            # 통계 정보
            print("\n" + "=" * 80)
            print("📊 AFTER: 정리 후 통계")
            print("=" * 80)
            print(f"   - 총 노드 개수: {len(nodes)}개")
            print(f"   - 🔒 루트 노드: {len(root_nodes)}개 (보호됨)")
            print(f"   - 📄 일반 text 노드: {len(non_root_text_nodes)}개 (정리됨)")
            print(f"   - 🖼️  image/video 노드: {len(non_text_nodes)}개 (변경 없음)")

            # 병합 분석 - 연속되지 않은 nodeId 찾기
            print("\n🔍 병합 분석 (누락된 nodeId = 병합되어 삭제된 노드):")
            print("-" * 80)
            all_node_ids = sorted([n.get('nodeId') for n in nodes])
            if all_node_ids:
                expected_ids = list(range(min(all_node_ids), max(all_node_ids) + 1))
                missing_ids = [id for id in expected_ids if id not in all_node_ids]

                if missing_ids:
                    print(f"   ✅ 병합되어 제거된 nodeId: {missing_ids}")
                    print(f"   → {len(missing_ids)}개 노드가 다른 노드에 병합됨!")
                else:
                    print("   ℹ️  누락된 nodeId 없음 (병합이 발생하지 않았을 수 있음)")

            # 병합 효과 계산
            total_text_nodes = len(root_nodes) + len(non_root_text_nodes)
            print(f"\n💡 예상 효과:")
            print(f"   - 병합 가능 대상: 일반 text 노드 {len(non_root_text_nodes)}개")
            if len(missing_ids) > 0:
                reduction_rate = (len(missing_ids) / total_text_nodes * 100) if total_text_nodes > 0 else 0
                print(f"   - 실제 감소: {len(missing_ids)}개 노드 제거 ({reduction_rate:.1f}% 감소)")
                print(f"   - 병합 성공! 🎉")
            else:
                print(f"   - 노드 개수 변화 없음")

            print("\n" + "=" * 80)
            print("✅ 메시지 처리 완료")
            print("=" * 80)
            print("\n💡 확인 사항:")
            print("   1. ✅ 루트 노드가 원본과 동일한지")
            print("   2. ✅ 유사한 노드들이 통합되었는지 (위 '병합 분석' 참고)")
            print("   3. ✅ 한국어가 영어로 번역되지 않았는지")
            print("   4. ✅ 모든 노드의 x, y, color가 보존되었는지")
            print("   5. ✅ image/video 노드가 변경되지 않았는지")
            print("=" * 80 + "\n")

    except KeyboardInterrupt:
        print("\n\n🛑 종료합니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
    finally:
        consumer.close()


def main():
    """메인 함수"""
    try:
        consume_organize_results()
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")


if __name__ == "__main__":
    main()
