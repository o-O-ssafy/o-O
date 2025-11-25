"""
Kafka Organize 기능 테스트 스크립트
마인드맵 정리 요청을 Kafka로 전송하여 테스트
"""
import json
import os
from kafka import KafkaProducer
from dotenv import load_dotenv
import time

load_dotenv()


def get_test_scenarios():
    """다양한 테스트 시나리오 반환"""

    # 시나리오 1: 대규모 AI 프로젝트 마인드맵 (20개 노드, 루트 노드 보호 테스트)
    scenario_1 = {
        "name": "대규모 AI 프로젝트 (20개 노드, 루트 노드 보호)",
        "description": "루트 노드는 절대 변경되면 안 됨. 중복/유사 노드들이 통합되어야 함.",
        "workspaceId": 101,
        "nodes": [
            # 루트 노드 (반드시 보호되어야 함)
            {
                "nodeId": 1,
                "parentId": None,
                "type": "text",
                "keyword": "AI 협업 플랫폼 개발 프로젝트",
                "memo": "팀 협업을 위한 AI 기반 마인드맵 플랫폼 구축 프로젝트입니다. 이 내용은 절대 변경되면 안 됩니다!",
                "x": 400.0,
                "y": 300.0,
                "color": "#3b82f6"
            },

            # 기획 관련 노드들
            {
                "nodeId": 2,
                "parentId": 1,
                "type": "text",
                "keyword": "프로젝트 기획",
                "memo": "프로젝트의 전체적인 계획과 방향성을 수립하는 단계",
                "x": 200.0,
                "y": 150.0,
                "color": "#10b981"
            },
            {
                "nodeId": 3,
                "parentId": 2,
                "type": "text",
                "keyword": "요구사항 분석하기",
                "memo": "사용자들이 원하는 기능과 필요한 것들을 조사하고 분석",
                "x": 100.0,
                "y": 80.0,
                "color": "#8b5cf6"
            },
            {
                "nodeId": 4,
                "parentId": 2,
                "type": "text",
                "keyword": "요구사항 수집",
                "memo": "사용자 인터뷰를 통해 니즈 파악",  # 3번과 유사 - 통합 가능
                "x": 100.0,
                "y": 120.0,
                "color": "#8b5cf6"
            },
            {
                "nodeId": 5,
                "parentId": 2,
                "type": "text",
                "keyword": "목표 설정",
                "memo": "프로젝트 목표와 KPI를 명확하게 정의합니다",
                "x": 100.0,
                "y": 160.0,
                "color": "#f59e0b"
            },

            # 기술 스택 관련
            {
                "nodeId": 6,
                "parentId": 1,
                "type": "text",
                "keyword": "기술 스택 선정",
                "memo": "프로젝트에 사용할 기술들을 선택",
                "x": 600.0,
                "y": 150.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 7,
                "parentId": 6,
                "type": "text",
                "keyword": "프론트엔드",
                "memo": "React, TypeScript, TailwindCSS 사용 예정",
                "x": 700.0,
                "y": 80.0,
                "color": "#06b6d4"
            },
            {
                "nodeId": 8,
                "parentId": 6,
                "type": "text",
                "keyword": "백엔드",
                "memo": "Spring Boot, PostgreSQL, Redis 사용",
                "x": 700.0,
                "y": 120.0,
                "color": "#84cc16"
            },
            {
                "nodeId": 9,
                "parentId": 6,
                "type": "text",
                "keyword": "AI/ML",
                "memo": "Python, FastAPI, Llama 모델 활용",
                "x": 700.0,
                "y": 160.0,
                "color": "#a855f7"
            },
            {
                "nodeId": 10,
                "parentId": 6,
                "type": "text",
                "keyword": "인프라",
                "memo": "AWS, Docker, Kubernetes, Kafka",
                "x": 700.0,
                "y": 200.0,
                "color": "#f43f5e"
            },

            # 이미지/비디오 노드 (변경되면 안 됨)
            {
                "nodeId": 11,
                "parentId": 1,
                "type": "image",
                "keyword": "https://example.com/architecture-diagram.png",
                "memo": "시스템 아키텍처 다이어그램",
                "x": 400.0,
                "y": 500.0,
                "color": "#fbbf24"
            },
            {
                "nodeId": 12,
                "parentId": 6,
                "type": "video",
                "keyword": "https://www.youtube.com/watch?v=tech-stack-intro",
                "memo": "기술 스택 소개 영상",
                "x": 800.0,
                "y": 250.0,
                "color": "#f87171"
            },

            # 개발 단계
            {
                "nodeId": 13,
                "parentId": 1,
                "type": "text",
                "keyword": "개발 진행",
                "memo": "실제 코딩 작업을 진행하는 단계",
                "x": 200.0,
                "y": 450.0,
                "color": "#22c55e"
            },
            {
                "nodeId": 14,
                "parentId": 13,
                "type": "text",
                "keyword": "개발 작업",
                "memo": "코드를 작성하고 구현하는 과정",  # 13번과 유사 - 통합 가능
                "x": 100.0,
                "y": 400.0,
                "color": "#14b8a6"
            },
            {
                "nodeId": 15,
                "parentId": 13,
                "type": "text",
                "keyword": "코드 리뷰",
                "memo": "팀원들과 코드를 검토하고 개선점을 찾음",
                "x": 100.0,
                "y": 440.0,
                "color": "#06b6d4"
            },
            {
                "nodeId": 16,
                "parentId": 13,
                "type": "text",
                "keyword": "테스트 작성",
                "memo": "단위 테스트와 통합 테스트 코드 작성",
                "x": 100.0,
                "y": 480.0,
                "color": "#0ea5e9"
            },

            # 배포 관련
            {
                "nodeId": 17,
                "parentId": 1,
                "type": "text",
                "keyword": "배포 및 운영",
                "memo": "서비스를 배포하고 운영 관리",
                "x": 600.0,
                "y": 450.0,
                "color": "#ec4899"
            },
            {
                "nodeId": 18,
                "parentId": 17,
                "type": "text",
                "keyword": "CI/CD 파이프라인",
                "memo": "GitHub Actions로 자동 빌드 및 배포 구축",
                "x": 700.0,
                "y": 400.0,
                "color": "#d946ef"
            },
            {
                "nodeId": 19,
                "parentId": 17,
                "type": "text",
                "keyword": "모니터링",
                "memo": "Prometheus, Grafana로 시스템 모니터링",
                "x": 700.0,
                "y": 440.0,
                "color": "#c026d3"
            },
            {
                "nodeId": 20,
                "parentId": 17,
                "type": "text",
                "keyword": "시스템 관찰",
                "memo": "서버 상태를 지속적으로 확인하고 관리",  # 19번과 유사 - 통합 가능
                "x": 700.0,
                "y": 480.0,
                "color": "#a21caf"
            }
        ]
    }

    # 시나리오 2: 간단한 학습 계획 (10개 노드)
    scenario_2 = {
        "name": "개인 학습 계획 (10개 노드)",
        "description": "간단한 학습 마인드맵. 루트 노드와 몇몇 중복 노드가 있음.",
        "workspaceId": 102,
        "nodes": [
            {
                "nodeId": 100,
                "parentId": None,
                "type": "text",
                "keyword": "2025년 개발자 성장 로드맵",
                "memo": "올해 목표: 풀스택 개발자로 성장하기. 이 목표는 변경하면 안 됩니다!",
                "x": 400.0,
                "y": 300.0,
                "color": "#3b82f6"
            },
            {
                "nodeId": 101,
                "parentId": 100,
                "type": "text",
                "keyword": "프론트엔드 공부",
                "memo": "React, Next.js, TypeScript를 배우자",
                "x": 250.0,
                "y": 200.0,
                "color": "#10b981"
            },
            {
                "nodeId": 102,
                "parentId": 101,
                "type": "text",
                "keyword": "React 학습",
                "memo": "컴포넌트, 훅, 상태관리 마스터하기",
                "x": 150.0,
                "y": 150.0,
                "color": "#8b5cf6"
            },
            {
                "nodeId": 103,
                "parentId": 101,
                "type": "text",
                "keyword": "TypeScript",
                "memo": "타입 시스템을 제대로 배우고 활용",
                "x": 150.0,
                "y": 190.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 104,
                "parentId": 100,
                "type": "text",
                "keyword": "백엔드 공부",
                "memo": "Spring Boot와 데이터베이스 학습",
                "x": 550.0,
                "y": 200.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 105,
                "parentId": 104,
                "type": "text",
                "keyword": "Spring Boot",
                "memo": "REST API, JPA, Security 배우기",
                "x": 650.0,
                "y": 150.0,
                "color": "#06b6d4"
            },
            {
                "nodeId": 106,
                "parentId": 104,
                "type": "text",
                "keyword": "스프링 프레임워크",
                "memo": "자바 백엔드 프레임워크 공부",  # 105번과 유사
                "x": 650.0,
                "y": 190.0,
                "color": "#84cc16"
            },
            {
                "nodeId": 107,
                "parentId": 100,
                "type": "text",
                "keyword": "알고리즘 문제풀이",
                "memo": "매일 백준, 프로그래머스 1문제씩",
                "x": 250.0,
                "y": 400.0,
                "color": "#a855f7"
            },
            {
                "nodeId": 108,
                "parentId": 107,
                "type": "text",
                "keyword": "코딩테스트 준비",
                "memo": "알고리즘 문제 풀면서 실력 향상",  # 107번과 유사
                "x": 150.0,
                "y": 450.0,
                "color": "#f43f5e"
            },
            {
                "nodeId": 109,
                "parentId": 100,
                "type": "image",
                "keyword": "https://example.com/roadmap.png",
                "memo": "개발자 로드맵 이미지",
                "x": 550.0,
                "y": 400.0,
                "color": "#fbbf24"
            }
        ]
    }

    # 시나리오 3: 복잡한 비즈니스 전략 (15개 노드)
    scenario_3 = {
        "name": "스타트업 비즈니스 전략 (15개 노드)",
        "description": "여러 부서의 전략이 섞인 복잡한 마인드맵",
        "workspaceId": 103,
        "nodes": [
            {
                "nodeId": 200,
                "parentId": None,
                "type": "text",
                "keyword": "AI 스타트업 비즈니스 전략 2025",
                "memo": "생성형 AI를 활용한 B2B SaaS 사업 전략. 핵심 방향성입니다.",
                "x": 500.0,
                "y": 350.0,
                "color": "#3b82f6"
            },
            {
                "nodeId": 201,
                "parentId": 200,
                "type": "text",
                "keyword": "마케팅 전략",
                "memo": "제품 홍보 및 고객 유치 방안",
                "x": 300.0,
                "y": 200.0,
                "color": "#10b981"
            },
            {
                "nodeId": 202,
                "parentId": 201,
                "type": "text",
                "keyword": "디지털 마케팅",
                "memo": "SEO, 구글 광고, SNS 마케팅 진행",
                "x": 200.0,
                "y": 150.0,
                "color": "#8b5cf6"
            },
            {
                "nodeId": 203,
                "parentId": 201,
                "type": "text",
                "keyword": "온라인 광고",
                "memo": "페이스북, 인스타그램, 유튜브 광고",  # 202번과 유사
                "x": 200.0,
                "y": 190.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 204,
                "parentId": 201,
                "type": "text",
                "keyword": "콘텐츠 마케팅",
                "memo": "블로그, 유튜브 채널 운영",
                "x": 200.0,
                "y": 230.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 205,
                "parentId": 200,
                "type": "text",
                "keyword": "제품 개발",
                "memo": "핵심 기능 구현 및 UX 개선",
                "x": 700.0,
                "y": 200.0,
                "color": "#06b6d4"
            },
            {
                "nodeId": 206,
                "parentId": 205,
                "type": "text",
                "keyword": "MVP 출시",
                "memo": "최소 기능 제품을 빠르게 시장에 출시",
                "x": 800.0,
                "y": 150.0,
                "color": "#84cc16"
            },
            {
                "nodeId": 207,
                "parentId": 205,
                "type": "text",
                "keyword": "사용자 피드백 수집",
                "memo": "베타 테스터들의 의견을 받아서 개선",
                "x": 800.0,
                "y": 190.0,
                "color": "#a855f7"
            },
            {
                "nodeId": 208,
                "parentId": 200,
                "type": "video",
                "keyword": "https://www.youtube.com/watch?v=startup-pitch",
                "memo": "투자자 피칭 영상",
                "x": 500.0,
                "y": 100.0,
                "color": "#f43f5e"
            },
            {
                "nodeId": 209,
                "parentId": 200,
                "type": "text",
                "keyword": "재무 계획",
                "memo": "자금 조달 및 운영 예산 관리",
                "x": 300.0,
                "y": 500.0,
                "color": "#fbbf24"
            },
            {
                "nodeId": 210,
                "parentId": 209,
                "type": "text",
                "keyword": "시드 투자 유치",
                "memo": "VC들에게 5억 투자 받기",
                "x": 200.0,
                "y": 550.0,
                "color": "#f87171"
            },
            {
                "nodeId": 211,
                "parentId": 209,
                "type": "text",
                "keyword": "번아웃 관리",
                "memo": "월 운영비 3천만원 내로 관리",
                "x": 200.0,
                "y": 590.0,
                "color": "#fb923c"
            },
            {
                "nodeId": 212,
                "parentId": 200,
                "type": "text",
                "keyword": "인재 채용",
                "memo": "개발자, 디자이너, 마케터 채용",
                "x": 700.0,
                "y": 500.0,
                "color": "#fdba74"
            },
            {
                "nodeId": 213,
                "parentId": 212,
                "type": "text",
                "keyword": "개발자 구인",
                "memo": "풀스택 개발자 2명 채용 목표",
                "x": 800.0,
                "y": 550.0,
                "color": "#fcd34d"
            },
            {
                "nodeId": 214,
                "parentId": 212,
                "type": "image",
                "keyword": "https://example.com/team-structure.png",
                "memo": "팀 조직도",
                "x": 800.0,
                "y": 590.0,
                "color": "#fde047"
            }
        ]
    }

    # 시나리오 4: 프로젝트 회의록 (극단적 중복 - 12개 노드, 중복 많음)
    scenario_4 = {
        "name": "프로젝트 회의록 (12개 노드, 중복 극심)",
        "description": "회의에서 나온 아이디어들. 중복과 유사 표현이 매우 많음.",
        "workspaceId": 103,
        "nodes": [
            {
                "nodeId": 1,
                "parentId": None,
                "type": "text",
                "keyword": "2025년 1월 기획 회의",
                "memo": "신규 모바일 앱 개발 관련 회의록입니다. 절대 변경 금지!",
                "x": 400.0,
                "y": 300.0,
                "color": "#3b82f6"
            },
            {
                "nodeId": 2,
                "parentId": 1,
                "type": "text",
                "keyword": "UI 개선",
                "memo": "사용자 인터페이스를 더 직관적으로 만들기",
                "x": 200.0,
                "y": 200.0,
                "color": "#10b981"
            },
            {
                "nodeId": 3,
                "parentId": 1,
                "type": "text",
                "keyword": "사용자 경험 향상",
                "memo": "UI/UX를 개선하여 더 나은 사용자 경험 제공",  # 2번과 유사
                "x": 200.0,
                "y": 240.0,
                "color": "#10b981"
            },
            {
                "nodeId": 4,
                "parentId": 1,
                "type": "text",
                "keyword": "인터페이스 디자인",
                "memo": "화면 디자인을 새롭게 리뉴얼",  # 2, 3번과 유사
                "x": 200.0,
                "y": 280.0,
                "color": "#10b981"
            },
            {
                "nodeId": 5,
                "parentId": 1,
                "type": "text",
                "keyword": "성능 최적화",
                "memo": "앱 로딩 속도를 빠르게 개선",
                "x": 600.0,
                "y": 200.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 6,
                "parentId": 1,
                "type": "text",
                "keyword": "속도 개선",
                "memo": "전반적인 성능을 향상시키기",  # 5번과 유사
                "x": 600.0,
                "y": 240.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 7,
                "parentId": 1,
                "type": "text",
                "keyword": "최적화 작업",
                "memo": "리소스 사용량 줄이고 속도 높이기",  # 5, 6번과 유사
                "x": 600.0,
                "y": 280.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 8,
                "parentId": 1,
                "type": "text",
                "keyword": "버그 수정",
                "memo": "현재 발견된 버그들을 고치기",
                "x": 400.0,
                "y": 450.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 9,
                "parentId": 1,
                "type": "text",
                "keyword": "오류 해결",
                "memo": "사용자가 보고한 오류 처리",  # 8번과 유사
                "x": 400.0,
                "y": 490.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 10,
                "parentId": 1,
                "type": "text",
                "keyword": "이슈 픽스",
                "memo": "알려진 문제점들을 수정",  # 8, 9번과 유사
                "x": 400.0,
                "y": 530.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 11,
                "parentId": 1,
                "type": "image",
                "keyword": "https://example.com/meeting-notes.png",
                "memo": "회의록 스크린샷",
                "x": 200.0,
                "y": 450.0,
                "color": "#8b5cf6"
            },
            {
                "nodeId": 12,
                "parentId": 1,
                "type": "text",
                "keyword": "테스트 강화",
                "memo": "QA 프로세스 개선하기",
                "x": 600.0,
                "y": 450.0,
                "color": "#06b6d4"
            }
        ]
    }

    # 시나리오 5: 영어 노드 테스트 (8개 노드)
    scenario_5 = {
        "name": "영어 노드 테스트 (8개 노드)",
        "description": "영어로 작성된 노드들. 한국어로 번역되지 않아야 함.",
        "workspaceId": 104,
        "nodes": [
            {
                "nodeId": 1,
                "parentId": None,
                "type": "text",
                "keyword": "Machine Learning Project",
                "memo": "This is an ML project roadmap. DO NOT CHANGE THIS ROOT NODE!",
                "x": 400.0,
                "y": 300.0,
                "color": "#3b82f6"
            },
            {
                "nodeId": 2,
                "parentId": 1,
                "type": "text",
                "keyword": "Data Collection",
                "memo": "Gather training data from various sources",
                "x": 200.0,
                "y": 200.0,
                "color": "#10b981"
            },
            {
                "nodeId": 3,
                "parentId": 1,
                "type": "text",
                "keyword": "Data Gathering",
                "memo": "Collect datasets for model training",  # 2번과 유사
                "x": 200.0,
                "y": 240.0,
                "color": "#10b981"
            },
            {
                "nodeId": 4,
                "parentId": 1,
                "type": "text",
                "keyword": "Model Training",
                "memo": "Train neural network models",
                "x": 600.0,
                "y": 200.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 5,
                "parentId": 1,
                "type": "text",
                "keyword": "Model Development",
                "memo": "Build and train ML models",  # 4번과 유사
                "x": 600.0,
                "y": 240.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 6,
                "parentId": 1,
                "type": "text",
                "keyword": "Evaluation",
                "memo": "Test model performance and accuracy",
                "x": 400.0,
                "y": 450.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 7,
                "parentId": 1,
                "type": "text",
                "keyword": "Testing",
                "memo": "Validate model results",  # 6번과 유사
                "x": 400.0,
                "y": 490.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 8,
                "parentId": 1,
                "type": "video",
                "keyword": "https://youtube.com/ml-tutorial",
                "memo": "ML tutorial video",
                "x": 400.0,
                "y": 550.0,
                "color": "#8b5cf6"
            }
        ]
    }

    # 시나리오 6: 소규모 노드 (6개 노드)
    scenario_6 = {
        "name": "소규모 노드 (6개 노드)",
        "description": "적은 수의 노드. 병합이 일어날 만한 것들이 있음.",
        "workspaceId": 105,
        "nodes": [
            {
                "nodeId": 1,
                "parentId": None,
                "type": "text",
                "keyword": "주말 여행 계획",
                "memo": "부산 여행 준비 사항입니다. 이 내용은 변경하지 마세요!",
                "x": 400.0,
                "y": 300.0,
                "color": "#3b82f6"
            },
            {
                "nodeId": 2,
                "parentId": 1,
                "type": "text",
                "keyword": "교통편 예약",
                "memo": "KTX 왕복 티켓 구매",
                "x": 250.0,
                "y": 200.0,
                "color": "#10b981"
            },
            {
                "nodeId": 3,
                "parentId": 1,
                "type": "text",
                "keyword": "기차표 구입",
                "memo": "부산행 기차 예매하기",  # 2번과 유사
                "x": 250.0,
                "y": 240.0,
                "color": "#10b981"
            },
            {
                "nodeId": 4,
                "parentId": 1,
                "type": "text",
                "keyword": "숙소 찾기",
                "memo": "해운대 근처 호텔 검색",
                "x": 550.0,
                "y": 200.0,
                "color": "#ef4444"
            },
            {
                "nodeId": 5,
                "parentId": 1,
                "type": "text",
                "keyword": "관광지 리스트",
                "memo": "광안리, 자갈치시장, 감천문화마을 방문",
                "x": 400.0,
                "y": 450.0,
                "color": "#f59e0b"
            },
            {
                "nodeId": 6,
                "parentId": 1,
                "type": "image",
                "keyword": "https://example.com/busan-map.jpg",
                "memo": "부산 지도",
                "x": 250.0,
                "y": 450.0,
                "color": "#8b5cf6"
            }
        ]
    }

    return [scenario_1, scenario_2, scenario_3, scenario_4, scenario_5, scenario_6]


