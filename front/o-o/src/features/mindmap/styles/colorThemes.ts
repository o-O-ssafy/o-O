/**
 * 마인드맵 노드 색상 테마 정의
 * - 각 테마는 7개의 색상으로 구성
 * - ColorPalette 컴포넌트 및 노드 색상 선택에 사용
 */
export const COLOR_THEMES = {
  Pastel: ["#FFD0EA", "#FFEEAC", "#C2F0F9", "#EFB39B", "#B9BDFF", "#C2DCF9", "#C3F9C2"],
  "Summer Beach": ["#F2674A", "#FCDED6", "#84A5F2", "#EA9A37", "#224ED1", "#AFC88E", "#CFAC9D"],
  Citrus: ["#CAE8F2", "#59A5B2", "#FBCC58", "#223F43", "#7CBC29", "#BAAC9D"],
  Retro: ["#FDF5E8", "#A0BBC4", "#F39069", "#DF614A", "#6F8240", "#AABA73", "#AF9A84"],
  Cool: ["#02182F", "#022F56", "#E2C7A1", "#E5ECEA", "#85C4E5", "#CCDDE4", "#488DB4"],
  Lavendar: ["#2B2356", "#AB9CC7", "#F2E2FF", "#FE5C8E", "#FFE1F1", "#39368E", "#8D4E93"],
} as const;

export type ColorThemeName = keyof typeof COLOR_THEMES;
