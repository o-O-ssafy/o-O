# Text to MindMap API Guide

텍스트 프롬프트를 입력받아 AI가 자동으로 구조화된 마인드맵을 생성하는 API입니다.

## 기능 개요

- **텍스트 입력**: 주제, 개념, 질문 등 어떤 텍스트든 입력 가능
- **AI 분석**: Llama 3.1 8B 모델이 텍스트를 분석하고 구조화
- **마인드맵 자동 생성**: 계층적이고 논리적인 마인드맵 JSON 생성
- **상세 수준 조절**: Simple, Medium, Detailed 3단계 선택 가능
- **실시간 스트리밍**: Server-Sent Events로 진행 상황 실시간 업데이트

## 주요 특징

### 1. Vision 모델 불필요
- YouTube 분석, 이미지 분석과 달리 **Text 모델만 사용**
- GPU 메모리 효율적 (~4GB만 사용)
- 빠른 처리 속도 (5-30초)

### 2. 다양한 입력 지원
- 짧은 주제/키워드: "인공지능"
- 질문: "블록체인이 뭐야?"
- 복잡한 요청: "머신러닝과 딥러닝의 차이점을 알려주고 각각의 활용 사례를 정리해줘"
- 긴 텍스트: 최대 10,000자 지원

### 3. 상세 수준 조절
| 수준 | 깊이 | 토큰 | 소요시간 | 용도 |
|------|------|------|---------|------|
| Simple | 2단계 | 2048 | 5-10초 | 빠른 개요 파악 |
| Medium | 3-4단계 | 4096 | 10-20초 | 일반적인 분석 |
| Detailed | 4-5단계 | 6144 | 15-30초 | 심층 분석 |

## API 엔드포인트

### POST /analyze/text

텍스트를 분석하고 마인드맵을 생성합니다.

**Request:**

```json
{
  "text_prompt": "인공지능의 역사와 발전 과정",
  "detail_level": "medium"  // "simple", "medium", "detailed"
}
```

**Response:** Server-Sent Events (SSE) 스트리밍

```
data: {"status": "started", "task_id": "...", "progress": 0, "message": "텍스트 분석 시작"}

data: {"status": "validating", "progress": 10, "message": "입력 텍스트 검증 중..."}

data: {"status": "validation_complete", "progress": 20, "message": "텍스트 검증 완료: 50자, 10단어, 상세도=medium"}

data: {"status": "creating_mindmap", "progress": 30, "message": "LLM으로 마인드맵 생성 중..."}

data: {"status": "creating_mindmap", "progress": 40, "message": "표준 마인드맵 생성 중... (예상 10-20초)"}

data: {"status": "mindmap_complete", "progress": 95, "message": "마인드맵 생성 완료"}

data: {"status": "completed", "progress": 100, "message": "텍스트 분석 완료!", "result": {...}}
```

**최종 Result 구조:**

```json
{
  "task_id": "uuid",
  "status": "completed",
  "text_prompt": "인공지능의 역사와 발전 과정",
  "created_at": "2025-11-03T12:00:00",
  "completed_at": "2025-11-03T12:00:15",
  "mindmap": {
    "keyword": "인공지능의 역사",
    "description": "1950년대부터 현재까지의 AI 발전 과정",
    "children": [
      {
        "keyword": "초기 시대 (1950-1980)",
        "description": "튜링 테스트, 다트머스 회의, 전문가 시스템",
        "children": [
          {
            "keyword": "다트머스 회의 (1956)",
            "description": "AI라는 용어 최초 등장, John McCarthy 주도",
            "children": null
          },
          {
            "keyword": "전문가 시스템",
            "description": "MYCIN, DENDRAL 등 규칙 기반 시스템",
            "children": null
          }
        ]
      },
      {
        "keyword": "AI 겨울 (1980-2000)",
        "description": "기대 하락, 투자 감소, 제한된 발전",
        "children": null
      },
      {
        "keyword": "현대 AI (2000-현재)",
        "description": "머신러닝, 딥러닝, 대규모 언어 모델",
        "children": [
          {
            "keyword": "딥러닝 혁명 (2012-)",
            "description": "AlexNet, ImageNet, GPU 활용",
            "children": null
          },
          {
            "keyword": "대규모 언어 모델",
            "description": "GPT, BERT, ChatGPT 등장",
            "children": null
          }
        ]
      }
    ]
  }
}
```

## 사용 예시

### 1. Python으로 API 호출

