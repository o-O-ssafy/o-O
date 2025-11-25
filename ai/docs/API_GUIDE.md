# YouTube Video Analysis API 가이드

FastAPI 기반 YouTube 영상 분석 API 서버입니다.

## 🚀 시작하기

### 1. API 서버 실행

```bash
# 방법 1: Python으로 직접 실행
python api.py

# 방법 2: Uvicorn으로 실행
uvicorn api:app --host 0.0.0.0 --port 8000

# 방법 3: 백그라운드 실행
nohup python api.py > api.log 2>&1 &
```

서버가 실행되면 다음 주소로 접속 가능:
- API 서버: `http://localhost:8000`
- API 문서 (Swagger): `http://localhost:8000/docs`
- API 문서 (ReDoc): `http://localhost:8000/redoc`

---

## 📡 API 엔드포인트

### 1. 기본 정보

#### `GET /`
API 정보 및 사용 가능한 엔드포인트 목록 조회

**응답 예시:**
```json
{
  "name": "YouTube Video Analysis API",
  "version": "1.0.0",
  "description": "Llama 3.2 Vision + Llama 3.1을 사용한 YouTube 영상 분석",
  "endpoints": {
    "POST /analyze/youtube": "영상 분석 작업 시작 (스트리밍)",
    "POST /analyze/youtube/sync": "영상 분석 작업 시작 (동기식)",
    "GET /tasks/{task_id}": "작업 상태 및 결과 조회",
    "GET /tasks": "모든 작업 목록 조회",
    "DELETE /tasks/{task_id}": "작업 삭제"
  }
}
```

---

### 2. 영상 분석

#### `POST /analyze/youtube`
YouTube 영상 분석 작업 시작 (스트리밍)

**요청 바디:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "max_frames": 8,
  "vision_quantization": "int4",
  "text_quantization": "int4",
  "proxy": null
}
```

**파라미터:**
- `youtube_url` (필수): YouTube 영상 URL
- `max_frames` (선택, 기본값: 8): 추출할 최대 프레임 수
- `vision_quantization` (선택, 기본값: "int4"): Vision 모델 양자화 (int4/int8/fp16)
- `text_quantization` (선택, 기본값: "int4"): Text 모델 양자화 (int4/int8/fp16)
- `proxy` (선택): 프록시 서버 주소 (예: "socks5://127.0.0.1:9050")

**응답:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "영상 분석 작업이 시작되었습니다."
}
```

**cURL 예시:**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "max_frames": 8
  }'
```

---

### 3. 작업 상태 조회

#### `GET /tasks/{task_id}`
특정 작업의 상태 및 결과 조회

**응답 (진행 중):**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "analyzing_vision",
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "created_at": "2025-10-26T12:00:00",
  "completed_at": null,
  "video_info": {
    "title": "영상 제목",
    "duration": 206,
    "channel": "채널명"
  },
  "summary": null,
  "key_points": null,
  "frame_analyses": null,
  "transcript": null,
  "error": null
}
```

**응답 (완료):**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "created_at": "2025-10-26T12:00:00",
  "completed_at": "2025-10-26T12:10:00",
  "video_info": {
    "title": "영상 제목",
    "duration": 206,
    "channel": "채널명"
  },
  "summary": "영상 주제 및 개요...",
  "key_points": [
    "첫 번째 핵심 포인트",
    "두 번째 핵심 포인트"
  ],
  "frame_analyses": [
    "프레임 1 분석 결과...",
    "프레임 2 분석 결과..."
  ],
  "transcript": "영상 자막 전체 텍스트...",
  "error": null
}
```

**작업 상태 종류:**
- `pending`: 대기 중
- `downloading`: 영상 다운로드 중
- `extracting_frames`: 프레임 추출 중
- `extracting_transcript`: 자막 추출 중
- `analyzing_vision`: 프레임 시각 분석 중
- `analyzing_text`: 텍스트 요약 생성 중
- `completed`: 완료
- `failed`: 실패

**cURL 예시:**
```bash
curl -X GET "http://localhost:8000/tasks/550e8400-e29b-41d4-a716-446655440000"
```

---

### 4. 작업 목록 조회

#### `GET /tasks`
모든 작업 목록 조회

**응답:**
```json
{
  "total": 5,
  "tasks": [
    {
      "task_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
      "created_at": "2025-10-26T12:00:00",
      "completed_at": "2025-10-26T12:10:00"
    }
  ]
}
```

**cURL 예시:**
```bash
curl -X GET "http://localhost:8000/tasks"
```

---

### 5. 작업 삭제

#### `DELETE /tasks/{task_id}`
특정 작업 삭제

**응답:**
```json
{
  "message": "작업 550e8400-e29b-41d4-a716-446655440000가 삭제되었습니다."
}
```

**cURL 예시:**
```bash
curl -X DELETE "http://localhost:8000/tasks/550e8400-e29b-41d4-a716-446655440000"
```

---

### 6. 헬스 체크

#### `GET /health`
서버 및 GPU 상태 확인

**응답:**
```json
{
  "status": "healthy",
  "gpu_available": true,
  "gpu_name": "NVIDIA RTX A5000",
  "active_tasks": 2
}
```

**cURL 예시:**
```bash
curl -X GET "http://localhost:8000/health"
```

---

## 🧪 테스트

### Python 테스트 스크립트 실행

```bash
python test_api.py
```

테스트 스크립트는 다음 작업을 수행합니다:
1. 헬스 체크
2. 영상 분석 요청
3. 작업 완료 대기 (5초마다 상태 체크)
4. 결과 출력
5. 작업 목록 조회

---

## 📝 사용 예시

### Python (requests)

```python
import requests
import time

