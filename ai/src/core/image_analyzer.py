"""
이미지 URL 기반 분석 모듈
"""
import os
import requests
import logging
from typing import Optional, List
from pathlib import Path
from PIL import Image
import io

logger = logging.getLogger(__name__)


class ImageAnalyzer:
    """이미지 URL을 다운로드하고 분석하는 클래스"""

    def __init__(self, output_dir: str = "downloads/images"):
        """
        Args:
            output_dir: 이미지 다운로드 디렉토리
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def download_image(self, image_url: str, timeout: int = 30) -> Optional[str]:
        """
        이미지 URL에서 이미지를 다운로드합니다.

        Args:
            image_url: 이미지 URL
            timeout: 다운로드 타임아웃 (초)

        Returns:
            다운로드된 이미지 파일 경로 (실패시 None)
        """
        try:
            logger.info(f"Downloading image from: {image_url}")

            # 헤더 설정 (User-Agent 추가로 차단 방지)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }

            # 이미지 다운로드
            response = requests.get(image_url, headers=headers, timeout=timeout, stream=True)
            response.raise_for_status()

            # Content-Type 확인
            content_type = response.headers.get("Content-Type", "")
            if not content_type.startswith("image/"):
                logger.warning(f"URL does not appear to be an image. Content-Type: {content_type}")

            # 이미지 데이터 읽기
            image_data = response.content

            # PIL로 이미지 검증
            try:
                image = Image.open(io.BytesIO(image_data))
                image.verify()  # 이미지가 손상되지 않았는지 확인
                logger.info(f"Image verified: format={image.format}, size={image.size}, mode={image.mode}")
            except Exception as e:
                logger.error(f"Invalid image data: {e}")
                return None

            # 파일 확장자 추출 (또는 기본값 사용)
            if "." in image_url:
                ext = image_url.split(".")[-1].split("?")[0]  # URL 파라미터 제거
                if ext.lower() not in ["jpg", "jpeg", "png", "gif", "bmp", "webp"]:
                    ext = "jpg"  # 기본값
            else:
                ext = "jpg"

            # 고유 파일명 생성 (URL 해시 사용)
            import hashlib
            url_hash = hashlib.md5(image_url.encode()).hexdigest()[:10]
            filename = f"image_{url_hash}.{ext}"
            filepath = self.output_dir / filename

            # 파일 저장
            with open(filepath, "wb") as f:
                f.write(image_data)

            logger.info(f"Image downloaded successfully: {filepath}")
            return str(filepath)

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to download image: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error while downloading image: {e}")
            return None

    def download_multiple_images(self, image_urls: List[str]) -> List[str]:
        """
        여러 이미지 URL을 다운로드합니다.

        Args:
            image_urls: 이미지 URL 리스트

        Returns:
            다운로드된 이미지 파일 경로 리스트
        """
        downloaded_images = []

        for url in image_urls:
            filepath = self.download_image(url)
            if filepath:
                downloaded_images.append(filepath)
            else:
                logger.warning(f"Skipping failed download: {url}")

        logger.info(f"Downloaded {len(downloaded_images)}/{len(image_urls)} images")
        return downloaded_images

    def cleanup(self, image_path: str):
        """
        다운로드한 이미지 파일을 삭제합니다.

        Args:
            image_path: 삭제할 이미지 파일 경로
        """
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
                logger.info(f"Cleaned up image: {image_path}")
        except Exception as e:
            logger.error(f"Failed to cleanup image {image_path}: {e}")

    def cleanup_all(self):
        """
        다운로드 디렉토리의 모든 이미지를 삭제합니다.
        """
        try:
            import shutil
            if self.output_dir.exists():
                shutil.rmtree(self.output_dir)
                self.output_dir.mkdir(parents=True, exist_ok=True)
                logger.info(f"Cleaned up all images in: {self.output_dir}")
        except Exception as e:
            logger.error(f"Failed to cleanup directory {self.output_dir}: {e}")
