# YouTube 영상 분석 AI 시스템

Llama 3.2 Vision과 Llama 3.1을 활용한 YouTube 영상 자동 분석 시스템 + FastAPI 서버

## 📁 프로젝트 구조

```
ai/
├── src/                    # 소스 코드
│   ├── api/               # FastAPI 서버
│   ├── core/              # 핵심 분석 로직
│   └── utils/             # 유틸리티
├── tests/                 # 테스트 파일
├── scripts/               # 실행 스크립트
├── docs/                  # 문서
├── deprecated/            # 사용 중단 코드
└── requirements.txt
```

## 개요

YouTube 영상을 다운로드하고, 주요 프레임 추출, 자막/음성 분석, 비전 AI 분석을 통해 종합적인 요약 리포트를 자동으로 생성합니다.

**FastAPI 기반 REST API**로 제공되어 쉽게 통합 가능합니다.

## 주요 기능

- **영상 다운로드**: yt-dlp를 통한 YouTube 영상 다운로드
- **지능형 프레임 추출**: PySceneDetect를 활용한 장면 전환 기반 프레임 선택
- **자막 추출**: YouTube 자막 API + Whisper 음성 인식 fallback
- **이미지 분석**: Llama 3.2 11B Vision을 통한 프레임별 시각 분석
- **종합 요약**: Llama 3.1 8B를 통한 텍스트 합성 및 요약
- **마크다운 리포트**: 분석 결과를 읽기 쉬운 마크다운 형식으로 출력

## 기술 스택

### AI 모델

| 모델 | 용도 | VRAM (INT4) |
|------|------|-------------|
| **Llama 3.2 11B Vision** | 이미지 분석 | ~10GB |
| **Llama 3.1 8B** | 텍스트 요약 | ~4GB |

### 핵심 라이브러리

- **PyTorch 2.5.1** (CUDA 12.1)
- **Transformers 4.57.1**
- **BitsAndBytes** (INT4/INT8 양자화)
- **yt-dlp** (YouTube 다운로드)
- **OpenCV + PySceneDetect** (프레임 추출)
- **OpenAI Whisper** (음성 인식)

## 설치

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

`.env` 파일 생성:

```env
HUGGINGFACE_TOKEN=your_huggingface_token_here
```

HuggingFace 토큰은 [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)에서 발급받으세요.

**중요**: Llama 모델은 Meta의 라이선스 동의가 필요합니다.
- [Llama 3.2 11B Vision](https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct)
- [Llama 3.1 8B](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)

각 모델 페이지에서 "Request access" 버튼을 클릭하여 승인받으세요.

### 3. GPU 요구사항

- **최소**: RTX 3090 24GB (INT4 양자화)
- **권장**: RTX A5000 24GB 이상
- **CUDA**: 12.1 이상

VRAM이 부족한 경우:
- Vision과 Text 모델이 순차적으로 실행되므로 피크 메모리는 ~10GB입니다
- 더 낮은 VRAM 환경에서는 한 번에 하나의 모델만 로드됩니다

## 🚀 빠른 시작

### 1. API 서버 실행

```bash
# 스크립트로 실행
./scripts/run_server.sh

# 또는 직접 실행
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

서버 실행 후:
- **API 문서**: http://localhost:8000/docs
- **상세 가이드**: [docs/API_GUIDE.md](docs/API_GUIDE.md)

### 2. API 사용 예시

```bash
# 영상 분석 요청
curl -X POST "http://localhost:8000/analyze/youtube" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "max_frames": 8
  }'

# 응답: {"task_id": "xxx-xxx-xxx", "status": "pending", ...}

# 작업 상태 조회
curl "http://localhost:8000/tasks/{task_id}"
```

### 3. Python으로 API 호출

```python
import requests
import time

API_URL = "http://localhost:8000"

# 분석 요청
response = requests.post(f"{API_URL}/analyze/youtube", json={
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "max_frames": 8
})
task_id = response.json()["task_id"]

