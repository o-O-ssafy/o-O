# Image Analysis API Guide

이미지 URL을 입력받아 AI로 분석하고 마인드맵을 생성하는 API입니다.

## 기능 개요

- **이미지 URL 다운로드**: 웹에서 이미지를 자동으로 다운로드
- **Vision AI 분석**: Llama 3.2 11B Vision 모델로 이미지 내용 분석
- **마인드맵 생성**: Llama 3.1 8B로 분석 결과를 구조화된 마인드맵으로 변환
- **실시간 스트리밍**: Server-Sent Events로 진행 상황 실시간 업데이트
- **사용자 프롬프트 지원**: 특정 관점이나 질문으로 분석 가이드 가능

## API 엔드포인트

### POST /analyze/image

이미지를 분석하고 마인드맵을 생성합니다.

**Request:**

```json
{
  "image_url": "https://example.com/image.jpg",
  "user_prompt": "이 이미지의 주요 객체들을 분류해주세요" // Optional
}
```

**Response:** Server-Sent Events (SSE) 스트리밍

```
data: {"status": "started", "task_id": "...", "progress": 0, "message": "이미지 분석 시작"}

data: {"status": "downloading_image", "progress": 10, "message": "이미지 다운로드 중..."}

data: {"status": "download_complete", "progress": 30, "message": "이미지 다운로드 완료: 800x600, JPEG", "image_info": {...}}

data: {"status": "analyzing_vision", "progress": 40, "message": "Vision 모델로 이미지 분석 중..."}

data: {"status": "vision_complete", "progress": 70, "message": "Vision 분석 완료"}

data: {"status": "creating_mindmap", "progress": 80, "message": "LLM으로 마인드맵 생성 중..."}

data: {"status": "mindmap_complete", "progress": 95, "message": "마인드맵 생성 완료"}

data: {"status": "completed", "progress": 100, "message": "이미지 분석 완료!", "result": {...}}
```

**최종 Result 구조:**

```json
{
  "task_id": "uuid",
  "status": "completed",
  "image_url": "https://example.com/image.jpg",
  "created_at": "2025-11-03T12:00:00",
  "completed_at": "2025-11-03T12:00:30",
  "image_info": {
    "format": "JPEG",
    "size": [800, 600],
    "mode": "RGB",
    "width": 800,
    "height": 600
  },
  "analysis": "이 이미지는 파란 하늘 아래 산과 호수가 있는 자연 풍경입니다. 주요 객체로는...",
  "mindmap": {
    "keyword": "자연 풍경 이미지",
    "description": "https://example.com/image.jpg",
    "children": [
      {
        "keyword": "자연 요소",
        "description": "산, 호수, 하늘로 구성된 풍경",
        "children": [
          {
            "keyword": "산",
            "description": "배경에 위치한 눈 덮인 산맥, 약 2000m 높이로 추정",
            "children": null
          },
          {
            "keyword": "호수",
            "description": "전경의 맑은 파란색 호수, 약 500m 폭",
            "children": null
          }
        ]
      },
      {
        "keyword": "색상 구성",
        "description": "파란색, 초록색, 흰색 주조",
        "children": null
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
    "image_url": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "user_prompt": "이 이미지의 주요 색상과 구성을 분석해주세요"
}

# 스트리밍 요청
response = requests.post(
    f"{API_URL}/analyze/image",
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
                print("\n✅ 분석 완료!")
                print(f"마인드맵: {result['mindmap']}")
```

### 2. JavaScript (Fetch API)로 호출

```javascript
const response = await fetch("http://localhost:8000/analyze/image", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image_url: "https://example.com/image.jpg",
    user_prompt: "이 이미지를 분석해주세요"
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
        console.log("Result:", data.result);
      }
    }
  }
}
```

### 3. HTML 테스트 페이지 사용

브라우저에서 `static/test_image_stream.html` 파일을 열고:

1. 이미지 URL 입력
2. (선택) User Prompt 입력
3. "Start Analysis" 버튼 클릭
4. 실시간 진행 상황 확인
5. 생성된 마인드맵 확인

## User Prompt 활용 예시

User Prompt를 통해 분석 방향을 지정할 수 있습니다:

### 예시 1: 객체 분류
```json
{
  "image_url": "https://example.com/product.jpg",
  "user_prompt": "이 이미지의 제품들을 카테고리별로 분류하고 각 제품의 특징을 설명해주세요"
}
```

### 예시 2: 텍스트 추출
```json
{
  "image_url": "https://example.com/infographic.jpg",
  "user_prompt": "이 인포그래픽에 있는 모든 텍스트와 수치를 추출하고 체계적으로 정리해주세요"
}
```

