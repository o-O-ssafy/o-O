/**
 * 부모 노드 기준 자식 노드 배치 유틸리티
 *
 * 기능:
 * - null 좌표 노드를 부모 주위에 원형 배치
 * - 기존 형제 노드들의 각도를 피해서 배치
 * - 모든 기존 노드와 150px 이상 거리 유지 (충돌 방지)
 * - D3 force simulation 적용하여 자연스러운 최종 위치 계산
 */

import type { NodeData } from "../types";
import { CANVAS_CENTER_X, CANVAS_CENTER_Y, NODE_RADIUS, applyForceSimulation } from "./d3Utils";

/**
 * 부모 기준 자식 노드 배치를 위한 파라미터
 */
interface LayoutParams {
  baseRadius: number;      // 부모-자식 기본 거리 (기본값: 100)
  minDistance: number;     // 노드 간 최소 거리 (기본값: 150)
  angleBuffer: number;     // 형제 노드 각도 버퍼 (도 단위, 기본값: 15)
  radiusStep: number;      // 충돌 시 반지름 증가량 (기본값: 50)
  maxAttempts: number;     // 반지름 증가 최대 시도 (기본값: 10)
}

const DEFAULT_PARAMS: LayoutParams = {
  baseRadius: 100,
  minDistance: 150,
  angleBuffer: 15,
  radiusStep: 50,
  maxAttempts: 10,
};

/**
 * 두 점 사이의 거리 계산
 */
function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 주어진 위치가 기존 노드와 충돌하는지 확인
 */
function isPositionOccupied(
  x: number,
  y: number,
  existingNodes: NodeData[],
  minDistance: number
): boolean {
  return existingNodes.some((node) => {
    if (node.x == null || node.y == null) return false;

    const distance = calculateDistance(x, y, node.x, node.y);
    return distance < minDistance;
  });
}

/**
 * 부모 노드 기준 각도 계산 (라디안)
 */
function calculateAngle(
  parentX: number,
  parentY: number,
  childX: number,
  childY: number
): number {
  return Math.atan2(childY - parentY, childX - parentX);
}

/**
 * 각도를 0 ~ 2π 범위로 정규화
 */
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
}

/**
 * 두 각도 사이의 차이 계산 (항상 양수, 최소 차이)
 */
function angleDifference(angle1: number, angle2: number): number {
  const diff = Math.abs(angle1 - angle2);
  return Math.min(diff, 2 * Math.PI - diff);
}

/**
 * 각도 범위를 분할 (래핑 처리)
 *
 * 예: { start: 350°, end: 10° } →
 *     [{ start: 350°, end: 360° }, { start: 0°, end: 10° }]
 */
function splitWrappedRange(range: { start: number; end: number }): Array<{ start: number; end: number }> {
  if (range.end >= range.start) {
    // 정상 범위
    return [range];
  }

  // 래핑된 범위를 두 개로 분할
  return [
    { start: range.start, end: 2 * Math.PI },
    { start: 0, end: range.end },
  ];
}

/**
 * 각도 범위 병합 (중복 제거)
 */
