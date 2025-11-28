import html2canvas from 'html2canvas';

/**
 * 캔버스 썸네일 캡처 옵션
 */
export interface CaptureThumbnailOptions {
  /** 썸네일 파일명 (기본값: 'mindmap-thumbnail.png') */
  filename?: string;
  /** 이미지 품질 (0-1, 기본값: 0.92) */
  quality?: number;
  /** 캡처 스케일 (기본값: 1) */
  scale?: number;
  /** 배경색 (기본값: '#F9FAFB') */
  backgroundColor?: string;
  /** 최대 너비 (px, 썸네일 리사이징용, 기본값: 1200) */
  maxWidth?: number;
  /** 최대 높이 (px, 썸네일 리사이징용, 기본값: 800) */
  maxHeight?: number;
}

/**
 * HTML 요소를 캡처하여 Blob으로 반환
 *
 * @param element 캡처할 HTML 요소 (D3Canvas containerRef)
 * @param options 캡처 옵션
 * @returns PNG 이미지 Blob
 */
export const captureCanvasAsBlob = async (
  element: HTMLElement,
  options: CaptureThumbnailOptions = {}
): Promise<Blob> => {
  const {
    quality = 0.92,
    scale = 1,
    backgroundColor = '#F9FAFB',
  } = options;

  try {
    // html2canvas로 캔버스 캡처
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS: true, // 외부 이미지 포함
      logging: false, // 콘솔 로그 비활성화
      allowTaint: false,
    });

    // Canvas를 Blob으로 변환
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/png',
        quality
      );
    });
  } catch (error) {
    console.error('Canvas capture failed:', error);
    throw new Error('Failed to capture canvas as blob');
  }
};

/**
 * 썸네일 이미지를 리사이징
 *
 * @param blob 원본 이미지 Blob
 * @param maxWidth 최대 너비
 * @param maxHeight 최대 높이
 * @returns 리사이징된 이미지 Blob
 */
export const resizeThumbnail = async (
  blob: Blob,
  maxWidth: number = 1200,
  maxHeight: number = 800
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // 원본 크기
      let { width, height } = img;

      // 비율 유지하며 리사이징
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // 새 캔버스에 리사이징된 이미지 그리기
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (resizedBlob) => {
          URL.revokeObjectURL(url);
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Thumbnail resize failed'));
          }
        },
        'image/png',
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = url;
  });
};

/**
 * 캔버스 썸네일 캡처 및 File 객체 생성 (multipart/form-data 전송용)
 *
 * @param element 캡처할 HTML 요소
 * @param options 캡처 옵션
 * @returns File 객체 (multipart/form-data로 전송 가능)
 */
export const captureThumbnailAsFile = async (
  element: HTMLElement,
  options: CaptureThumbnailOptions = {}
): Promise<File> => {
  const {
    filename = 'mindmap-thumbnail.png',
    maxWidth = 1200,
    maxHeight = 800,
    ...captureOptions
  } = options;

  try {
    // 1. 캔버스 캡처
    let blob = await captureCanvasAsBlob(element, captureOptions);

    // 2. 썸네일 리사이징 (용량 최적화)
    blob = await resizeThumbnail(blob, maxWidth, maxHeight);

    // 3. Blob을 File로 변환 (multipart/form-data 전송용)
    const file = new File([blob], filename, {
      type: 'image/png',
      lastModified: Date.now(),
    });

    // 개발 모드에서 썸네일 정보 로그
    if (import.meta.env.DEV) {
      console.log('📸 Thumbnail captured:', {
        filename: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
      });
    }

    return file;
  } catch (error) {
    console.error('Thumbnail capture failed:', error);
    throw error;
  }
};

/**
 * 썸네일 다운로드 (테스트용)
 *
 * @param element 캡처할 HTML 요소
 * @param filename 다운로드 파일명
 */
export const downloadThumbnail = async (
  element: HTMLElement,
  filename: string = 'mindmap-thumbnail.png'
): Promise<void> => {
  try {
    const file = await captureThumbnailAsFile(element, { filename });
    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.log('✅ Thumbnail downloaded successfully');
  } catch (error) {
    console.error('❌ Thumbnail download failed:', error);
    throw error;
  }
};
