// components/TrendMindmap/MindmapNode.tsx
import type { CSSProperties } from "react";
import { COLOR_THEMES } from "@/features/mindmap/styles/colorThemes";

interface MindmapNodeProps {
  keyword: string;
  isParent?: boolean;
  score?: number;
  rank?: number;
  style?: CSSProperties;
}

// Pastel 테마 사용 (기본값)
const colorPalette = COLOR_THEMES.Pastel;

export function MindmapNode({
  keyword,
  isParent = false,
  score,
  rank,
  style,
}: MindmapNodeProps) {
  const backgroundColor = isParent
    ? colorPalette[0]
    : colorPalette[rank ? (rank - 1) % colorPalette.length : 0];

  // 크기 계산: rank가 높을수록(숫자가 작을수록) 크게
  const getSize = () => {
    if (isParent) return 350; // 부모 노드 가장 큼
    if (!rank) return 128;

    switch (rank) {
      case 1:
        return 180; // rank 1: 매우 큼
      case 2:
        return 150; // rank 2: 큼
      case 3:
        return 130; // rank 3: 중간
      case 4:
        return 110; // rank 4: 작음
      case 5:
        return 100; // rank 5: 가장 작음
      default:
        return 90; // rank 6 이상
    }
  };

  // 텍스트 크기도 rank에 따라 조정
  const getTextSizeClass = () => {
    if (isParent) return "text-2xl";
    if (!rank) return "text-base";

    switch (rank) {
      case 1:
        return "text-xl";
      case 2:
        return "text-lg";
      case 3:
      case 4:
      case 5:
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const size = getSize();

  // 디버깅용 로그
  console.log(`${keyword} - rank: ${rank}, size: ${size}px`);

  return (
    <div
      className="
        backdrop-blur-sm
        rounded-full
        flex items-center justify-center
        cursor-pointer
        transition-all duration-300
        hover:scale-110 hover:shadow-lg
      "
      style={{
        ...style,
        backgroundColor: `${backgroundColor}B3`, // B3 = 70% opacity in hex
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
    >
      <div className="text-center px-4">
        <p className={`font-bold text-gray-800 ${getTextSizeClass()}`}>
          {keyword}
        </p>
      </div>
    </div>
  );
}