function mergeAngleRanges(ranges: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
  if (ranges.length === 0) return [];

  // 시작 각도로 정렬
  const sorted = ranges.slice().sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    if (next.start <= current.end) {
      // 중복되거나 인접함 → 병합
      current = {
        start: current.start,
        end: Math.max(current.end, next.end),
      };
    } else {
      // 중복 없음 → 현재 범위 저장하고 다음으로
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}

/**
 * 형제 노드들이 사용 중인 각도 영역 분석
 *
 * @returns 사용 중인 각도 범위 리스트 [{ start, end }] (병합 및 래핑 처리됨)
 */
function getOccupiedAngles(
  parentX: number,
  parentY: number,
  siblings: NodeData[],
  angleBuffer: number
): Array<{ start: number; end: number }> {
  const bufferRad = (angleBuffer * Math.PI) / 180;
  const occupiedRanges: Array<{ start: number; end: number }> = [];

  for (const sibling of siblings) {
    if (sibling.x == null || sibling.y == null) continue;

    const angle = calculateAngle(parentX, parentY, sibling.x, sibling.y);
    const normalizedAngle = normalizeAngle(angle);

    const range = {
      start: normalizeAngle(normalizedAngle - bufferRad),
      end: normalizeAngle(normalizedAngle + bufferRad),
    };

    // 래핑된 범위 분할
    const split = splitWrappedRange(range);
    occupiedRanges.push(...split);
  }

  // 중복 범위 병합
  const merged = mergeAngleRanges(occupiedRanges);

  console.log(`[parentCenteredLayout] Occupied angles:`, merged.map(r =>
    `${(r.start * 180 / Math.PI).toFixed(0)}°-${(r.end * 180 / Math.PI).toFixed(0)}°`
  ).join(', '));

  return merged;
}

/**
 * 사용 가능한 각도 찾기 (형제 노드들이 없는 영역)
 *
 * @returns 사용 가능한 각도 리스트 (라디안)
 */
function findAvailableAngles(
  occupiedAngles: Array<{ start: number; end: number }>,
  count: number
): number[] {
  if (count === 0) return [];

  if (occupiedAngles.length === 0) {
    // 형제가 없으면 360도를 균등 분할
    // 시작 각도를 약간 랜덤화하여 자연스러운 배치
    const startOffset = Math.random() * Math.PI / 4; // 0~45도 랜덤
    const angles = Array.from({ length: count }, (_, i) =>
      normalizeAngle(startOffset + (2 * Math.PI * i) / count)
    );

    console.log(`[parentCenteredLayout] No siblings, uniform distribution:`,
      angles.map(a => `${(a * 180 / Math.PI).toFixed(0)}°`).join(', ')
    );

    return angles;
  }

  // 빈 영역 찾기 (이미 병합되고 래핑 처리된 occupiedAngles 사용)
  const freeRanges: Array<{ start: number; end: number }> = [];

  if (occupiedAngles.length === 0) {
    freeRanges.push({ start: 0, end: 2 * Math.PI });
  } else {
    let currentAngle = 0;

    for (const occupied of occupiedAngles) {
      if (occupied.start > currentAngle) {
        // 현재 위치와 다음 사용 중인 범위 사이의 빈 공간
        freeRanges.push({
          start: currentAngle,
          end: occupied.start,
        });
      }
      currentAngle = occupied.end;
    }

    // 마지막 범위 (마지막 사용 범위 ~ 360도)
    if (currentAngle < 2 * Math.PI) {
      freeRanges.push({
        start: currentAngle,
        end: 2 * Math.PI,
      });
    }
  }

  console.log(`[parentCenteredLayout] Free angle ranges:`,
    freeRanges.map(r =>
      `${(r.start * 180 / Math.PI).toFixed(0)}°-${(r.end * 180 / Math.PI).toFixed(0)}°`
    ).join(', ')
  );

  // 빈 영역에 각도를 균등 배분
  if (freeRanges.length === 0) {
    // 모든 각도가 사용 중 → 강제로 균등 분할
    console.warn(`[parentCenteredLayout] No free angles available! Using uniform distribution anyway.`);
    return Array.from({ length: count }, (_, i) => (2 * Math.PI * i) / count);
  }

  const angles: number[] = [];

  // 전체 빈 공간의 크기 계산
  const totalFreeSpace = freeRanges.reduce((sum, range) => sum + (range.end - range.start), 0);

  // 각 빈 범위에 비례적으로 각도 할당
  for (const range of freeRanges) {
    const rangeSize = range.end - range.start;
    const proportion = rangeSize / totalFreeSpace;
    const angleCount = Math.max(1, Math.round(proportion * count));
    const actualCount = Math.min(angleCount, count - angles.length);

    for (let i = 0; i < actualCount; i++) {
      // 범위 내에서 균등 분포
      const angle = range.start + (rangeSize * (i + 0.5)) / actualCount;
      angles.push(normalizeAngle(angle));
    }

    if (angles.length >= count) break;
  }

  // 부족하면 첫 번째 빈 범위에서 추가 할당
  while (angles.length < count) {
    const range = freeRanges[0];
    const rangeSize = range.end - range.start;
    const angle = range.start + (rangeSize * Math.random());
    angles.push(normalizeAngle(angle));
  }

  console.log(`[parentCenteredLayout] Assigned angles:`,
    angles.map(a => `${(a * 180 / Math.PI).toFixed(0)}°`).join(', ')
  );

  return angles;
}

/**
 * 충돌하지 않는 위치 찾기 (반지름 증가 전략)
 */
function findNonCollidingPosition(
  parentX: number,
  parentY: number,
  angle: number,
  existingNodes: NodeData[],
  params: LayoutParams
): { x: number; y: number } | null {
  let radius = params.baseRadius;

  for (let attempt = 0; attempt < params.maxAttempts; attempt++) {
    const x = parentX + radius * Math.cos(angle);
    const y = parentY + radius * Math.sin(angle);

    if (!isPositionOccupied(x, y, existingNodes, params.minDistance)) {
      return { x, y };
    }

    radius += params.radiusStep;
  }

  return null; // 실패
}

/**
 * 나선형 탐색으로 빈 공간 찾기 (최후의 수단)
 */
function spiralSearch(
  centerX: number,
  centerY: number,
  existingNodes: NodeData[],
  minDistance: number
): { x: number; y: number } {
  let radius = 100;
  let angle = 0;
  const angleStep = Math.PI / 6; // 30도
  const radiusStep = 20;
  const maxRadius = 1000;

  while (radius < maxRadius) {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    if (!isPositionOccupied(x, y, existingNodes, minDistance)) {
      return { x, y };
    }

    angle += angleStep;
    if (angle >= 2 * Math.PI) {
      angle = 0;
      radius += radiusStep;
    }
  }

  // 정말 실패: 부모 위치 기준 오프셋
  console.warn("[parentCenteredLayout] Failed to find empty space, using fallback position");
  return { x: centerX + 200, y: centerY + 200 };
}

/**
 * 부모 노드 기준으로 null 좌표 노드들을 배치
 *
 * @param nodes - 전체 노드 리스트
 * @param params - 배치 파라미터 (선택)
 * @returns 좌표가 업데이트된 노드 리스트 (Promise)
 */
export async function calculateParentCenteredPositions(
  nodes: NodeData[],
  params: Partial<LayoutParams> = {}
): Promise<NodeData[]> {
  const layoutParams: LayoutParams = { ...DEFAULT_PARAMS, ...params };

  console.log("[parentCenteredLayout] Starting layout calculation for", nodes.length, "nodes");

  // 1. null 좌표 노드 필터링
  const nullPositionNodes = nodes.filter((n) => n.x == null || n.y == null);

  if (nullPositionNodes.length === 0) {
    console.log("[parentCenteredLayout] All nodes have positions");
    return nodes;
  }

  console.log("[parentCenteredLayout] Found", nullPositionNodes.length, "nodes with null positions");

  // 2. nodeId → node 매핑 생성
  const nodeIdToNode = new Map<number | string, NodeData>();
  for (const node of nodes) {
    if (node.nodeId != null) {
      nodeIdToNode.set(node.nodeId, node);
      nodeIdToNode.set(String(node.nodeId), node);
    }
  }

  // 3. 기존 좌표가 있는 노드 리스트
  const existingNodes = nodes.filter((n) => n.x != null && n.y != null);

  // 4. 부모별로 null 좌표 자식들을 그룹화
  const childrenByParent = new Map<string | number | null, NodeData[]>();

  for (const node of nullPositionNodes) {
    const parentKey = node.parentId ?? null;
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey)!.push(node);
  }

  // 5. 결과 노드 배열 (기존 노드들로 초기화)
  const resultNodes = new Map<string, NodeData>();
  for (const node of nodes) {
    resultNodes.set(node.id, { ...node });
  }

  // 6. 각 부모별로 자식들 배치
  for (const [parentKey, children] of childrenByParent.entries()) {
    // 부모 노드 찾기
    let parentX = CANVAS_CENTER_X;
    let parentY = CANVAS_CENTER_Y;
    let parent: NodeData | undefined;

    if (parentKey !== null) {
      // parentKey는 nodeId를 참조
      parent = nodeIdToNode.get(parentKey);

      if (parent && parent.x != null && parent.y != null) {
        parentX = parent.x;
        parentY = parent.y;
      } else {
        console.warn(`[parentCenteredLayout] Parent node not found or has no position: ${parentKey}`);
      }
    }

    // 기존 형제 노드들 찾기 (같은 부모를 가진 좌표 있는 노드)
    const siblings = existingNodes.filter((n) => {
      if (parentKey === null) {
        return n.parentId == null;
      }
      return String(n.parentId) === String(parentKey);
    });

    console.log(`[parentCenteredLayout] Parent ${parentKey}: ${children.length} new children, ${siblings.length} existing siblings`);

    // 형제들이 사용 중인 각도 영역 분석
    const occupiedAngles = getOccupiedAngles(
      parentX,
      parentY,
      siblings,
      layoutParams.angleBuffer
    );

    // 사용 가능한 각도 찾기
    const availableAngles = findAvailableAngles(occupiedAngles, children.length);

    // 각 자식 노드에 대해 위치 계산
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const angle = availableAngles[i % availableAngles.length];

      console.log(`[parentCenteredLayout]   Child ${i + 1}/${children.length} (${child.keyword}): angle ${(angle * 180 / Math.PI).toFixed(0)}°`);

      // 충돌하지 않는 위치 찾기
      let position = findNonCollidingPosition(
        parentX,
        parentY,
        angle,
        existingNodes,
        layoutParams
      );

      // 실패 시 나선형 탐색
      if (position === null) {
        console.warn(`[parentCenteredLayout]   ⚠️ Failed to find position, using spiral search`);
        position = spiralSearch(parentX, parentY, existingNodes, layoutParams.minDistance);
      }

      // 결과 업데이트
      const updatedNode = resultNodes.get(child.id)!;
      updatedNode.x = position.x;
      updatedNode.y = position.y;
      resultNodes.set(child.id, updatedNode);

      // 다음 노드를 위해 기존 노드 목록에 추가
      existingNodes.push(updatedNode);

      console.log(`[parentCenteredLayout]   ✓ Placed at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`);
    }
  }

  console.log("[parentCenteredLayout] Layout complete, applying D3 force simulation...");

  // D3 force simulation 적용하여 자연스러운 최종 위치 계산
  const nodesArray = Array.from(resultNodes.values());
  const positionedNodes = nodesArray.map(node => ({
    id: node.id,
    x: node.x ?? CANVAS_CENTER_X,
    y: node.y ?? CANVAS_CENTER_Y,
  }));

  // Force simulation 적용 (노드들을 자연스럽게 밀어냄)
  const forcedPositions = await applyForceSimulation(positionedNodes, CANVAS_CENTER_X, CANVAS_CENTER_Y);

  // Force 적용 결과를 노드에 반영
  const finalNodes = nodesArray.map(node => {
    const forcedPos = forcedPositions.find(p => p.id === node.id);
    if (forcedPos) {
      return { ...node, x: forcedPos.x, y: forcedPos.y };
    }
    return node;
  });

  console.log("[parentCenteredLayout] Force simulation complete");
  return finalNodes;
}

