/**
 * Edge-Crossing 방지 방사형 레이아웃
 *
 * 요구사항:
 * 1. 모든 edge는 100% 직선
 * 2. edge 간 교차(crossing) 금지
 * 3. 노드 간 충돌 방지 (forceManyBody + forceCollide)
 * 4. 방사형 트리 구조 유지 (depth별 radius)
 * 5. Force simulation 적용
 */

import * as d3 from "d3";
import { CANVAS_CENTER_X, CANVAS_CENTER_Y, NODE_RADIUS } from "./d3Utils";

/**
 * 노드 위치 인터페이스
 */
export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

/**
 * Edge 정보 인터페이스
 */
interface EdgeInfo {
  source: string;
  target: string;
}

/**
 * Simulation 노드 인터페이스
 */
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  depth: number;
  angle: number;
  radius: number;
}

/**
 * 두 선분이 교차하는지 확인
 * @returns true if segments intersect
 */
function doSegmentsIntersect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  const ccw = (A: { x: number; y: number }, B: { x: number; y: number }, C: { x: number; y: number }) => {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  };

  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

/**
 * 모든 edge 쌍에 대해 교차 여부를 확인
 * @returns 교차하는 edge 쌍의 개수
 */
function countEdgeCrossings(
  positions: Map<string, { x: number; y: number }>,
  edges: EdgeInfo[]
): number {
  let crossings = 0;

  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const edge1 = edges[i];
      const edge2 = edges[j];

      // 같은 노드를 공유하는 edge는 교차 검사 스킵
      if (
        edge1.source === edge2.source ||
        edge1.source === edge2.target ||
        edge1.target === edge2.source ||
        edge1.target === edge2.target
      ) {
        continue;
      }

      const p1 = positions.get(edge1.source);
      const p2 = positions.get(edge1.target);
      const p3 = positions.get(edge2.source);
      const p4 = positions.get(edge2.target);

      if (p1 && p2 && p3 && p4) {
        if (doSegmentsIntersect(p1, p2, p3, p4)) {
          crossings++;
        }
      }
    }
  }

  return crossings;
}

/**
 * Edge-Crossing을 방지하는 방사형 레이아웃 생성
 *
 * 알고리즘:
 * 1. D3 Tree Layout으로 초기 계층 구조 생성 (edge 교차 최소화)
 * 2. 극좌표로 변환 (depth → radius, tree-x → angle)
 * 3. Force Simulation 적용:
 *    - forceManyBody: 노드 간 강한 반발력
 *    - forceCollide: 노드 반지름 기반 충돌 방지
 *    - forceRadial: 각 depth의 radius 유지
 * 4. Edge crossing 검증 및 각도 조정
 *
 * @param nodes - 노드 배열
 * @param centerX - 중심 X 좌표
 * @param centerY - 중심 Y 좌표
 * @param baseRadius - depth당 반지름 증가량
 * @returns Promise<PositionedNode[]> - 최종 노드 위치
 */
