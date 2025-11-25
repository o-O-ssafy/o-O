# Kafka 테스트 가이드

AI 분석 서버의 Kafka 통합 기능을 테스트하는 방법입니다.

## 사전 준비

### 1. AI 서버 실행
먼저 AI 서버를 실행해야 Kafka Consumer가 메시지를 수신합니다.

```bash
# 가상환경 활성화
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate  # Windows

# 서버 실행
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

서버가 시작되면 다음 로그가 보여야 합니다:
```
✅ Kafka Consumer 시작 완료
```

### 2. Kafka UI 준비
브라우저에서 Kafka UI를 열어둡니다:
- URL: http://k13d202.p.ssafy.io:8080 (또는 설정된 UI 주소)
- Topics 메뉴에서 `ai.analysis.result` 토픽을 선택

---

## 테스트 방법

### 방법 1: Producer 스크립트로 메시지 전송 (추천)

#### 1단계: Producer 실행
```bash
python test_kafka_producer.py
```

#### 2단계: 테스트할 항목 선택
```
🧪 Kafka AI 분석 요청 테스트
============================================================

📋 INITIAL 분석 (최초 컨텐츠 분석)
  1. TEXT    - 텍스트 프롬프트로 마인드맵 생성
  2. VIDEO   - YouTube 영상 분석
  3. IMAGE   - 이미지 URL 분석

📋 CONTEXTUAL 분석 (노드 확장)
  4. TEXT    - 부모 노드 문맥 기반 확장
  5. VIDEO   - YouTube 영상 기반 확장
  6. IMAGE   - 이미지 기반 확장

📋 기타
  7. 전체 테스트 (1~6 순차 실행)
  0. 종료
============================================================

선택 (0-7): 1
```

#### 3단계: 결과 확인
- **방법 A**: AI 서버 로그 확인
  ```bash
  # 서버 터미널에서 로그 확인
  INFO:     INITIAL 분석 시작: workspaceId=test-workspace-001, ...
  INFO:     ✅ INITIAL 분석 완료 (TEXT): 8개 노드 생성
  ```

- **방법 B**: Consumer 스크립트로 실시간 모니터링
  ```bash
  # 새 터미널 열기
  python test_kafka_consumer.py
  ```

- **방법 C**: Kafka UI에서 확인
  1. `ai.analysis.result` 토픽 선택
  2. Messages 탭에서 최신 메시지 확인

---

### 방법 2: Consumer 스크립트로 실시간 모니터링

#### 1단계: Consumer 실행
```bash
python test_kafka_consumer.py
```

다음과 같이 대기 상태가 됩니다:
```
✅ Kafka Consumer 연결 성공
🎧 AI 분석 결과를 실시간으로 수신 중...
   (Ctrl+C로 종료)
```

#### 2단계: Producer로 메시지 전송
다른 터미널에서:
```bash
python test_kafka_producer.py
```

#### 3단계: Consumer에서 결과 확인
Consumer 터미널에 자동으로 결과가 출력됩니다:
```
================================================================================
⏰ 수신 시각: 2025-01-10 14:30:25
================================================================================

✅ 상태: SUCCESS
📂 Workspace ID: test-workspace-001

📝 AI 요약:
   인공지능의 발전 과정과 미래 전망에 대한 체계적인 분석

🌳 생성된 노드: 8개

노드 목록:
  1. [temp-1] 인공지능 역사
     └─ 부모: 100
     └─ 설명: AI 기술의 발전 과정
  ...
```

---

## 테스트 시나리오별 예상 결과

### 1. INITIAL - TEXT
**입력:**
- contentType: TEXT
- prompt: "인공지능의 발전 과정과 미래 전망에 대해 마인드맵을 만들어줘"

**예상 결과:**
- aiSummary: AI 발전 과정 요약
- nodes: 5~15개 (계층적 구조)

### 2. INITIAL - VIDEO
**입력:**
- contentType: VIDEO
- contentUrl: YouTube URL
- prompt: "영상 요약"

**예상 동작:**
1. YouTube 자막 추출 (ngrok 서버 호출)
2. LLM으로 마인드맵 생성

**주의:** ngrok 서버가 실행 중이어야 합니다!

### 3. INITIAL - IMAGE
**입력:**
- contentType: IMAGE
- contentUrl: 이미지 URL

**예상 동작:**
1. 이미지 다운로드
2. Vision 모델(Llama 3.2 11B)로 이미지 분석
3. LLM으로 마인드맵 생성

### 4. CONTEXTUAL - TEXT
**입력:**
- nodes: 부모 노드 체인
- nodeId: 확장할 노드 ID

**예상 결과:**
- 정확히 3개 자식 노드

### 5. CONTEXTUAL - VIDEO
**입력:**
- nodes: 부모 노드들 (keyword에 YouTube URL)
- nodeId: 확장할 노드 ID

**예상 동작:**
1. keyword에서 YouTube URL 추출
2. 자막 추출
3. 부모 문맥 + 컨텐츠로 3개 노드 생성

### 6. CONTEXTUAL - IMAGE
**입력:**
- nodes: 부모 노드들 (keyword에 이미지 URL)
- nodeId: 확장할 노드 ID

**예상 동작:**
1. keyword에서 이미지 URL 추출
2. Vision 분석
3. 부모 문맥 + 이미지 분석으로 3개 노드 생성

---

## 문제 해결

### 1. "Kafka Producer 연결 실패"
**원인:** Kafka 서버에 접속할 수 없음

**해결:**
```bash
# Kafka 서버 상태 확인
ping k13d202.p.ssafy.io