/**
 * 단일 자식 노드의 위치를 계산 (실시간 노드 생성용)
 *
 * @param parentX - 부모 노드 X 좌표
 * @param parentY - 부모 노드 Y 좌표
 * @param parentId - 부모 노드의 nodeId (형제 찾기용)
 * @param allNodes - 전체 노드 리스트 (충돌 감지용)
 * @param params - 배치 파라미터 (선택)
 * @returns 새 자식 노드의 좌표 { x, y }
 */
export function calculateChildPosition(
  parentX: number,
  parentY: number,
  parentId: number | string | null,
  allNodes: NodeData[],
  params: Partial<LayoutParams> = {}
): { x: number; y: number } {
  const layoutParams: LayoutParams = { ...DEFAULT_PARAMS, ...params };

  console.log(`[calculateChildPosition] Finding position for child of parent ${parentId} at (${parentX}, ${parentY})`);

  // 좌표가 있는 노드만 충돌 감지 대상
  const existingNodes = allNodes.filter((n) => n.x != null && n.y != null);

  // 형제 노드들 찾기 (같은 부모를 가진 노드들)
  const siblings = existingNodes.filter((n) => {
    if (parentId === null) {
      return n.parentId == null;
    }
    return String(n.parentId) === String(parentId);
  });

  console.log(`[calculateChildPosition] Found ${siblings.length} existing siblings`);

  // 형제들이 사용 중인 각도 영역 분석
  const occupiedAngles = getOccupiedAngles(
    parentX,
    parentY,
    siblings,
    layoutParams.angleBuffer
  );

  // 사용 가능한 각도 찾기 (1개만)
  const availableAngles = findAvailableAngles(occupiedAngles, 1);
  const angle = availableAngles[0] ?? 0;

  console.log(`[calculateChildPosition] Selected angle: ${(angle * 180 / Math.PI).toFixed(0)}°`);

  // 충돌하지 않는 위치 찾기
  let position = findNonCollidingPosition(
    parentX,
    parentY,
    angle,
    existingNodes,
    layoutParams
  );

  // 실패 시 나선형 탐색
  if (position === null) {
    console.warn(`[calculateChildPosition] ⚠️ Failed to find position at angle, using spiral search`);
    position = spiralSearch(parentX, parentY, existingNodes, layoutParams.minDistance);
  }

  console.log(`[calculateChildPosition] ✓ Positioned at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`);

  return position;
}
