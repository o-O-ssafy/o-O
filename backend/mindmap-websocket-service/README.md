# Mindmap WebSocket Service

o-O 플랫폼의 실시간 마인드맵 협업 서버

## 기술 스택

- **Node.js 20+**: JavaScript 런타임
- **Y.js**: CRDT 기반 실시간 협업 라이브러리
- **WebSocket**: 실시간 양방향 통신
- **Kafka**: 비동기 이벤트 스트리밍 (Phase 2)

## 주요 기능

### 1. 실시간 협업
- Y.js CRDT를 통한 충돌 없는 동시 편집
- 워크스페이스별 독립적인 Y.Doc 관리
- 노드 추가/수정/삭제 실시간 동기화

### 2. Awareness (사용자 인식)
- **커서 위치 공유**: 팀원들의 마우스 커서 실시간 표시
- **임시 채팅**: "/" 입력 시 Figma 스타일 임시 채팅
- **사용자 정보**: 접속 중인 팀원 목록 및 상태

### 3. Kafka 통합
- 주기적 배치 전송 (기본 5초)
- 임계값 초과 시 즉시 전송 (10개 이상 변경)
- Spring Boot 서비스로 영속성 위임

## 디렉토리 구조

```
mindmap-websocket-service/
├── src/
│   ├── server.js           # 메인 WebSocket 서버
│   ├── kafka/
│   │   ├── producer.js     # Kafka Producer (노드 변경사항 전송)
│   │   └── consumer.js     # Kafka Consumer (AI 업데이트 수신)
│   ├── yjs/
│   │   ├── ydoc-manager.js # Y.Doc 인스턴스 관리
│   │   └── awareness.js    # Awareness 관리
│   └── utils/
│       └── logger.js       # 로깅 유틸리티
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## 환경 변수

```bash
# Server
PORT=3000
NODE_ENV=production

# Kafka Producer (노드 변경사항 전송)
KAFKA_BROKERS=kafka-broker:9092
KAFKA_CLIENT_ID=mindmap-websocket-service
KAFKA_TOPIC_NODE_EVENTS=mindmap.node.events

# Kafka Consumer (AI 분석 결과 수신)
KAFKA_CONSUMER_GROUP=mindmap-websocket-consumer
KAFKA_TOPIC_NODE_UPDATE=mindmap.node.update

# Y.js
YDOC_GC_ENABLED=true
YDOC_PERSISTENCE_INTERVAL=5000
YDOC_IDLE_TIMEOUT_MS=300000  # 5분(300000ms) 동안 접속자 없으면 Y.Doc 자동 삭제

# Logging
LOG_LEVEL=info
```

## 설치 및 실행

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 모드 실행 (hot reload)
npm run dev

# 프로덕션 모드 실행
npm start
```

### Docker

```bash
# 이미지 빌드
docker build -t mindmap-websocket-service .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  mindmap-websocket-service
```

## API 엔드포인트

### WebSocket 연결

```
ws://host:3000/ws?workspace=<workspace_id>
```

**클라이언트 예시:**

