/**
 * 계층 기반 방사형 레이아웃
 *
 * 알고리즘:
 * 1. 계층 트리 구성 (루트 노드 찾기 + 부모-자식 관계 매핑)
 * 2. 루트 노드를 (2500, 2500)에 고정
 * 3. depth 1 자식들을 루트 중심 360도 원형 배치
 * 4. depth 2+ 자식들은 부모-루트 각도를 기준으로 배치
 * 5. 노드 겹침 방지 (각도 조정)
 */

import {
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
  NODE_RADIUS,
  clampNodePosition,
} from "./d3Utils";

/**
 * 노드 위치 인터페이스
 */
export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

/**
 * 계층 트리 노드 인터페이스
 */
interface TreeNode {
  id: string;
  parentId: string | null;
  children: TreeNode[];
  depth: number;
  angle?: number;
  radius?: number;
  x?: number;
  y?: number;
}

/**
 * 계층 기반 방사형 레이아웃 계산
 *
 * 알고리즘:
 * 1. 계층 트리 구성 (루트 노드 찾기 + 부모-자식 관계 매핑)
 * 2. 루트 노드를 (centerX, centerY)에 고정
 * 3. depth 1 자식들을 루트 중심 360도 원형 배치
 * 4. depth 2+ 자식들은 부모-루트 각도를 기준으로 배치
 * 5. 노드 겹침 방지 (각도 조정)
 *
 * @param nodes - 노드 배열
 * @param centerX - 중심 X 좌표
 * @param centerY - 중심 Y 좌표
 * @param baseRadius - depth당 반지름 증가량
 * @param existingPositions - 기존 노드의 고정 위치 (현재 미사용)
 * @returns Promise<PositionedNode[]> - 최종 노드 위치
 */
export async function calculateRadialLayoutWithForces(
  nodes: Array<{ id: string; parentId: string | null | undefined }>,
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y,
  baseRadius: number = 200,
  existingPositions: Map<string, { x: number; y: number }> = new Map()
): Promise<PositionedNode[]> {
  if (nodes.length === 0) return [];

  console.log("[RadialLayout] Starting layout calculation for", nodes.length, "nodes");

  // ===== 1. 계층 트리 구성 =====
  const root = buildHierarchyTree(nodes);

  if (!root) {
    console.error("[RadialLayout] No root node found");
    return [];
  }

  // ===== 2. BFS로 depth 계산 및 계층별 노드 수집 =====
  calculateDepths(root);

  // ===== 3. 각 depth별로 노드 배치 =====
  const positions = new Map<string, { x: number; y: number }>();

  // depthRadiusMap 초기화 (루트는 depth 0, radius 0)
  depthRadiusMap.clear();
  depthRadiusMap.set(0, 0);

  // 루트 노드 배치 (중앙 고정)
  root.x = centerX;
  root.y = centerY;
  root.angle = 0;
  root.radius = 0;
  positions.set(root.id, { x: centerX, y: centerY });

  console.log(`[RadialLayout] Root node "${root.id}" positioned at (${centerX}, ${centerY})`);

  // depth 1부터 차례로 배치
  positionChildrenRecursively(root, centerX, centerY, baseRadius, positions);

  // ===== 4. 결과 반환 =====
  const result: PositionedNode[] = Array.from(positions.entries()).map(([id, pos]) => {
    const clamped = clampNodePosition(pos.x, pos.y);
    return {
      id,
      x: clamped.x,
      y: clamped.y,
    };
  });

  console.log("[RadialLayout] Layout complete:", result.length, "nodes positioned");
  return result;
}

/**
 * 계층 트리 구조 생성
 */
function buildHierarchyTree(nodes: Array<{ id: string; parentId: string | null | undefined }>): TreeNode | null {
  // nodeId → node.id 매핑 생성 (parentId는 nodeId를 참조)
  const nodeIdToId = new Map<string | number, string>();
  for (const node of nodes) {
    if ("nodeId" in node && node.nodeId != null) {
      nodeIdToId.set((node as any).nodeId, node.id);
      nodeIdToId.set(String((node as any).nodeId), node.id);
    }
  }

  // TreeNode 생성
  const nodeMap = new Map<string, TreeNode>();
  let rootId: string | null = null;

  for (const node of nodes) {
    nodeMap.set(node.id, {
      id: node.id,
      parentId: null,
      children: [],
      depth: 0,
    });

    // nodeId가 1인 노드를 루트로 판단
    if ("nodeId" in node && (node as any).nodeId === 1) {
      rootId = node.id;
    }
  }

  // 부모-자식 관계 구성
  for (const node of nodes) {
    if (node.parentId && node.parentId !== "0") {
      const parentNodeId = nodeIdToId.get(node.parentId) ?? nodeIdToId.get(String(node.parentId));
      const parent = parentNodeId ? nodeMap.get(parentNodeId) : null;
      const child = nodeMap.get(node.id);

      if (parent && child) {
        parent.children.push(child);
        child.parentId = parent.id;
      }
    }
  }

  return rootId ? nodeMap.get(rootId) ?? null : null;
}