```python
import requests
import json

API_URL = "http://localhost:8000"

# 요청 데이터
data = {
    "text_prompt": "블록체인 기술의 원리와 응용 분야",
    "detail_level": "medium"
}

# 스트리밍 요청
response = requests.post(
    f"{API_URL}/analyze/text",
    json=data,
    stream=True
)

# SSE 스트림 파싱
for line in response.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if line_str.startswith('data: '):
            data = json.loads(line_str[6:])

            print(f"[{data.get('progress', 0)}%] {data.get('message', '')}")

            if data.get('status') == 'completed':
                result = data['result']
                print("\n✅ 마인드맵 생성 완료!")
                print(json.dumps(result['mindmap'], indent=2, ensure_ascii=False))
```

### 2. JavaScript (Fetch API)로 호출

```javascript
const response = await fetch("http://localhost:8000/analyze/text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text_prompt: "기후 변화의 원인과 해결 방안",
    detail_level: "detailed"
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.substring(6));

      console.log(`[${data.progress}%] ${data.message}`);

      if (data.status === 'completed') {
        console.log("Result:", data.result.mindmap);
      }
    }
  }
}
```

### 3. HTML 테스트 페이지 사용

브라우저에서 `static/test_text_stream.html` 파일을 열고:

1. 텍스트/주제 입력 (또는 예시 프롬프트 클릭)
2. 상세 수준 선택 (Simple/Medium/Detailed)
3. "Generate MindMap" 버튼 클릭
4. 실시간 진행 상황 확인
5. 생성된 마인드맵 확인

### 4. cURL로 테스트

```bash
curl -X POST http://localhost:8000/analyze/text \
  -H "Content-Type: application/json" \
  -d '{
    "text_prompt": "머신러닝과 딥러닝의 차이점",
    "detail_level": "simple"
  }'
```

## 프롬프트 작성 팁

### 1. 개념/용어 설명
```json
{
  "text_prompt": "양자 컴퓨팅의 원리와 활용 가능성",
  "detail_level": "detailed"
}
```
→ AI가 정의 → 특징 → 유형 → 예시 → 응용 순서로 구조화

### 2. 비교/대조
```json
{
  "text_prompt": "머신러닝 vs 딥러닝: 차이점과 각각의 장단점",
  "detail_level": "medium"
}
```
→ AI가 항목별 비교 → 차이점 → 공통점으로 정리

### 3. 프로세스/절차
```json
{
  "text_prompt": "웹 애플리케이션 개발 과정: 기획부터 배포까지",
  "detail_level": "detailed"
}
```
→ AI가 단계별 분해 → 각 단계의 세부사항 구조화

### 4. 문제 해결
```json
{
  "text_prompt": "기후 변화 문제: 원인, 영향, 해결 방안",
  "detail_level": "detailed"
}
```
→ AI가 문제 정의 → 원인 → 해결방안 → 기대효과로 정리

### 5. 역사/시간순
```json
{
  "text_prompt": "인터넷의 발전 역사",
  "detail_level": "medium"
}
```
→ AI가 시대별/단계별 구분 → 주요 사건/특징 정리

## 상세 수준별 예시

### Simple (간단)
**입력:**
```json
{
  "text_prompt": "인공지능",
  "detail_level": "simple"
}
```

**출력 구조:**
```
인공지능
├─ 정의
└─ 주요 분야
   ├─ 머신러닝
   └─ 자연어 처리
```
- 2단계 깊이
- 핵심 키워드 중심
- 빠른 개요 파악용

### Medium (적절)
**입력:**
```json
{
  "text_prompt": "인공지능의 발전과 응용",
  "detail_level": "medium"
}
```

**출력 구조:**
```
인공지능
├─ 역사
│  ├─ 초기 시대
│  └─ 현대 AI
├─ 핵심 기술
│  ├─ 머신러닝
│  │  └─ 지도학습/비지도학습
│  └─ 딥러닝
│     └─ CNN, RNN
└─ 응용 분야
   ├─ 의료
   └─ 자율주행
```
- 3-4단계 깊이
- 적절한 상세도
- 일반적인 분석용

### Detailed (상세)
**입력:**
```json
{
  "text_prompt": "인공지능의 역사, 기술, 응용 분야 전반",
  "detail_level": "detailed"
}
```