### 예시 3: 디자인 분석
```json
{
  "image_url": "https://example.com/poster.jpg",
  "user_prompt": "이 포스터의 디자인 요소(색상, 레이아웃, 타이포그래피)를 분석해주세요"
}
```

### 예시 4: 비교 분석
```json
{
  "image_url": "https://example.com/chart.jpg",
  "user_prompt": "이 차트에서 각 항목의 수치를 비교하고 주요 인사이트를 도출해주세요"
}
```

## 지원하는 이미지 형식

- JPEG / JPG
- PNG
- GIF
- BMP
- WebP

## 제한사항

- **이미지 크기**: 최대 10MB 권장
- **타임아웃**: 약 2-3분 (이미지 크기에 따라 다름)
- **URL 접근**: 공개 URL만 지원 (인증이 필요한 URL은 불가)
- **처리 속도**:
  - 다운로드: ~1-5초
  - Vision 분석: ~10-20초
  - 마인드맵 생성: ~5-10초
  - **총 소요 시간**: 약 20-35초

## 테스트 방법

### 1. 서버 실행
```bash
cd /workspace/S13P31D202/ai
./scripts/run_server.sh
```

### 2. Python 테스트 스크립트 실행
```bash
python tests/test_image_api.py
```

### 3. 브라우저 테스트
브라우저에서 `static/test_image_stream.html` 열기

### 4. cURL 테스트
```bash
curl -X POST http://localhost:8000/analyze/image \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://picsum.photos/800/600",
    "user_prompt": "이 이미지를 분석해주세요"
  }'
```

## 에러 처리

### 이미지 다운로드 실패
```json
{
  "status": "failed",
  "error": "이미지 다운로드 실패"
}
```

**원인:**
- 잘못된 URL
- 네트워크 연결 문제
- 접근 권한 없음 (private URL)
- 지원하지 않는 파일 형식

**해결:**
- URL 확인
- 공개 URL 사용
- 지원하는 이미지 형식 확인

### Vision 분석 실패
```json
{
  "status": "failed",
  "error": "Vision 모델 분석 중 오류 발생"
}
```

**원인:**
- GPU 메모리 부족
- 모델 로드 실패
- 이미지 파일 손상

**해결:**
- 서버 재시작
- GPU 상태 확인 (`/health` 엔드포인트)
- 다른 이미지로 시도

### 마인드맵 생성 실패

마인드맵 생성이 실패해도 폴백(fallback) 마인드맵이 자동으로 생성됩니다.

```json
{
  "mindmap": {
    "keyword": "이미지 분석",
    "description": "https://example.com/image.jpg",
    "children": [
      {
        "keyword": "분석 결과",
        "description": "[Vision 모델의 분석 텍스트]",
        "children": null
      }
    ]
  }
}
```

## 성능 최적화 팁

1. **이미지 크기 최적화**: 800x600 ~ 1920x1080 권장
2. **병렬 처리 제한**: 동시에 1-2개 요청만 처리 (GPU 메모리)
3. **캐싱**: 동일 이미지는 결과 캐싱 고려
4. **타임아웃 설정**: 클라이언트에서 충분한 타임아웃 설정 (최소 3분)

## API 응답 시간 예시

| 이미지 크기 | 다운로드 | Vision 분석 | 마인드맵 | 총 시간 |
|------------|---------|------------|---------|--------|
| 500KB      | 2초     | 15초       | 8초     | 25초   |
| 1MB        | 3초     | 18초       | 8초     | 29초   |
| 3MB        | 5초     | 22초       | 10초    | 37초   |

## 다음 단계

- [ ] Redis 기반 결과 캐싱
- [ ] 이미지 배치 처리 지원
- [ ] 이미지 전처리 옵션 (리사이징, 크롭)
- [ ] 여러 이미지 비교 분석
- [ ] PDF/문서 이미지 OCR 통합

## 관련 문서

- [API_GUIDE.md](API_GUIDE.md) - YouTube 영상 분석 API
- [README.md](../README.md) - 프로젝트 개요
- [STRUCTURE.md](../docs/STRUCTURE.md) - 프로젝트 구조

## 문의 및 이슈

문제가 발생하면 다음을 확인하세요:

1. 서버 로그: `logs/` 디렉토리
2. GPU 상태: `GET /health` 엔드포인트
3. 모델 로딩 상태: 서버 시작 시 콘솔 출력

## 라이선스

이 프로젝트는 기존 YouTube Analysis API와 동일한 라이선스를 따릅니다.