```javascript
const ws = new WebSocket('ws://localhost:3000/ws?workspace=123');

ws.onopen = () => {
  console.log('Connected to mindmap collaboration server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### HTTP 엔드포인트

#### Health Check
```
GET /health
```

**응답:**
```json
{
  "status": "healthy",
  "service": "mindmap-websocket-service",
  "timestamp": "2025-11-06T01:30:00.000Z",
  "stats": {
    "ydoc": { "totalDocs": 5, "workspaces": [...] },
    "awareness": { "totalWorkspaces": 5, "workspaces": [...] },
    "kafka": { "enabled": false, "connected": false }
  }
}
```

#### Stats
```
GET /stats
```

## Awareness 메시지 포맷

클라이언트는 다음과 같은 형식으로 awareness 메시지를 전송할 수 있습니다:

### 커서 이동
```json
{
  "type": "awareness",
  "event": "cursor:move",
  "data": {
    "x": 250,
    "y": 120
  }
}
```

### 임시 채팅 (/ 입력 시)
```json
{
  "type": "awareness",
  "event": "chat:temp",
  "data": {
    "message": "회의록 정리 필요",
    "position": { "x": 300, "y": 150 }
  }
}
```

### 임시 채팅 제거
```json
{
  "type": "awareness",
  "event": "chat:clear"
}
```

### 사용자 정보
```json
{
  "type": "awareness",
  "event": "user:info",
  "data": {
    "userId": "user_123",
    "userName": "홍길동",
    "userEmail": "hong@example.com",
    "userColor": "#3b82f6"
  }
}
```

## Kafka 메시지 포맷

Kafka로 전송되는 노드 변경 이벤트:

```json
[
  {
    "operation": "ADD",
    "nodeId": "n1",
    "workspaceId": 123,
    "type": "text",
    "keyword": "AI 혁신 포럼",
    "memo": "발표 자료 준비",
    "x": 200,
    "y": 120,
    "color": "#ffd700",
    "createdBy": "user_123",
    "timestamp": "2025-11-06T01:30:00.000Z"
  },
  {
    "operation": "UPDATE",
    "nodeId": "n2",
    "workspaceId": 123,
    "x": 240,
    "y": 130,
    "timestamp": "2025-11-06T01:30:05.000Z"
  }
]
```

## 아키텍처

### 전체 데이터 플로우

```
┌─────────────────────────────────────────────────────────────┐
│                   초기 데이터 로드 플로우                       │
└─────────────────────────────────────────────────────────────┘
Client
  ↓ 1. HTTP GET /mindmap/{workspaceId}/nodes (Spring API)
  ↓    초기 노드 데이터 로드 (JSON)
  ↓ 2. Y.Doc 로컬 초기화
  ↓ 3. WebSocket 연결 (ws://gateway/mindmap/ws?workspace=123)
  ↓    서버는 빈 Y.Doc 또는 다른 클라이언트와 동기화
  ↓ 4. Y.js 자동 동기화


┌─────────────────────────────────────────────────────────────┐
│                   실시간 협업 플로우                           │
└─────────────────────────────────────────────────────────────┘
Client A → 노드 추가/수정
  ↓
Node.js WebSocket Server (Y.js CRDT 동기화)
  ↓ 자동으로 다른 클라이언트들에게 전파
  ↓ 변경사항 누적 (메모리)
  ↓ 5초마다 또는 10개 이상 시
  ↓
Kafka Producer → mindmap.node.events
  ↓
Spring Mindmap Service (Kafka Consumer)
  ↓ MongoDB BulkWrite
  ↓
MongoDB (영속 저장)


┌─────────────────────────────────────────────────────────────┐
│              이미지/영상 AI 분석 플로우                         │
└─────────────────────────────────────────────────────────────┘
Client → 이미지/영상 노드 추가
  ↓
Node.js (Y.js 동기화)
  ↓ Kafka: mindmap.node.events
  ↓
Spring Mindmap Service
  ↓ MongoDB 저장 (contentUrl, analysisStatus: PENDING)
  ↓ Kafka: ai.analysis.request → RunPod
  ↓
RunPod AI 분석 완료
  ↓ Kafka: ai.analysis.result
  ↓
Spring Mindmap Service (Kafka Consumer)
  ↓ MongoDB 업데이트 (aiSummary, analysisStatus: DONE)
  ↓ Kafka: mindmap.node.update (새로운 토픽)
  ↓
Node.js Kafka Consumer
  ↓ Y.Doc 업데이트
  ↓ 모든 클라이언트 자동 동기화 ✨
```

### 구현 상태

- ✅ Y.js WebSocket 서버 (실시간 협업)
- ✅ Awareness (커서/채팅/사용자 정보)
- ✅ Kafka Producer (노드 변경사항 전송)
- ✅ Kafka Consumer (AI 업데이트 수신)
- ✅ Threshold auto-trigger (10개 이상 즉시 전송)
- ✅ 클라이언트 HTTP 초기 로드 (Stateless 서버)
- ⏳ Spring Boot Mindmap Service 구현 필요
- ⏳ Kafka 브로커 구축 필요

## 성능 최적화

- **배치 전송**: 변경사항을 모아서 전송하여 네트워크/DB 부하 감소
- **파티션 키**: workspaceId를 파티션 키로 사용하여 순서 보장
- **메모리 관리**: Y.Doc GC 활성화로 메모리 사용량 최적화
- **비동기 처리**: Kafka를 통한 비동기 영속화로 응답 시간 단축

## 모니터링

### 로그 레벨
- `debug`: 상세한 디버깅 정보 (커서 이동, 세부 변경사항)
- `info`: 일반 정보 (연결, 배치 전송)
- `warn`: 경고 (설정 누락, 재시도)
- `error`: 오류 (Kafka 연결 실패, 예외)

### 주요 메트릭
- 활성 워크스페이스 수
- 워크스페이스별 노드 수
- 대기 중인 변경사항 수
- Kafka 연결 상태

## 트러블슈팅

### WebSocket 연결 실패
```
ERROR: Connection rejected: missing workspace parameter
```
→ URL에 `?workspace=<id>` 파라미터를 추가하세요.

### Kafka 연결 실패
```
WARN: KAFKA_BROKERS not set. Running in stub mode
```
→ Phase 1에서는 정상입니다. Phase 2에서 Kafka 브로커 설정 후 활성화됩니다.

## 라이센스

MIT License - o-O Team