# .env 파일의 KAFKA_BOOTSTRAP_SERVERS 확인
cat .env | grep KAFKA
```

### 2. "메시지를 보냈는데 결과가 안 옴"
**원인:** AI 서버가 실행되지 않았거나 Consumer가 시작되지 않음

**해결:**
1. AI 서버 로그 확인
   ```bash
   # 서버 터미널에서
   # "✅ Kafka Consumer 시작 완료" 메시지 확인
   ```

2. 서버 재시작
   ```bash
   # Ctrl+C로 서버 종료
   uvicorn src.api.main:app --reload
   ```

### 3. "자막 추출 실패" (VIDEO 타입)
**원인:** ngrok 서버가 실행되지 않음

**해결:**
1. ngrok 서버 실행 확인
2. .env의 `NGROK_SUBTITLE_SERVER_URL` 확인

### 4. "이미지 다운로드 실패" (IMAGE 타입)
**원인:** 이미지 URL이 잘못되었거나 접근 불가

**해결:**
- 브라우저에서 이미지 URL 직접 접속 테스트
- 공개된 이미지 URL 사용

### 5. "Vision 분석 실패" (IMAGE 타입)
**원인:** Vision 모델이 로드되지 않음

**해결:**
```bash
# 서버 로그에서 모델 로딩 확인
# "🚀 Llama Vision 모델 로딩 중" 메시지 확인
```

---

## 샘플 메시지 형식

### INITIAL 요청
```json
{
  "workspaceId": "workspace-123",
  "nodeId": 100,
  "analysisType": "INITIAL",
  "contentType": "TEXT",
  "contentUrl": null,
  "prompt": "인공지능에 대해 설명해줘"
}
```

### INITIAL 응답
```json
{
  "workspaceId": "workspace-123",
  "aiSummary": "인공지능의 개념과 응용",
  "status": "SUCCESS",
  "nodes": [
    {
      "tempId": "temp-1",
      "parentId": 100,
      "keyword": "AI 기초",
      "memo": "인공지능의 기본 개념"
    }
  ]
}
```

### CONTEXTUAL 요청
```json
{
  "workspaceId": "workspace-123",
  "nodeId": 200,
  "analysisType": "CONTEXTUAL",
  "contentType": "TEXT",
  "nodes": [
    {"nodeId": 100, "keyword": "AI", "memo": "인공지능"},
    {"nodeId": 200, "keyword": "머신러닝", "memo": "기계 학습"}
  ]
}
```

### CONTEXTUAL 응답
```json
{
  "workspaceId": "workspace-123",
  "nodeId": 200,
  "status": "SUCCESS",
  "nodes": [
    {"keyword": "지도 학습", "memo": "레이블 데이터 기반"},
    {"keyword": "비지도 학습", "memo": "레이블 없는 데이터"},
    {"keyword": "강화 학습", "memo": "보상 기반 학습"}
  ]
}
```

---

## 유용한 명령어

### Kafka 토픽 메시지 직접 확인 (CLI)
서버에 kafka CLI 도구가 설치되어 있다면:

```bash
# Request 토픽 확인
kafka-console-consumer.sh \
  --bootstrap-server k13d202.p.ssafy.io:9092 \
  --topic ai.analysis.request \
  --from-beginning

# Result 토픽 확인
kafka-console-consumer.sh \
  --bootstrap-server k13d202.p.ssafy.io:9092 \
  --topic ai.analysis.result \
  --from-beginning
```

### 서버 로그 레벨 조정
더 자세한 로그를 보려면:

```python
# src/api/main.py 수정
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 참고 사항

- **처리 시간**: TEXT는 5~30초, VIDEO/IMAGE는 1~5분 소요될 수 있음
- **동시 처리**: Kafka Consumer는 하나의 스레드에서 순차 처리
- **재시도**: 실패 시 자동 재시도 없음 (수동으로 재전송 필요)
- **로그 위치**: AI 서버 콘솔 출력으로만 확인 가능
