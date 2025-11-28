// components/TrendMindmap/TrendMindmapCanvas.tsx
import { useEffect, useRef, useState } from "react";
import type { TrendKeywordItem } from "../../types/trend";
import { MindmapNode } from "./MindmapNode";

interface TrendMindmapCanvasProps {
  readonly parentKeyword: string;
  readonly childKeywords: TrendKeywordItem[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function TrendMindmapCanvas({
  parentKeyword,
  childKeywords,
  isLoading,
  error,
}: TrendMindmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 화면 크기 측정
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">마인드맵을 생성하는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2 text-lg">⚠️ 오류가 발생했습니다</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // 자식 노드를 rank에 따라 여러 레이어(동심원)에 배치
  const getNodePosition = (
    child: TrendKeywordItem,
    index: number,
    total: number
  ) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const minDimension = Math.min(dimensions.width, dimensions.height);

    // rank에 따라 다른 반지름 (rank가 높을수록 중앙에 가깝게)
    let radiusRatio: number;
    if (child.rank === 1) {
      radiusRatio = 0.25; // 가장 가까이
    } else if (child.rank === 2) {
      radiusRatio = 0.32;
    } else if (child.rank === 3) {
      radiusRatio = 0.38;
    } else if (child.rank === 4) {
      radiusRatio = 0.43;
    } else if (child.rank === 5) {
      radiusRatio = 0.47;
    } else {
      radiusRatio = 0.5; // 가장 멀리
    }

    const radius = minDimension * radiusRatio;

    // 같은 rank끼리 각도를 조금씩 다르게 배치
    const sameRankNodes = childKeywords.filter((c) => c.rank === child.rank);
    const rankIndex = sameRankNodes.findIndex(
      (c) => c.keyword === child.keyword
    );
    const rankTotal = sameRankNodes.length;

    // 전체 각도를 고르게 분산 + rank별 offset
    const baseAngle = (index * 2 * Math.PI) / total;
    const rankOffset = (rankIndex * 2 * Math.PI) / (rankTotal * 3); // 같은 rank 내에서 약간의 분산
    const angle = baseAngle + rankOffset - Math.PI / 2;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {dimensions.width > 0 && (
        <>
          {/* SVG로 연결선 그리기 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {childKeywords.map((child, index) => {
              const pos = getNodePosition(child, index, childKeywords.length);
              return (
                <line
                  key={child.keyword}
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#E5E7EB"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
          </svg>

          {/* 중앙 부모 노드 */}
          <MindmapNode
            keyword={parentKeyword}
            isParent
            style={{
              position: "absolute",
              left: `${centerX}px`,
              top: `${centerY}px`,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* 자식 노드들 */}
          {childKeywords.map((child, index) => {
            const pos = getNodePosition(child, index, childKeywords.length);
            return (
              <MindmapNode
                key={child.keyword}
                keyword={child.keyword}
                score={child.score}
                rank={child.rank}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