# 완료 대기
while True:
    result = requests.get(f"{API_URL}/tasks/{task_id}").json()
    if result["status"] == "completed":
        print("✅ 완료!")
        print(result["summary"])
        break
    time.sleep(5)
```

### 4. 직접 테스트 (API 없이)

```bash
cd tests
python test_llama_video_analyzer.py
```

## 프로젝트 구조

```
ai/
├── video_analyzer/              # 핵심 라이브러리
│   ├── __init__.py
│   ├── frame_extractor.py       # 영상 다운로드 및 프레임 추출
│   ├── transcript_extractor.py  # 자막/음성 추출
│   ├── llama_vision_analyzer.py # Llama 3.2 Vision 분석기
│   └── llama_text_analyzer.py   # Llama 3.1 텍스트 분석기
├── test_llama_video_analyzer.py # 전체 파이프라인 테스트
├── requirements.txt             # 의존성 목록
└── VRAM_MEMORY_REQUIREMENTS.md  # 메모리 프로파일링
```

## 분석 파이프라인

```
YouTube URL
    ↓
[1] 영상 다운로드 (yt-dlp)
    ↓
[2] 프레임 추출 (OpenCV + PySceneDetect)
    ↓
[3] 자막 추출 (YouTube API / Whisper)
    ↓
[4] 프레임 시각 분석 (Llama 3.2 11B Vision)
    ↓
[5] 종합 요약 생성 (Llama 3.1 8B)
    ↓
[6] 마크다운 리포트 저장
```

## 출력 결과

### 디렉토리 구조

```
output/
├── video.mp4                    # 다운로드한 영상
├── frame_0001.jpg               # 추출된 프레임들
├── frame_0002.jpg
├── ...
└── analysis_report.md           # 분석 리포트
```

### 리포트 구성

- **영상 정보**: URL, 프레임 수, 자막 길이
- **종합 요약**: AI가 생성한 영상 전체 요약
- **핵심 포인트**: 주요 내용 5가지
- **프레임별 시각 분석**: 각 프레임에 대한 상세 설명
- **전체 자막**: 영상의 전체 자막 텍스트

## 성능 최적화

### 양자화 옵션

| 모드 | VRAM | 품질 | 속도 |
|------|------|------|------|
| `int4` | 최소 | 양호 | 빠름 ⭐ |
| `int8` | 중간 | 좋음 | 중간 |
| `fp16` | 최대 | 최고 | 느림 |

권장: **INT4** (품질/속도 균형)

### 메모리 최적화 팁

1. **순차 실행**: Vision과 Text 모델을 순차적으로 로드하여 메모리 절약
2. **프레임 수 조절**: `max_frames` 매개변수로 분석 프레임 수 제한
3. **배치 크기**: 프레임을 개별적으로 분석하여 안정성 확보
4. **메모리 정리**: 각 단계 후 `cleanup()` 호출 및 `torch.cuda.empty_cache()`

## 문제 해결

### CUDA Out of Memory

```python
# max_frames 줄이기
result = analyze_youtube_video(url, max_frames=5)

# 또는 더 적은 토큰 생성
vision.analyze_image(image, max_tokens=200)
```

### HuggingFace 토큰 오류

1. `.env` 파일에 `HUGGINGFACE_TOKEN` 설정 확인
2. Meta Llama 모델 접근 권한 확인
3. 토큰 유효성 확인: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### YouTube 다운로드 실패

- yt-dlp 업데이트: `pip install --upgrade yt-dlp`
- 연령 제한/지역 제한 영상은 다운로드 불가능할 수 있음

## 라이선스

이 프로젝트는 다음 모델을 사용합니다:
- Llama 3.2 & 3.1: [Meta Llama 3 Community License](https://huggingface.co/meta-llama)

## 기여

버그 리포트 및 기능 제안은 이슈로 등록해주세요.

## 개발 히스토리

- **2024-10-26**: Llama 기반 파이프라인으로 전환
- **2024-10-22**: 프로젝트 초기 설정