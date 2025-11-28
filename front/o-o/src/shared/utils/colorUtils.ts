/**
 * HEX 색상을 RGB로 변환
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB 값을 상대 휘도(relative luminance)로 변환
 * WCAG 2.0 기준
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 두 색상 간의 대비 비율 계산 (WCAG 기준)
 */
function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 배경색에 따라 가독성이 좋은 텍스트 색상(#000 또는 #fff) 반환
 * WCAG AA 기준 (최소 4.5:1 대비 비율)
 *
 * @param backgroundColor - HEX 형식의 배경색 (예: "#263A6B")
 * @returns 최적의 텍스트 색상 ("#000000" 또는 "#ffffff")
 *
 * @example
 * getContrastTextColor("#263A6B") // "#ffffff" (어두운 배경 → 흰색 텍스트)
 * getContrastTextColor("#FFB3BA") // "#000000" (밝은 배경 → 검은색 텍스트)
 */
export function getContrastTextColor(backgroundColor: string): '#000000' | '#ffffff' {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000'; // 기본값

  const bgLuminance = getLuminance(rgb.r, rgb.g, rgb.b);
  const whiteLuminance = 1; // 흰색의 휘도
  const blackLuminance = 0; // 검은색의 휘도

  const contrastWithWhite = getContrastRatio(bgLuminance, whiteLuminance);
  const contrastWithBlack = getContrastRatio(bgLuminance, blackLuminance);

  // 대비가 더 큰 쪽 선택
  return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
}
