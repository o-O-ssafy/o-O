#!/bin/bash
# FastAPI 서버 실행 스크립트

cd "$(dirname "$0")/.." || exit

echo "🚀 Starting YouTube Video Analysis API Server..."
echo "================================================"
echo ""

# 환경변수 로드
if [ -f .env ]; then
    echo "✅ Loading .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# 포트 설정 (기본값: 8000)
PORT=${PORT:-8000}

echo "📡 Server will run on: http://0.0.0.0:$PORT"
echo "📖 API Docs: http://localhost:$PORT/docs"
echo "📖 ReDoc: http://localhost:$PORT/redoc"
echo ""
echo "Running in background with nohup"
echo "Check logs: tail -f nohup.out"
echo "================================================"
echo ""

# 가상환경 활성화
source venv/bin/activate

# 서버 실행 (백그라운드, nohup)
nohup python -m uvicorn src.api.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --timeout-keep-alive 1800 \
    --timeout-graceful-shutdown 30 > nohup.out 2>&1 &

echo "✅ Server started in background (PID: $!)"
echo "📋 To stop: kill $!"
