# YouTube Video Analysis System

Llama 3.2 11B Vision과 Llama 3.1 8B을 활용한 YouTube 영상 분석 시스템입니다.

## 📁 프로젝트 구조

```
ai/
├── src/                          # 소스 코드
│   ├── api/                      # FastAPI 관련
│   │   ├── __init__.py
│   │   ├── main.py              # API 서버 메인
│   │   └── models.py            # Pydantic 모델
│   ├── core/                     # 핵심 분석 로직
│   │   ├── __init__.py
│   │   ├── frame_extractor.py   # 영상/프레임 추출
│   │   ├── transcript_extractor.py  # 자막 추출
│   │   ├── llama_vision_analyzer.py  # Vision 분석
│   │   └── llama_text_analyzer.py    # Text 분석
│   └── utils/                    # 유틸리티
│       └── __init__.py
├── tests/                        # 테스트 파일
│   ├── test_api.py              # API 테스트
│   ├── test_llama_video_analyzer.py  # 파이프라인 테스트
│   └── legacy/                   # 구버전 테스트
├── scripts/                      # 실행 스크립트
│   └── run_server.sh            # 서버 실행 스크립트
├── docs/                         # 문서
│   ├── API_GUIDE.md             # API 가이드
│   └── README.md                # 이 파일
├── deprecated/                   # 사용 중단된 코드
│   └── old_analyzers/           # 구버전 분석기
├── .env.example                  # 환경변수 예시
├── .gitignore
├── requirements.txt
└── README.md                     # 프로젝트 메인 README
```

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# HuggingFace 토큰 설정
# .env 파일을 열어서 HUGGINGFACE_TOKEN을 실제 토큰으로 변경
```

### 3. HuggingFace 로그인

```bash
huggingface-cli login
```

---

## 📡 API 서버 사용

### 서버 실행

```bash
# 방법 1: 스크립트 사용
./scripts/run_server.sh

# 방법 2: Python 직접 실행
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000

# 방법 3: main.py 직접 실행
cd src/api && python main.py
```

### API 문서

서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 상세 가이드: [API_GUIDE.md](API_GUIDE.md)

---

## 🧪 테스트

### API 테스트

```bash
# 서버가 실행 중인 상태에서
cd tests
python test_api.py
```

### 파이프라인 테스트

```bash
cd tests
python test_llama_video_analyzer.py
```

---

## 🎯 사용 예시

### Python으로 API 호출

```python
import requests
import time

API_URL = "http://localhost:8000"

# 1. 영상 분석 요청
response = requests.post(f"{API_URL}/analyze", json={
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "max_frames": 8
})
task_id = response.json()["task_id"]

# 2. 작업 완료 대기
while True:
    result = requests.get(f"{API_URL}/tasks/{task_id}").json()

    if result["status"] == "completed":
        print("✅ 분석 완료!")
        print(result["summary"])
        break

    print(f"진행 중: {result['status']}")
    time.sleep(5)
```

### cURL로 API 호출

```bash
# 영상 분석 요청
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID", "max_frames": 8}'

# 작업 상태 조회
curl "http://localhost:8000/tasks/{task_id}"
```

---

## 🔧 시스템 요구사항

### GPU (필수)
- NVIDIA GPU with CUDA support
- VRAM 최소 12GB (INT4 양자화)
- 권장: RTX 3090 24GB 이상

### VRAM 사용량
| 양자화 | Vision 모델 | Text 모델 | 총 필요량 (순차) |
|--------|-------------|-----------|------------------|
| INT4   | ~10GB       | ~4GB      | ~10GB            |
| INT8   | ~15GB       | ~8GB      | ~15GB            |
| FP16   | ~22GB       | ~16GB     | ~22GB            |

---

## 🔑 주요 기능

### 1. 영상 분석 파이프라인
- YouTube 영상 다운로드 (yt-dlp)
- 장면 감지 기반 프레임 추출 (PySceneDetect)
- 자막 추출 (YouTube Transcript API)
- 프레임 시각 분석 (Llama 3.2 11B Vision)
- 텍스트 요약 생성 (Llama 3.1 8B)

### 2. FastAPI 서버
- 비동기 작업 처리
- 실시간 작업 상태 추적
- RESTful API
- Swagger 자동 문서화
- CORS 지원

### 3. 메모리 최적화
- INT4/INT8 양자화 지원
- 순차적 모델 로딩 (Vision → Text)
- 자동 메모리 정리
- 파일 즉시 삭제

---

## 🐛 문제 해결

### CUDA out of memory
- INT4 양자화 사용
- max_frames 줄이기 (8 → 4)
- 동시 작업 제한

### YouTube 다운로드 실패
- yt-dlp 업데이트: `pip install -U yt-dlp`
- 프록시 설정 (지역 제한 영상)

### Import 오류
- 프로젝트 루트에서 실행 확인
- PYTHONPATH 설정 확인

---

## 📚 추가 문서

- [API 가이드](API_GUIDE.md) - 상세 API 사용법
- [메인 README](../README.md) - 프로젝트 개요

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
