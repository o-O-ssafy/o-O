/**
 * 반응형 폰트 크기를 계산하는 유틸 함수
 * @param radius 구슬 반지름
 * @param textLength 텍스트 길이
 * @param viewportWidth 화면 너비 (기본값: window.innerWidth)
 */

// 화면 크기별 최소/최대 크기 제한
function getSizeRange(width: number) {
  if (width < 640) return { min: 10, max: 20 };
  if (width < 1024) return { min: 12, max: 24 };
  return { min: 12, max: 28 };
}

export function getFontSize(
  radius: number,
  textLength: number,
  viewportWidth: number = window.innerWidth
): number {
  // 기본 비율
  let sizeRatio = 0.3;
  if (viewportWidth < 640) {
    sizeRatio = 0.25;
  } else if (viewportWidth < 1024) {
    sizeRatio = 0.28;
  }

  let baseFontSize = radius * sizeRatio;

  // 텍스트 길이에 따른 조정
  if (textLength > 4) baseFontSize *= 0.85;
  if (textLength > 6) baseFontSize *= 0.8;

  const { min, max } = getSizeRange(viewportWidth);
  return Math.max(min, Math.min(max, baseFontSize));
}
