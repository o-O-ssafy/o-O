import type { Node, Link } from "../../../types/d3mindmapType";
import type { TrendKeywordItem } from "../../../types/trend";

export function createNodeData(
  parentKeyword: string,
  displayKeywords: TrendKeywordItem[],
  width: number,
  height: number,
  scaleFactor: number,
  totalChildCount: number
): Node[] {
  const nodes: Node[] = [
    {
      id: parentKeyword,
      label: parentKeyword,
      isParent: true,
      x: width / 2,
      y: height / 2,
      fx: width / 2,
      fy: height / 2,
    },
  ];

  // 자식 키워드가 7개보다 많을 때만 더보기 버튼 추가
  if (totalChildCount > 7) {
    nodes.push({
      id: "__more__",
      label: "더보기",
      isMoreButton: true,
      x: width / 2 + 280 * Math.max(scaleFactor, 1),
      y: height / 2,
      fx: width / 2 + 280 * Math.max(scaleFactor, 1),
      fy: height / 2,
    });
  }

  // 자식이 적을 때는 초기 위치를 부모로부터 멀리 배치하고 고정
  const initialDistance = displayKeywords.length <= 2 ? 480 : 350;
  const centerX = width / 2;
  const centerY = height / 2;
  const shouldFixPosition = displayKeywords.length <= 2;

  nodes.push(
    ...displayKeywords.map((child, index) => {
      const angle = (index / displayKeywords.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * initialDistance * scaleFactor;
      const y = centerY + Math.sin(angle) * initialDistance * scaleFactor;

      return {
        id: child.keyword,
        label: child.keyword,
        rank: child.rank,
        x,
        y,
        // 자식이 2개 이하일 때는 위치 고정
        ...(shouldFixPosition && { fx: x, fy: y }),
      };
    })
  );

  return nodes;
}

export function createLinkData(
  parentKeyword: string,
  displayKeywords: TrendKeywordItem[]
): Link[] {
  return displayKeywords.map((child) => ({
    source: parentKeyword,
    target: child.keyword,
  }));
}

export function getNodeSize(d: Node): number {
  if (d.isParent) return 350;
  if (d.isMoreButton) return 120;
  if (!d.rank) return 160;
  switch (d.rank) {
    case 1:
      return 220;
    case 2:
      return 190;
    case 3:
      return 170;
    case 4:
      return 150;
    case 5:
      return 130;
    default:
      return 120;
  }
}
