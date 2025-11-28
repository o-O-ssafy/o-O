import {
  getNodeColorByRank,
  createSVGRadialGradient,
} from "@/shared/utils/gradientUtils";
import type { TrendKeywordItem } from "../../../types/trend";

export function createShadowFilters(
  defs: any,
  displayKeywords: TrendKeywordItem[]
) {
  // 각 노드별 색상 기반 그림자 필터 생성
  const createColoredShadow = (id: string, color: string) => {
    const filter = defs.append("filter").attr("id", id);
    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 4);
    filter.append("feOffset").attr("dx", 0).attr("dy", 3);

    const colorMatrix = filter.append("feColorMatrix");
    colorMatrix.attr("type", "matrix").attr(
      "values",
      `0 0 0 0 ${parseInt(color.slice(1, 3), 16) / 255}
                           0 0 0 0 ${parseInt(color.slice(3, 5), 16) / 255}
                           0 0 0 0 ${parseInt(color.slice(5, 7), 16) / 255}
                           0 0 0 0.4 0`
    );

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    return filter;
  };

  // 부모 노드 그림자
  createColoredShadow("shadow-parent", getNodeColorByRank(undefined, true));

  // 더보기 버튼 그림자
  createColoredShadow("shadow-more", "#E5E5E5");

  // 자식 노드 그림자들
  displayKeywords.forEach((child, index) => {
    createColoredShadow(`shadow-${index}`, getNodeColorByRank(child.rank));
  });
}

export function createGradients(
  defs: any,
  displayKeywords: TrendKeywordItem[]
) {
  // 부모 노드 그라데이션
  createSVGRadialGradient(
    defs,
    "gradient-parent",
    getNodeColorByRank(undefined, true),
    { inner: 0.9, middle: 0.4, outer: 0 }
  );

  // 더보기 버튼 그라데이션
  createSVGRadialGradient(defs, "gradient-more", "#E5E5E5", {
    inner: 0.9,
    middle: 0.4,
    outer: 0,
  });

  // 자식 노드 그라데이션들
  displayKeywords.forEach((child, index) => {
    createSVGRadialGradient(
      defs,
      `gradient-${index}`,
      getNodeColorByRank(child.rank),
      { inner: 0.9, middle: 0.4, outer: 0 }
    );
  });
}