API_URL = "http://localhost:8000"

# 1. 영상 분석 요청
response = requests.post(f"{API_URL}/analyze/youtube", json={
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "max_frames": 8
})
task_id = response.json()["task_id"]

# 2. 작업 완료 대기
while True:
    response = requests.get(f"{API_URL}/tasks/{task_id}")
    result = response.json()

    if result["status"] == "completed":
        print("✅ 분석 완료!")
        print(result["summary"])
        break
    elif result["status"] == "failed":
        print(f"❌ 실패: {result['error']}")
        break

    print(f"진행 중: {result['status']}")
    time.sleep(5)
```

### JavaScript (fetch)

```javascript
const API_URL = "http://localhost:8000";

// 1. 영상 분석 요청
const response = await fetch(`${API_URL}/analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    youtube_url: "https://www.youtube.com/watch?v=VIDEO_ID",
    max_frames: 8
  })
});
const { task_id } = await response.json();

// 2. 작업 완료 대기
const checkStatus = async () => {
  const res = await fetch(`${API_URL}/tasks/${task_id}`);
  const result = await res.json();

  if (result.status === "completed") {
    console.log("✅ 분석 완료!");
    console.log(result.summary);
  } else if (result.status === "failed") {
    console.error(`❌ 실패: ${result.error}`);
  } else {
    console.log(`진행 중: ${result.status}`);
    setTimeout(checkStatus, 5000);
  }
};

checkStatus();
```

---

## 🔧 고급 설정

### 환경변수

```bash
# 포트 변경
export PORT=8080
python api.py

# HuggingFace 토큰
export HUGGINGFACE_TOKEN=your_token_here
python api.py
```

### 프록시 사용

```python
response = requests.post(f"{API_URL}/analyze/youtube", json={
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "max_frames": 8,
    "proxy": "socks5://127.0.0.1:9050"  # SSH 터널 프록시
})
```

### 양자화 설정

```python
response = requests.post(f"{API_URL}/analyze/youtube", json={
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "vision_quantization": "int8",  # 더 높은 품질 (더 많은 VRAM)
    "text_quantization": "fp16"     # 최고 품질 (가장 많은 VRAM)
})
```

**VRAM 요구사항:**
- `int4`: Vision ~10GB, Text ~4GB (권장)
- `int8`: Vision ~15GB, Text ~8GB
- `fp16`: Vision ~22GB, Text ~16GB

---

## ⚠️ 주의사항

1. **메모리 관리**: 동시에 여러 작업 실행 시 VRAM 부족 주의
2. **작업 저장**: 현재는 메모리에만 저장 (서버 재시작 시 작업 정보 손실)
3. **프로덕션 사용**: Redis 등 영구 저장소 사용 권장
4. **지역 제한**: 한국 전용 영상은 프록시 필요

---

## 🐛 문제 해결

### 1. "CUDA out of memory" 에러
- 양자화를 `int4`로 변경
- `max_frames` 줄이기
- 동시 작업 수 제한

### 2. YouTube 다운로드 실패
- 프록시 설정 확인
- `yt-dlp` 최신 버전 확인: `pip install -U yt-dlp`

### 3. 작업이 계속 진행 중
- 로그 확인: API 서버 콘솔 출력
- 타임아웃 설정 (현재 무제한)

---

## 📚 추가 문서

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
