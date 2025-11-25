"""
유튜브 자막 추출 모듈 (ngrok 서버 사용)
- 로컬 컴퓨터에서 실행 중인 ngrok 서버로 자막 요청
"""
import logging
import os
import requests
from typing import List, Dict, Optional
import re
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

logger = logging.getLogger(__name__)


class TranscriptExtractor:
    """유튜브 자막 추출기 (ngrok 서버 사용)"""

    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """유튜브 URL에서 video_id 추출"""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'^([0-9A-Za-z_-]{11})$'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    @staticmethod
    def get_transcript(url: str, languages: List[str] = ['ko', 'en']) -> Dict:
        """
        ngrok 서버로부터 유튜브 자막 추출

        Args:
            url: 유튜브 URL
            languages: 우선순위 언어 리스트 (ngrok 서버가 처리)

        Returns:
            {
                'success': bool,
                'method': 'ngrok_server',
                'language': str,
                'segments': [{'start': float, 'duration': float, 'text': str}],
                'full_text': str,
                'video_id': str
            }
        """
        video_id = TranscriptExtractor.extract_video_id(url)
        if not video_id:
            return {
                'success': False,
                'error': 'Invalid YouTube URL'
            }

        # ngrok 서버 URL 가져오기
        ngrok_server_url = os.getenv('NGROK_SUBTITLE_SERVER_URL')

        if not ngrok_server_url:
            logger.error("NGROK_SUBTITLE_SERVER_URL 환경변수가 설정되지 않았습니다.")
            return {
                'success': False,
                'error': 'NGROK_SUBTITLE_SERVER_URL not configured in .env file',
                'video_id': video_id
            }

        # ngrok 서버 URL 정리 (trailing slash 제거)
        ngrok_server_url = ngrok_server_url.rstrip('/')

        try:
            # ngrok 서버에 자막 요청
            endpoint = f"{ngrok_server_url}/youtube/subtitles"

            logger.info(f"ngrok 서버로 자막 요청: {endpoint}")
            logger.info(f"YouTube URL: {url}")

            response = requests.post(
                endpoint,
                json={"url": url},
                timeout=30  # 30초 타임아웃
            )

            response.raise_for_status()  # HTTP 에러 발생시 예외 발생

            data = response.json()

            # 응답 데이터 검증
            if 'video_id' not in data or 'subtitles' not in data:
                return {
                    'success': False,
                    'error': 'Invalid response format from ngrok server',
                    'video_id': video_id
                }

            # segments 형식으로 변환
            segments = []
            for subtitle in data['subtitles']:
                segments.append({
                    'text': subtitle['text'],
                    'start': subtitle['start'],
                    'duration': subtitle['duration']
                })

            # 전체 텍스트 생성
            full_text = ' '.join([seg['text'] for seg in segments])

            logger.info(f"✅ ngrok 서버로부터 자막 추출 성공: {len(segments)}개 세그먼트")

            return {
                'success': True,
                'method': 'ngrok_server',
                'language': 'auto',  # ngrok 서버가 자동 감지
                'segments': segments,
                'full_text': full_text,
                'video_id': data['video_id']
            }

        except requests.exceptions.Timeout:
            logger.error("ngrok 서버 요청 타임아웃")
            return {
                'success': False,
                'error': 'ngrok server request timeout (30s)',
                'video_id': video_id
            }

        except requests.exceptions.ConnectionError:
            logger.error("ngrok 서버 연결 실패")
            return {
                'success': False,
                'error': 'Failed to connect to ngrok server. Please check if the server is running.',
                'video_id': video_id
            }

        except requests.exceptions.HTTPError as e:
            logger.error(f"ngrok 서버 HTTP 에러: {e}")
            error_detail = ""
            try:
                error_detail = response.json().get('detail', str(e))
            except:
                error_detail = str(e)

            return {
                'success': False,
                'error': f'ngrok server HTTP error: {error_detail}',
                'video_id': video_id
            }

        except Exception as e:
            logger.error(f"자막 추출 중 예상치 못한 오류: {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'video_id': video_id
            }

    @staticmethod
    def format_transcript_for_llm(segments: List[Dict]) -> str:
        """
        LLM 처리용 자막 포맷팅

        Args:
            segments: 자막 세그먼트 리스트

        Returns:
            포맷팅된 텍스트
        """
        formatted = []
        for seg in segments:
            timestamp = TranscriptExtractor._format_timestamp(seg['start'])
            formatted.append(f"[{timestamp}] {seg['text']}")

        return '\n'.join(formatted)

    @staticmethod
    def _format_timestamp(seconds: float) -> str:
        """초를 MM:SS 형태로 변환"""
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"


# 테스트 코드
if __name__ == "__main__":
    # 테스트용
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    result = TranscriptExtractor.get_transcript(test_url)

    if result['success']:
        print(f"✅ 자막 추출 성공!")
        print(f"방법: {result['method']}")
        print(f"Video ID: {result['video_id']}")
        print(f"세그먼트 수: {len(result['segments'])}")
        print(f"\n첫 3줄:")
        for seg in result['segments'][:3]:
            print(f"  [{seg['start']:.1f}s] {seg['text']}")
    else:
        print(f"❌ 실패: {result['error']}")