**출력 구조:**
```
인공지능
├─ 역사
│  ├─ 초기 시대 (1950-1980)
│  │  ├─ 다트머스 회의 (1956)
│  │  └─ 전문가 시스템
│  ├─ AI 겨울 (1980-2000)
│  └─ 현대 AI (2000-현재)
│     ├─ 빅데이터 시대
│     └─ 대규모 언어 모델
├─ 핵심 기술
│  ├─ 머신러닝
│  │  ├─ 지도학습
│  │  │  ├─ 선형 회귀
│  │  │  └─ 의사결정 트리
│  │  └─ 비지도학습
│  └─ 딥러닝
│     ├─ CNN (이미지 인식)
│     └─ Transformer (언어 모델)
└─ 응용 분야
   ├─ 의료
   │  ├─ 진단 보조
   │  └─ 신약 개발
   └─ 자율주행
      ├─ 센서 융합
      └─ 경로 계획
```
- 4-5단계 깊이
- 구체적인 예시와 수치 포함
- 심층 분석용

## 제한사항

- **텍스트 길이**: 최소 3자, 최대 10,000자
- **처리 시간**:
  - Simple: ~5-10초
  - Medium: ~10-20초
  - Detailed: ~15-30초
- **토큰 제한**:
  - Simple: 2048 토큰
  - Medium: 4096 토큰
  - Detailed: 6144 토큰

## 에러 처리

### 텍스트가 너무 짧음
```json
{
  "status": "failed",
  "error": "텍스트가 너무 짧습니다. 최소 3자 이상 입력해주세요."
}
```

### 텍스트가 너무 김
```json
{
  "status": "failed",
  "error": "텍스트가 너무 깁니다. 최대 10,000자까지 지원합니다."
}
```

### 마인드맵 생성 실패
마인드맵 생성이 실패해도 폴백(fallback) 마인드맵이 자동으로 생성됩니다.

```json
{
  "mindmap": {
    "keyword": "입력한 텍스트...",
    "description": "AI가 생성한 마인드맵",
    "children": [
      {
        "keyword": "분석 필요",
        "description": "이 주제에 대한 상세 분석이 필요합니다.",
        "children": null
      }
    ]
  }
}
```

## 활용 사례

### 1. 학습 도구
- 복잡한 개념을 마인드맵으로 시각화
- 공부한 내용을 체계적으로 정리
- 시험 준비용 요약 자료 생성

### 2. 브레인스토밍
- 아이디어를 구조화
- 프로젝트 계획 수립
- 문제 해결 방안 정리

### 3. 지식 관리
- 복잡한 주제를 계층적으로 정리
- 회의록을 마인드맵으로 변환
- 문서 요약 및 구조화

### 4. 교육 자료 제작
- 강의 내용을 마인드맵으로 정리
- 학습자용 시각 자료 생성
- 복잡한 개념 설명용 도구

## 성능 최적화 팁

1. **적절한 상세 수준 선택**:
   - 빠른 개요: Simple
   - 일반적인 분석: Medium
   - 심층 연구: Detailed

2. **명확한 프롬프트 작성**:
   - ❌ "AI" → 너무 모호
   - ✅ "AI의 역사와 주요 기술" → 명확

3. **구체적인 요청**:
   - ❌ "이거 설명해줘"
   - ✅ "블록체인 기술의 원리, 장점, 활용 사례를 정리해줘"

## 테스트 방법

### 1. 서버 실행
```bash
cd /workspace/S13P31D202/ai
./scripts/run_server.sh
```

### 2. Python 테스트 스크립트 실행
```bash
python tests/test_text_api.py
```

### 3. 브라우저 테스트
브라우저에서 `static/test_text_stream.html` 열기

## 다른 API와의 비교

| 기능 | YouTube 분석 | 이미지 분석 | 텍스트 분석 |
|------|-------------|------------|-----------|
| 입력 | YouTube URL | 이미지 URL | 텍스트 |
| Vision 모델 | ✅ | ✅ | ❌ |
| Text 모델 | ✅ | ✅ | ✅ |
| 평균 시간 | 30-60초 | 20-35초 | 5-30초 |
| GPU 메모리 | ~10GB | ~10GB | ~4GB |
| 상세도 조절 | ❌ | ❌ | ✅ |

## 관련 문서

- [API_GUIDE.md](API_GUIDE.md) - YouTube 영상 분석 API
- [IMAGE_API_GUIDE.md](IMAGE_API_GUIDE.md) - 이미지 분석 API
- [README.md](../README.md) - 프로젝트 개요

## 문의 및 이슈

문제가 발생하면:
1. 서버 로그 확인
2. `GET /health` 엔드포인트로 상태 확인
3. Text 모델 로딩 상태 확인

## 라이선스

이 프로젝트는 기존 AI Analysis API와 동일한 라이선스를 따릅니다.