export async function calculateRadialLayoutWithForces(
  nodes: Array<{ id: string; parentId: string | null | undefined }>,
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y,
  baseRadius: number = 350
): Promise<PositionedNode[]> {
  if (nodes.length === 0) return [];

  console.log("[RadialForces] Starting layout calculation for", nodes.length, "nodes");

  // ===== 1. 계층 구조 생성 =====
  interface HierarchyNode {
    id: string;
    children?: HierarchyNode[];
  }

  const nodeMap = new Map<string, HierarchyNode>();
  let rootId: string | null = null;

  for (const node of nodes) {
    nodeMap.set(node.id, { id: node.id, children: [] });
    // nodeId가 1인 노드를 루트로 판단
    if ("nodeId" in node && (node as any).nodeId === 1) {
      rootId = node.id;
    }
  }

  // 부모-자식 관계 구성
  for (const node of nodes) {
    if (node.parentId && node.parentId !== "0") {
      const parent = nodeMap.get(String(node.parentId));
      const child = nodeMap.get(node.id);
      if (parent && child) {
        parent.children ??= [];
        parent.children.push(child);
      }
    }
  }

  if (!rootId) {
    console.error("[RadialForces] No root node found");
    return [];
  }

  const root = nodeMap.get(rootId);
  if (!root) return [];

  const hierarchy = d3.hierarchy(root, (d) => d.children);

  // ===== 2. D3 Tree Layout 적용 (Reingold-Tilford) =====
  // 이 알고리즘은 edge 교차를 최소화하는 트리 배치를 제공함
  const nodeWidth = NODE_RADIUS * 6.5; // 노드 간 각도 간격 대폭 증가 (5 → 6.5)
  const nodeHeight = baseRadius;

  const treeLayout = d3
    .tree<HierarchyNode>()
    .nodeSize([nodeWidth, nodeHeight])
    .separation((a, b) => {
      // 형제 노드는 2배, 다른 서브트리는 3.5배 간격으로 더 넓게
      return a.parent === b.parent ? 2.0 : 3.5;
    });

  const treeRoot = treeLayout(hierarchy);

  // ===== 3. 극좌표 변환 (직교좌표 → 극좌표 → 직교좌표) =====
  let minX = Infinity,
    maxX = -Infinity;

  treeRoot.each((node) => {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
  });

  const xRange = maxX - minX || 1;

  const simNodes: SimulationNode[] = [];
  const depthMap = new Map<string, number>();
  const angleMap = new Map<string, number>();

  treeRoot.each((node) => {
    // Tree의 x좌표를 각도로 변환 (0 ~ 2π)
    const normalizedX = (node.x - minX) / xRange;
    const angle = normalizedX * 2 * Math.PI;

    // Tree의 y좌표(depth)를 반지름으로 변환
    const radius = node.depth * baseRadius;

    // 극좌표 → 직교좌표
    const x = centerX + radius * Math.sin(angle);
    const y = centerY - radius * Math.cos(angle);

    depthMap.set(node.data.id, node.depth);
    angleMap.set(node.data.id, angle);

    simNodes.push({
      id: node.data.id,
      x,
      y,
      fx: node.depth === 0 ? centerX : null, // 루트는 중앙 고정
      fy: node.depth === 0 ? centerY : null,
      depth: node.depth,
      angle,
      radius,
    });
  });

  console.log("[RadialForces] Initial positions calculated");

  // Edge 정보 생성 (교차 검증용)
  const edges: EdgeInfo[] = [];
  for (const node of nodes) {
    if (node.parentId && node.parentId !== "0") {
      edges.push({
        source: String(node.parentId),
        target: node.id,
      });
    }
  }

  // ===== 4. Force Simulation 적용 =====
  return new Promise((resolve) => {
    const simulation = d3
      .forceSimulation<SimulationNode>(simNodes)
      // 🔥 가장 중요: 노드 간 강한 반발력 (edge 교차 방지)
      .force(
        "charge",
        d3.forceManyBody<SimulationNode>()
          .strength(-1200) // 더 강한 반발력 (-800 → -1200)
          .distanceMax(baseRadius * 4) // 영향 범위 확대 (3 → 4)
      )
      // 🔥 노드 충돌 방지 (노드 겹침 방지) - 가장 중요!
      .force(
        "collide",
        d3.forceCollide<SimulationNode>()
          .radius(NODE_RADIUS * 3.5) // 더 넓은 간격 확보 (2.8 → 3.5)
          .strength(1.0) // 최대 강도 유지
          .iterations(5) // 반복 횟수 증가 (3 → 5)
      )
      // 🔥 각 depth별 radial 위치 유지 (방사형 구조 유지)
      .force(
        "radial",
        d3.forceRadial<SimulationNode>(
          (d) => d.radius,
          centerX,
          centerY
        ).strength(0.7) // 약간 완화하여 노드가 더 자유롭게 퍼질 수 있도록 (0.8 → 0.7)
      )
      // 알파 설정 (시뮬레이션 수렴 속도)
      .alphaDecay(0.012) // 더 천천히 수렴 (0.015 → 0.012)
      .velocityDecay(0.3); // 관성 증가로 더 많이 퍼지게 (0.4 → 0.3)

    // 시뮬레이션 진행 상황 모니터링
    let tickCount = 0;
    const maxTicks = 400;

    simulation.on("tick", () => {
      tickCount++;

      // 100 tick마다 edge crossing 체크
      if (tickCount % 100 === 0) {
        const posMap = new Map(simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
        const crossings = countEdgeCrossings(posMap, edges);
        console.log(`[RadialForces] Tick ${tickCount}: ${crossings} edge crossings`);
      }
    });

    simulation.on("end", () => {
      // 최종 edge crossing 확인
      const posMap = new Map(simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
      const finalCrossings = countEdgeCrossings(posMap, edges);

      console.log(`[RadialForces] Simulation complete after ${tickCount} ticks`);
      console.log(`[RadialForces] Final edge crossings: ${finalCrossings}`);

      // ===== 5. 부모 각도 기반 계층적 배치 (선 교차 방지) =====
      console.log("[RadialForces] Applying parent-centered hierarchical layout...");

      // 부모-자식 관계 맵 생성
      const parentChildMap = new Map<string, string[]>();
      const childParentMap = new Map<string, string>();

      for (const node of nodes) {
        if (node.parentId && node.parentId !== "0") {
          const parentId = String(node.parentId);
          parentChildMap.set(parentId, [...(parentChildMap.get(parentId) || []), node.id]);
          childParentMap.set(node.id, parentId);
        }
      }

      // 각 depth별로 노드를 그룹화
      const depthGroups = new Map<number, SimulationNode[]>();
      for (const node of simNodes) {
        if (!depthGroups.has(node.depth)) {
          depthGroups.set(node.depth, []);
        }
        depthGroups.get(node.depth)!.push(node);
      }

      // 각 노드의 각도 범위 저장 (서브트리 전파용)
      const nodeAngleRanges = new Map<string, { start: number; end: number; center: number }>();

      // 루트 노드는 전체 범위
      const rootNode = simNodes.find(n => n.depth === 0);
      if (rootNode) {
        nodeAngleRanges.set(rootNode.id, { start: 0, end: 2 * Math.PI, center: rootNode.angle });
      }

      // BFS로 depth별로 순차 배치
      const maxDepth = Math.max(...Array.from(depthGroups.keys()));

      for (let depth = 1; depth <= maxDepth; depth++) {
        const nodesAtDepth = depthGroups.get(depth);
        if (!nodesAtDepth) continue;

        // 🔥 최소 반지름 계산
        const nodeCount = nodesAtDepth.length;
        const nodeSpacing = NODE_RADIUS * 4;
        const minCircumference = nodeCount * nodeSpacing;
        const minRadius = minCircumference / (2 * Math.PI);
        const baseRadiusForDepth = depth * baseRadius;
        const actualRadius = Math.max(baseRadiusForDepth, minRadius);

        if (actualRadius > baseRadiusForDepth) {
          console.log(`[RadialForces] 🔧 Depth ${depth}: radius adjusted ${baseRadiusForDepth.toFixed(0)} → ${actualRadius.toFixed(0)}`);
        }

        // 부모별로 자식 노드 그룹화
        const nodesByParent = new Map<string, SimulationNode[]>();
        for (const node of nodesAtDepth) {
          const parentId = childParentMap.get(node.id);
          if (parentId) {
            nodesByParent.set(parentId, [...(nodesByParent.get(parentId) || []), node]);
          }
        }

        // 각 부모별로 처리
        for (const [parentId, children] of nodesByParent.entries()) {
          const parentNode = simNodes.find(n => n.id === parentId);
          const parentRange = nodeAngleRanges.get(parentId);

          if (!parentNode || !parentRange) {
            console.warn(`[RadialForces] Parent ${parentId} not found`);
            continue;
          }

          // 부모의 실제 각도를 중심으로 자식들 배치
          const parentAngle = parentNode.angle;
          const childCount = children.length;

          // 자식들이 겹치지 않을 최소 각도 계산
          const minAnglePerChild = (NODE_RADIUS * 4) / actualRadius;
          const totalAngleNeeded = minAnglePerChild * childCount;

          // 부모가 할당받은 범위 내에서 배치
          const availableAngle = parentRange.end - parentRange.start;
          const actualAngleSpread = Math.min(totalAngleNeeded, availableAngle);

          // 자식들을 부모 각도 중심으로 좌우 대칭 배치
          const halfSpread = actualAngleSpread / 2;
          const angleStep = actualAngleSpread / childCount;

          for (let i = 0; i < childCount; i++) {
            const child = children[i];

            // 자식의 각도: 부모 각도 - 절반 + (i + 0.5) * step
            const childAngle = parentAngle - halfSpread + (i + 0.5) * angleStep;

            // 자식의 각도 범위 계산 (서브트리를 위해 저장)
            const childAngleStart = parentAngle - halfSpread + (i * angleStep);
            const childAngleEnd = childAngleStart + angleStep;
            nodeAngleRanges.set(child.id, {
              start: childAngleStart,
              end: childAngleEnd,
              center: childAngle
            });

            child.x = centerX + actualRadius * Math.sin(childAngle);
            child.y = centerY - actualRadius * Math.cos(childAngle);
            child.angle = childAngle;
            child.radius = actualRadius;
          }
        }

        console.log(`[RadialForces] 🎯 Depth ${depth}: ${nodeCount} nodes, ${nodesByParent.size} parent groups`);
      }

      // 재조정 후 crossing 확인
      const adjustedPosMap = new Map(simNodes.map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
      const adjustedCrossings = countEdgeCrossings(adjustedPosMap, edges);
      console.log(`[RadialForces] After uniform distribution: ${adjustedCrossings} crossings`);

      // 결과 반환
      const result: PositionedNode[] = simNodes.map((n) => ({
        id: n.id,
        x: n.x ?? centerX,
        y: n.y ?? centerY,
      }));

      console.log("[RadialForces] Layout complete:", result.length, "nodes positioned");
      resolve(result);
    });

    // 강제 종료 (최대 tick)
    setTimeout(() => {
      if (tickCount < maxTicks) {
        simulation.stop();
      }
    }, 10000); // 10초 후 강제 종료
  });
}

/**
 * API 응답 형식의 노드에 레이아웃 적용
 */
export async function applyRadialLayoutWithForcesToNodes(
  apiNodes: Array<{ id: string; parentId: string | null | undefined; [key: string]: any }>,
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y,
  baseRadius: number = 350
): Promise<any[]> {
  if (apiNodes.length === 0) return [];

  console.log("[RadialForces] Applying layout to API nodes:", apiNodes.length);

  const positions = await calculateRadialLayoutWithForces(apiNodes, centerX, centerY, baseRadius);

  const positionMap = new Map(positions.map((p) => [p.id, p]));

  const result = apiNodes.map((node) => {
    const position = positionMap.get(node.id);
    return {
      ...node,
      x: position?.x ?? centerX,
      y: position?.y ?? centerY,
    };
  });

  console.log("[RadialForces] Layout applied to all nodes");
  return result;
}
