import { Bot, Users } from "lucide-react";

/**
 * 추천 노드 타입별 테마 설정
 * - 아이콘, 색상, 배치 각도 정의
 */
export const RECOMMENDATION_THEME = {
  ai: {
    icon: Bot,
    iconColor: "#FF69B4",
    nodeColor: "#FFE6F0",
    angles: [-60, -30, 10, 50], // [아이콘, 노드1, 노드2, 노드3]
  },
  trend: {
    icon: Users,
    iconColor: "#4A90E2",
    nodeColor: "#BAE1FF",
    angles: [-120, 210, 170, 130],
  },
} as const;

/**
 * 추천 노드 오버레이 레이아웃 상수
 * - 원형 배치 및 애니메이션 설정
 */
export const RECOMMENDATION_LAYOUT_CONFIG = {
  radius: 180, // 중심에서 추천 노드까지의 거리 (px)
  closeButtonAngle: 90, // 닫기 버튼 각도 (아래쪽 중앙)
  nodeSize: 96, // w-24 = 6rem = 96px
  transitionDuration: 300, // 애니메이션 지속 시간 (ms)
  transitionStagger: 60, // 각 노드 애니메이션 간격 (ms)
  closeButtonDelay: 400, // 닫기 버튼 애니메이션 지연 (ms)
} as const;

export type RecommendationType = keyof typeof RECOMMENDATION_THEME;