/**
 * BFS로 각 노드의 depth 계산
 */
function calculateDepths(root: TreeNode): void {
  const queue: TreeNode[] = [root];
  root.depth = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;

    for (const child of node.children) {
      child.depth = node.depth + 1;
      queue.push(child);
    }
  }
}

/**
 * 각 depth별 최대 radius를 추적 (depth간 충분한 간격 보장용)
 */
const depthRadiusMap = new Map<number, number>();

/**
 * 두 노드가 겹치는지 확인
 */
function isPositionOverlapping(
  newPos: { x: number; y: number },
  existingPositions: Array<{ x: number; y: number }>,
  minDistance: number = NODE_RADIUS * 3 // 240px 최소 거리
): boolean {
  for (const pos of existingPositions) {
    const dx = newPos.x - pos.x;
    const dy = newPos.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      return true; // 겹침!
    }
  }
  return false; // 안 겹침
}

/**
 * 겹침을 피하도록 radius를 조정
 */
function adjustRadiusToAvoidOverlap(
  centerX: number,
  centerY: number,
  angle: number,
  initialRadius: number,
  existingPositions: Array<{ x: number; y: number }>,
  minDistance: number = NODE_RADIUS * 3
): { x: number; y: number; radius: number } {
  let radius = initialRadius;
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    if (!isPositionOverlapping({ x, y }, existingPositions, minDistance)) {
      return { x, y, radius };
    }

    // 겹치면 radius를 50px씩 증가
    radius += 50;
  }

  // 최대 시도 후에도 겹치면 그냥 반환
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);
  return { x, y, radius };
}

/**
 * 재귀적으로 자식 노드 배치
 */
