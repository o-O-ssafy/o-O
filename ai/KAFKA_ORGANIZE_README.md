# 🧠 Kafka 기반 AI 마인드맵 정리 기능

## 📋 개요

이 기능은 마인드맵의 text 노드를 LLM으로 자동 정리하고 최적화하는 기능입니다.
- **text 노드**: 키워드와 메모를 개선하고, 유사 노드를 통합
- **image/video 노드**: 내용과 위치 모두 변경 없이 그대로 유지

---

## 🏗️ 아키텍처

```
[mindmap-service]
       ↓ (발행)
ai.organize.request
       ↓ (구독)
[ai-analysis-service]
  ├─ text 노드만 추출
  ├─ Llama 3.1 LLM으로 정리
  ├─ image/video 노드는 원본 유지
  └─ 정리된 결과 병합
       ↓ (발행)
ai.organize.result
       ↓ (구독)
[mindmap-service]
```

---

## 📡 Kafka 토픽

| 토픽명 | 역할 | 발행자 | 구독자 |
|--------|------|--------|--------|
| `ai.organize.request` | 마인드맵 정리 요청 | mindmap-service | ai-analysis-service |
| `ai.organize.result` | 정리된 마인드맵 결과 | ai-analysis-service | mindmap-service |

---

## 📥 요청 데이터 (`ai.organize.request`)

```json
{
  "workspaceId": 101,
  "nodes": [
    {
      "nodeId": 1,
      "parentId": null,
      "type": "text",
      "keyword": "AI 협업 아이디어",
      "memo": "AI를 활용해 팀의 아이디어를 자동 분류하고 연결하는 브레인스토밍 도구를 구상합니다.",
      "x": 300.0,
      "y": 200.0,
      "color": "#3b82f6"
    },
    {
      "nodeId": 2,
      "parentId": 1,
      "type": "image",
      "keyword": "https://example.com/image.png",
      "memo": "예시 이미지",
      "x": 500.0,
      "y": 150.0,
      "color": "#10b981"
    }
  ]
}
```

### 필드 설명

- `workspaceId` (int): 워크스페이스 ID
- `nodes` (array): 전체 노드 리스트
  - `nodeId` (int): 노드 고유 ID (변경 안 됨)
  - `parentId` (int|null): 부모 노드 ID (변경 가능)
  - `type` (string): "text", "image", "video"
  - `keyword` (string): 노드 키워드
  - `memo` (string): 노드 메모/설명
  - `x`, `y` (float): 좌표 (변경 안 됨)
  - `color` (string): 노드 색상 (변경 안 됨)

---

## 📤 결과 데이터 (`ai.organize.result`)

```json
{
  "workspaceId": 101,
  "status": "COMPLETED",
  "nodes": [
    {
      "nodeId": 1,
      "parentId": null,
      "type": "text",
      "keyword": "AI 협업 정리 도구",
      "memo": "AI가 아이디어를 자동으로 분류하고 관계를 시각화하는 협업 시스템입니다.",
      "x": 300.0,
      "y": 200.0,
      "color": "#3b82f6"
    },
    {
      "nodeId": 2,
      "parentId": 1,
      "type": "image",
      "keyword": "https://example.com/image.png",
      "memo": "예시 이미지",
      "x": 500.0,
      "y": 150.0,
      "color": "#10b981"
    }
  ],
  "analyzedAt": "2025-11-11T13:00:10+09:00"
}
```

### 필드 설명

- `workspaceId` (int): 워크스페이스 ID
- `status` (string): "COMPLETED" 또는 "FAILED"
- `nodes` (array): 정리된 노드 리스트
- `analyzedAt` (string): 분석 완료 시간 (ISO 8601 format)
- `error` (string, optional): 실패 시 에러 메시지

---

## 🔧 AI 처리 규칙

### 1. 처리 대상
- ✅ **text 노드**: 키워드와 메모를 개선하고, 유사 노드 통합 가능
- 🔒 **루트 노드 (parentId=null)**: keyword와 memo 변경 금지 (원본 유지)
- ❌ **image 노드**: 변경 없이 그대로 유지
- ❌ **video 노드**: 변경 없이 그대로 유지

### 2. 가능한 변화
- `keyword`: 더 간결하고 명확하게 수정 (2-5 단어 권장) - **루트 노드 제외**
- `memo`: 더 정보적이고 잘 작성된 설명으로 개선 - **루트 노드 제외**
- `parentId`: 부모 노드가 삭제되면 다른 노드로 재배치
- **노드 개수**: 유사한 노드가 통합되어 줄어들 수 있음 - **루트 노드는 통합 불가**

### 3. 유지되는 값
- `nodeId`: 항상 동일하게 유지
- `x`, `y`: 좌표 변경 없음 (시각적 배치 유지)
- `color`: 색상 변경 없음
- `type`: 타입 변경 없음
- **루트 노드 (parentId=null)의 keyword와 memo**: 원본 그대로 유지

### 4. LLM 동작
- 전체 노드 구조를 분석하여 맥락 파악
- text 노드의 keyword와 memo를 더 명확하게 다듬음 (루트 노드 제외)
- 중복되거나 유사한 노드는 통합 (루트 노드 제외)
- 논리적 계층 구조 유지
- **루트 노드는 절대 변경하지 않음** (프롬프트 + 코드 레벨 이중 보호)

---

## 🚀 사용 방법

### 1. 환경 변수 설정 (`.env`)