def print_node_summary(nodes):
    """노드 요약 정보 출력"""
    text_count = sum(1 for n in nodes if n.get('type') == 'text')
    image_count = sum(1 for n in nodes if n.get('type') == 'image')
    video_count = sum(1 for n in nodes if n.get('type') == 'video')
    root_count = sum(1 for n in nodes if n.get('type') == 'text' and n.get('parentId') is None)

    print(f"   📊 전체 노드: {len(nodes)}개")
    print(f"   📝 text 노드: {text_count}개 (루트: {root_count}개)")
    print(f"   🖼️  image 노드: {image_count}개")
    print(f"   🎥 video 노드: {video_count}개")

    # 루트 노드 정보
    root_nodes = [n for n in nodes if n.get('type') == 'text' and n.get('parentId') is None]
    if root_nodes:
        print(f"\n   🔒 루트 노드 (변경되면 안 됨):")
        for root in root_nodes:
            print(f"      - [{root['nodeId']}] {root['keyword']}")
            print(f"        {root['memo'][:60]}...")


def send_organize_request():
    """Organize 요청을 Kafka로 전송"""

    # Kafka Producer 설정
    bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'k13d202.p.ssafy.io:9092')
    organize_request_topic = os.getenv('KAFKA_ORGANIZE_REQUEST_TOPIC', 'ai.organize.request')

    print("=" * 80)
    print("🧠 Kafka 기반 AI 마인드맵 정리 기능 테스트")
    print("=" * 80)
    print(f"📡 Kafka 서버: {bootstrap_servers}")
    print(f"📤 전송 토픽: {organize_request_topic}")
    print("=" * 80)

    # 테스트 시나리오 가져오기
    scenarios = get_test_scenarios()

    # 시나리오 선택
    print("\n📋 테스트 시나리오 선택:")
    print("-" * 80)
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{i}. {scenario['name']}")
        print(f"   설명: {scenario['description']}")
        print_node_summary(scenario['nodes'])

    print("-" * 80)

    # 환경변수로 시나리오 선택 (기본값: 1)
    default_scenario = os.getenv('TEST_SCENARIO', '1')
    print(f"\n자동 선택: {default_scenario}번 시나리오 (TEST_SCENARIO 환경변수로 변경 가능)")

    try:
        scenario_index = int(default_scenario) - 1
        if scenario_index < 0 or scenario_index >= len(scenarios):
            print("❌ 잘못된 선택입니다. 1번 시나리오를 사용합니다.")
            scenario_index = 0
    except ValueError:
        print("❌ 잘못된 입력입니다. 1번 시나리오를 사용합니다.")
        scenario_index = 0

    selected_scenario = scenarios[scenario_index]

    # 요청 데이터 준비
    request_data = {
        "workspaceId": selected_scenario["workspaceId"],
        "nodes": selected_scenario["nodes"]
    }

    print("\n" + "=" * 80)
    print(f"✅ 선택된 시나리오: {selected_scenario['name']}")
    print("=" * 80)
    print(f"🏢 Workspace ID: {request_data['workspaceId']}")
    print_node_summary(request_data['nodes'])

    # BEFORE 분석 - 병합 가능한 노드 표시
    print("\n" + "=" * 80)
    print("📊 BEFORE: 정리 전 분석")
    print("=" * 80)

    text_nodes = [n for n in request_data['nodes'] if n.get('type') == 'text']
    root_nodes = [n for n in text_nodes if n.get('parentId') is None]
    non_root_text = [n for n in text_nodes if n.get('parentId') is not None]
    non_text = [n for n in request_data['nodes'] if n.get('type') in ['image', 'video']]

    print(f"📝 총 text 노드: {len(text_nodes)}개")
    print(f"   - 🔒 루트 노드: {len(root_nodes)}개 (변경 불가)")
    print(f"   - 📄 일반 노드: {len(non_root_text)}개 (정리 대상)")
    print(f"🖼️  image/video 노드: {len(non_text)}개 (변경 없음)")

    # 유사 노드 쌍 찾기 (간단한 휴리스틱)
    print("\n🔍 병합 가능한 유사 노드 쌍:")
    print("-" * 80)
    found_similar = False
    for i, node1 in enumerate(non_root_text):
        for node2 in non_root_text[i+1:]:
            # 같은 부모를 가지고, 키워드가 유사한 경우
            if node1.get('parentId') == node2.get('parentId'):
                kw1 = node1.get('keyword', '').lower()
                kw2 = node2.get('keyword', '').lower()
                # 단어가 겹치는지 체크
                words1 = set(kw1.split())
                words2 = set(kw2.split())
                if words1 & words2:  # 교집합이 있으면
                    found_similar = True
                    print(f"   ⚠️  [{node1.get('nodeId')}] \"{node1.get('keyword')}\"")
                    print(f"   ⚠️  [{node2.get('nodeId')}] \"{node2.get('keyword')}\"")
                    print(f"   → 같은 부모(#{node1.get('parentId')}), 유사 키워드 → 병합 추천\n")

    if not found_similar:
        print("   ℹ️  명확히 유사한 노드 쌍을 찾지 못했습니다.")
        print("   (LLM이 더 정교하게 분석하여 병합할 수 있습니다)")

    print("\n" + "=" * 80)
    print("📤 Kafka로 전송 중...")
    print("=" * 80)

    # Producer 생성 및 전송
    try:
        producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
            acks='all',
            retries=3
        )

        future = producer.send(organize_request_topic, request_data)
        record_metadata = future.get(timeout=10)

        print("\n✅ 메시지 전송 성공!")
        print(f"   - Topic: {record_metadata.topic}")
        print(f"   - Partition: {record_metadata.partition}")
        print(f"   - Offset: {record_metadata.offset}")
        print(f"   - Timestamp: {record_metadata.timestamp}")

        print("\n" + "=" * 80)
        print("💡 다음 단계:")
        print("=" * 80)
        print("1. AI 서버 로그 확인:")
        print("   - 'ORGANIZE 시작' 메시지 확인")
        print("   - LLM 응답 길이 및 미리보기 확인")
        print("   - 🔒 루트 노드 보호 로그 확인 (변경 감지 시)")
        print("   - '✅ ORGANIZE 완료' 메시지 확인")
        print("\n2. 결과 수신:")
        print("   python test_kafka_organize_consumer.py")
        print("\n3. 확인할 사항:")
        print("   - 루트 노드의 keyword와 memo가 원본과 동일한지")
        print("   - 유사한 노드들이 통합되었는지")
        print("   - image/video 노드가 변경되지 않았는지")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ 메시지 전송 실패: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if 'producer' in locals():
            producer.flush()
            producer.close()


def main():
    """메인 함수"""
    try:
        send_organize_request()
    except KeyboardInterrupt:
        print("\n\n🛑 종료합니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