function positionChildrenRecursively(
  parent: TreeNode,
  centerX: number,
  centerY: number,
  baseRadius: number,
  positions: Map<string, { x: number; y: number }>
): void {
  if (parent.children.length === 0) return;

  const depth = parent.depth + 1;
  const children = parent.children;
  const childCount = children.length;

  // depth에 따른 기본 반지름 계산
  const basicRadius = depth * baseRadius;

  // 이전 depth의 최대 radius 가져오기
  const prevDepthRadius = depthRadiusMap.get(depth - 1) ?? 0;

  // 최소 간격 400px 보장: 이전 depth + 400px
  const minRadiusFromPrev = prevDepthRadius + 400;

  // 기본 radius와 이전 depth 기반 최소값 중 큰 값 선택
  let radius = Math.max(basicRadius, minRadiusFromPrev);

  // 🔥 노드가 겹치지 않을 최소 반지름 계산
  const minNodeSpacing = NODE_RADIUS * 6; // 노드 간 최소 간격 (480px, 노드 직경 160px의 3배)
  const minCircumference = childCount * minNodeSpacing;
  const minRadius = minCircumference / (2 * Math.PI);

  if (minRadius > radius) {
    radius = minRadius;
    console.log(`[RadialLayout] 🔧 Depth ${depth}: radius adjusted to ${radius.toFixed(0)} for ${childCount} nodes`);
  }

  // 현재 depth의 최대 radius 업데이트
  const currentMaxRadius = depthRadiusMap.get(depth) ?? 0;
  if (radius > currentMaxRadius) {
    depthRadiusMap.set(depth, radius);
  }

  if (depth === 1) {
    // ===== depth 1: 루트 중심 360도 원형 배치 =====
    const angleStep = (2 * Math.PI) / childCount;
    const existingPositions = Array.from(positions.values());

    for (let i = 0; i < childCount; i++) {
      const child = children[i];
      const angle = i * angleStep; // 0부터 시작하여 균등 배치

      // 🔥 겹침 체크 및 radius 자동 조정
      const adjusted = adjustRadiusToAvoidOverlap(
        centerX,
        centerY,
        angle,
        radius,
        existingPositions,
        NODE_RADIUS * 3 // 240px 최소 거리
      );

      child.angle = angle;
      child.radius = adjusted.radius;
      child.x = adjusted.x;
      child.y = adjusted.y;

      positions.set(child.id, { x: child.x, y: child.y });
      existingPositions.push({ x: child.x, y: child.y });

      // 현재 depth의 최대 radius 업데이트
      if (adjusted.radius > (depthRadiusMap.get(depth) ?? 0)) {
        depthRadiusMap.set(depth, adjusted.radius);
      }

      // 재귀적으로 자식의 자식 배치
      positionChildrenRecursively(child, centerX, centerY, baseRadius, positions);
    }

    console.log(`[RadialLayout] Depth 1: ${childCount} nodes positioned in 360° circle (radius: ${radius.toFixed(0)})`);
  } else {
    // ===== depth 2+: 부모-루트 각도 기준으로 배치 =====
    const parentAngle = parent.angle ?? 0;

    // 자식들을 부모 각도 중심으로 부채꼴 배치
    // 최대 60도 (±30도) 범위로 제한
    const maxSpread = Math.PI / 3; // 60도
    const minAnglePerChild = minNodeSpacing / radius; // 각도로 변환
    const totalAngleSpread = Math.min(minAnglePerChild * childCount, maxSpread);
    const existingPositions = Array.from(positions.values());

    // 자식이 1개일 때는 부모와 같은 각도에 배치
    if (childCount === 1) {
      const child = children[0];

      // 🔥 겹침 체크 및 radius 자동 조정
      const adjusted = adjustRadiusToAvoidOverlap(
        centerX,
        centerY,
        parentAngle,
        radius,
        existingPositions,
        NODE_RADIUS * 3 // 240px 최소 거리
      );

      child.angle = parentAngle;
      child.radius = adjusted.radius;
      child.x = adjusted.x;
      child.y = adjusted.y;

      positions.set(child.id, { x: child.x, y: child.y });

      // 현재 depth의 최대 radius 업데이트
      if (adjusted.radius > (depthRadiusMap.get(depth) ?? 0)) {
        depthRadiusMap.set(depth, adjusted.radius);
      }

      // 재귀적으로 자식의 자식 배치
      positionChildrenRecursively(child, centerX, centerY, baseRadius, positions);
    } else {
      // 자식이 2개 이상일 때는 부채꼴 형태로 배치
      const halfSpread = totalAngleSpread / 2;
      const angleStep = totalAngleSpread / (childCount - 1); // 양 끝에 노드 배치

      for (let i = 0; i < childCount; i++) {
        const child = children[i];

        // 부모 각도를 중심으로 좌우 대칭 배치
        const childAngle = parentAngle - halfSpread + i * angleStep;

        // 🔥 겹침 체크 및 radius 자동 조정
        const adjusted = adjustRadiusToAvoidOverlap(
          centerX,
          centerY,
          childAngle,
          radius,
          existingPositions,
          NODE_RADIUS * 3 // 240px 최소 거리
        );

        child.angle = childAngle;
        child.radius = adjusted.radius;
        child.x = adjusted.x;
        child.y = adjusted.y;

        positions.set(child.id, { x: child.x, y: child.y });
        existingPositions.push({ x: child.x, y: child.y });

        // 현재 depth의 최대 radius 업데이트
        if (adjusted.radius > (depthRadiusMap.get(depth) ?? 0)) {
          depthRadiusMap.set(depth, adjusted.radius);
        }

        // 재귀적으로 자식의 자식 배치
        positionChildrenRecursively(child, centerX, centerY, baseRadius, positions);
      }
    }

    console.log(`[RadialLayout] Depth ${depth}: ${childCount} nodes positioned around parent angle ${(parentAngle * 180 / Math.PI).toFixed(1)}° (radius: ${radius.toFixed(0)}, spread: ${(totalAngleSpread * 180 / Math.PI).toFixed(1)}°)`);
  }
}

/**
 * API 응답 형식의 노드에 레이아웃 적용
 * ✅ 기존 좌표가 있는 노드는 보존하고, null 좌표만 새로 계산
 */
export async function applyRadialLayoutWithForcesToNodes(
  apiNodes: Array<{ id: string; parentId: string | null | undefined; x?: number | null; y?: number | null; [key: string]: any }>,
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y,
  baseRadius: number = 350
): Promise<any[]> {
  if (apiNodes.length === 0) return [];

  // 기존 좌표가 있는 노드 저장
  const existingPositions = new Map<string, { x: number; y: number }>();

  for (const node of apiNodes) {
    if (node.x != null && node.y != null) {
      existingPositions.set(node.id, { x: node.x, y: node.y });
    }
  }

  const nullPositionCount = apiNodes.length - existingPositions.size;
  console.log(`[RadialLayout] Applying layout - ${nullPositionCount} null nodes, ${existingPositions.size} preserved nodes`);

  // 모든 노드에 대해 레이아웃 계산 (기존 노드는 내부에서 보존됨)
  const positions = await calculateRadialLayoutWithForces(apiNodes, centerX, centerY, baseRadius, existingPositions);
  const positionMap = new Map(positions.map((p) => [p.id, p]));

  const result = apiNodes.map((node) => {
    // 기존 좌표가 있으면 보존
    const existing = existingPositions.get(node.id);
    if (existing) {
      return {
        ...node,
        x: existing.x,
        y: existing.y,
      };
    }

    // null 좌표는 새로 계산된 위치 사용
    const position = positionMap.get(node.id);
    return {
      ...node,
      x: position?.x ?? centerX,
      y: position?.y ?? centerY,
    };
  });

  console.log("[RadialLayout] Layout complete - all nodes positioned");
  return result;
}