```bash
# Kafka 서버
KAFKA_BOOTSTRAP_SERVERS=k13d202.p.ssafy.io:9092

# Organize 토픽
KAFKA_ORGANIZE_REQUEST_TOPIC=ai.organize.request
KAFKA_ORGANIZE_RESULT_TOPIC=ai.organize.result
```

### 2. AI 서버 실행

```bash
# 서버 시작 (자동으로 Organize Consumer도 시작됨)
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

서버 시작 시 로그:
```
Analysis Kafka Consumer 시작 중...
✅ Analysis Kafka Consumer 시작 완료
Organize Kafka Consumer 시작 중...
✅ Organize Kafka Consumer 시작 완료
```

### 3. 테스트 (Producer)

```bash
# 정리 요청 전송
python test_kafka_organize.py
```

테스트 시나리오:
1. **다양한 타입의 노드**: text + image + video 혼합
2. **text 노드만**: text 노드만 있는 경우

### 4. 결과 확인 (Consumer)

```bash
# 결과 수신 및 출력
python test_kafka_organize_consumer.py
```

출력 예시:
```
📬 메시지 수신 [2025-11-11 13:00:10]
================================================================================
📊 Offset: 123, Partition: 0
🏢 Workspace ID: 101
✅ Status: COMPLETED
🕐 Analyzed At: 2025-11-11T13:00:10+09:00

📌 노드 개수: 5개
   - text: 3개
   - image: 1개
   - video: 1개

📝 정리된 text 노드:
--------------------------------------------------------------------------------

  [Node 1]
  └─ Parent: None
  └─ Keyword: AI 협업 정리 도구
  └─ Memo: AI가 아이디어를 자동으로 분류하고 관계를 시각화하는 협업 시스템입니다.
  └─ Position: (300.0, 200.0)
  └─ Color: #3b82f6
```

---

## 📁 주요 파일

| 파일 | 설명 |
|------|------|
| [.env](.env) | Kafka 토픽 설정 |
| [src/api/models.py](src/api/models.py) | `OrganizeNode`, `OrganizeRequest`, `OrganizeResult` 모델 |
| [src/core/llama_text_analyzer.py](src/core/llama_text_analyzer.py) | `organize_mindmap()` 메서드 |
| [src/kafka/analysis_processor.py](src/kafka/analysis_processor.py) | `process_organize()` 메서드 |
| [src/kafka/kafka_handler.py](src/kafka/kafka_handler.py) | Multi-topic 지원 |
| [src/api/main.py](src/api/main.py) | Organize Consumer 시작/종료 |
| [test_kafka_organize.py](test_kafka_organize.py) | 테스트 Producer |
| [test_kafka_organize_consumer.py](test_kafka_organize_consumer.py) | 테스트 Consumer |

---

## 🔍 디버깅

### 1. 로그 확인

AI 서버 로그에서 Organize 처리 과정 확인:
```
ORGANIZE 시작: workspaceId=101, 전체 노드 수=6
📝 text 노드: 4개, 🖼️ image/video 노드: 2개
🤖 LLM으로 text 노드 정리 중...
✅ 정리된 text 노드: 3개 (원본: 4개)
📊 최종 노드 수: 5개
✅ ORGANIZE 완료: 5개 노드 반환
```

### 2. 에러 처리

실패 시 응답:
```json
{
  "workspaceId": 101,
  "status": "FAILED",
  "nodes": [...],  // 원본 노드 그대로 반환
  "analyzedAt": "2025-11-11T13:00:10+09:00",
  "error": "LLM 응답을 JSON으로 파싱할 수 없습니다"
}
```

### 3. Kafka 토픽 모니터링

```bash
# 요청 토픽 모니터링
kafka-console-consumer --bootstrap-server k13d202.p.ssafy.io:9092 \
  --topic ai.organize.request --from-beginning

# 결과 토픽 모니터링
kafka-console-consumer --bootstrap-server k13d202.p.ssafy.io:9092 \
  --topic ai.organize.result --from-beginning
```

---

## 💡 주의사항

1. **🔒 루트 노드 보호**: parentId가 null인 루트 노드는 keyword와 memo가 절대 변경되지 않습니다.
   - LLM 프롬프트에 명시
   - 코드 레벨에서 강제 복원 (이중 보호)
   - 변경 감지 시 로그 출력

2. **nodeId 보존**: LLM이 nodeId를 변경하지 않도록 프롬프트에 명시되어 있습니다.

3. **좌표 복원**: LLM 응답에는 x, y가 없으므로, 코드에서 원본 노드의 좌표를 복원합니다.

4. **타입 보존**: image/video 노드는 처리하지 않고 원본 그대로 반환합니다.

5. **실패 시 원본 반환**: 오류 발생 시 원본 노드를 그대로 반환하여 데이터 손실을 방지합니다.

---

## 🎯 예상 결과

### 입력 예시
```json
{
  "nodeId": 1,
  "keyword": "AI 협업 아이디어",
  "memo": "AI를 활용해 팀의 아이디어를 자동 분류하고 연결하는 브레인스토밍 도구를 구상합니다."
}
```

### 출력 예시 (개선됨)
```json
{
  "nodeId": 1,
  "keyword": "AI 협업 정리 도구",
  "memo": "AI가 아이디어를 자동으로 분류하고 관계를 시각화하는 협업 시스템입니다."
}
```

---

## 📞 문의

이슈가 있거나 개선 사항이 있으면 팀에 문의하세요!
