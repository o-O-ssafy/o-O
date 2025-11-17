import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import type { RecommendNodeData, RecommendNodeOverlayProps } from "../../types";
import {
  RECOMMENDATION_THEME,
  RECOMMENDATION_LAYOUT_CONFIG,
  type RecommendationType,
} from "../../styles/recommendationThemes";
import { createRadialGradient } from "@/shared/utils/gradientUtils";

export default function RecommendNodeOverlay({
  open,
  onClose,
  onSelectRecommendation,
  selectedNodeX,
  selectedNodeY,
  trendRecommendations = [],
  aiRecommendations = [],
}: RecommendNodeOverlayProps) {
  if (!open) return null;

  // 각도와 반지름으로 위치 계산
  const getPosition = (angle: number, r: number = RECOMMENDATION_LAYOUT_CONFIG.radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * r,
      y: Math.sin(rad) * r,
    };
  };

  // 아이콘 버튼 렌더링
  const renderIconButton = (type: RecommendationType, angle: number) => {
    const { x, y } = getPosition(angle);
    const theme = RECOMMENDATION_THEME[type];
    const Icon = theme.icon;

    return (
      <div
        key={`icon-${type}`}
        className="absolute pointer-events-auto"
        style={{
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          transition: `all ${RECOMMENDATION_LAYOUT_CONFIG.transitionDuration}ms ease`,
          opacity: open ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
          <Icon className="w-5 h-5" style={{ color: theme.iconColor }} />
        </div>
      </div>
    );
  };

  // 추천 노드 렌더링
  const renderRecommendNode = (
    node: RecommendNodeData,
    angle: number,
    index: number
  ) => {
    const { x, y } = getPosition(angle);
    const theme = RECOMMENDATION_THEME[node.type];
    const bgColor = theme.nodeColor;

    return (
      <button
        type="button"
        key={node.id}
        aria-label={`추천 선택: ${node.keyword}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectRecommendation(node.keyword);
        }}
        className="absolute pointer-events-auto hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer"
        style={{
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          transition: `all ${RECOMMENDATION_LAYOUT_CONFIG.transitionDuration}ms ease ${index * RECOMMENDATION_LAYOUT_CONFIG.transitionStagger}ms`,
          opacity: open ? 1 : 0,
        }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: createRadialGradient(bgColor) }}
        >
          <span className="text-sm font-paperlogy font-semibold px-4 text-center break-words">
            {node.keyword}
          </span>
        </div>
      </button>
    );
  };

  const content = (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div
        className="absolute"
        style={{
          left: `${selectedNodeX}px`,
          top: `${selectedNodeY}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* AI 아이콘 */}
        {renderIconButton("ai", RECOMMENDATION_THEME.ai.angles[0])}

        {/* AI 추천 노드들 */}
        {aiRecommendations.map((node, index) =>
          renderRecommendNode(node, RECOMMENDATION_THEME.ai.angles[index + 1], index)
        )}

        {/* Trend 아이콘 - 추천이 있을 때만 표시 */}
        {trendRecommendations.length > 0 && renderIconButton("trend", RECOMMENDATION_THEME.trend.angles[0])}

        {/* Trend 추천 노드들 */}
        {trendRecommendations.map((node, index) =>
          renderRecommendNode(node, RECOMMENDATION_THEME.trend.angles[index + 1], index)
        )}

        {/* 닫기 버튼 */}
        <div
          className="absolute pointer-events-auto"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${getPosition(RECOMMENDATION_LAYOUT_CONFIG.closeButtonAngle).x}px, ${getPosition(RECOMMENDATION_LAYOUT_CONFIG.closeButtonAngle).y}px)`,
            transition: `all ${RECOMMENDATION_LAYOUT_CONFIG.transitionDuration}ms ease ${RECOMMENDATION_LAYOUT_CONFIG.closeButtonDelay}ms`,
            opacity: open ? 1 : 0,
          }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="rounded-full bg-white hover:bg-gray-100 shadow-lg"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}