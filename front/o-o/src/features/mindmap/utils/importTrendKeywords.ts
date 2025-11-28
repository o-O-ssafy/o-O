import type { NodeData } from "../types";

/**
 * 기존 노드들의 경계 박스를 계산
 */
function calculateBoundingBox(existingNodes: NodeData[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} | null {
  if (existingNodes.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  existingNodes.forEach((node) => {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.y > maxY) maxY = node.y;
  });

  return { minX, maxX, minY, maxY };
}

/**
 * 트렌드 키워드 체인을 마인드맵 노드 체인으로 변환
 *
 * @param keywords - 순서대로 부모-자식 관계를 가진 키워드 배열
 *                   예: ["알고리즘", "파이썬", "개발", "개발자"]
 * @param getRandomThemeColor - 랜덤 테마 색상 생성 함수
 * @param existingNodes - 기존 마인드맵의 노드들 (빈 배열이면 새 마인드맵)
 * @param viewportCenterX - 새 마인드맵 시 viewport 중심 X 좌표 (기본값: 2500)
 * @param viewportCenterY - 새 마인드맵 시 viewport 중심 Y 좌표 (기본값: 2500)
 * @returns NodeData 배열 (부모-자식 관계 포함)
 */
export function convertTrendKeywordsToNodes(
  keywords: string[],
  getRandomThemeColor: () => string,
  existingNodes: NodeData[] = [],
  viewportCenterX: number = 2500,
  viewportCenterY: number = 2500
): NodeData[] {
  if (keywords.length === 0) return [];

  const nodes: NodeData[] = [];
  let parentId: string | undefined = undefined;
  let startX: number;
  let startY: number;

  const horizontalSpacing = 250;
  const verticalSpacing = 150;

  // 새 마인드맵인지 기존 마인드맵인지 판단
  const isNewMindmap = existingNodes.length === 0;

  if (isNewMindmap) {
    // 새 마인드맵: viewport 중심에 배치
    startX = viewportCenterX;
    startY = viewportCenterY;
  } else {
    // 기존 마인드맵: 기존 노드들의 오른쪽에 배치
    const bbox = calculateBoundingBox(existingNodes);
    if (bbox) {
      // 기존 노드들의 가장 오른쪽 + 여유 공간(300px)
      startX = bbox.maxX + 300;
      // Y는 기존 노드들의 중간 높이에서 시작
      startY = (bbox.minY + bbox.maxY) / 2;
    } else {
      // bbox 계산 실패 시 기본값
      startX = 2500;
      startY = 2500;
    }
  }

  let currentX = startX;
  let currentY = startY;

  keywords.forEach((keyword, index) => {
    const nodeId = `trend-import-${Date.now()}-${index}`;

    const newNode: NodeData = {
      id: nodeId,
      keyword: keyword,
      x: currentX,
      y: currentY,
      color: getRandomThemeColor(),
      parentId: parentId, // 이전 노드를 부모로 설정 (첫 번째는 undefined)
      operation: "ADD", // 백엔드 동기화를 위한 operation 타입 지정
    };

    nodes.push(newNode);

    // 다음 반복을 위해 현재 노드를 부모로 설정
    parentId = nodeId;

    if (isNewMindmap) {
      // 새 마인드맵: 루트 노드 근처에 배치 (오른쪽으로)
      currentX += horizontalSpacing;
    } else {
      // 기존 마인드맵: 아래쪽으로 배치하여 겹치지 않게
      currentY += verticalSpacing;
    }
  });

  return nodes;
}

/**
 * 로컬스토리지에서 임시 저장된 트렌드 키워드 가져오기
 *
 * @returns 키워드 배열 또는 null (저장된 데이터가 없는 경우)
 */
export function getPendingImportKeywords(): string[] | null {
  try {
    const stored = localStorage.getItem("pendingImportKeywords");
    if (!stored) return null;

    const keywords = JSON.parse(stored);
    if (!Array.isArray(keywords)) return null;

    return keywords;
  } catch (error) {
    console.error("[getPendingImportKeywords] Failed to parse:", error);
    return null;
  }
}

/**
 * 로컬스토리지에서 임시 저장된 트렌드 키워드 제거
 */
export function clearPendingImportKeywords(): void {
  localStorage.removeItem("pendingImportKeywords");
}
