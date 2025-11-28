/**
 * 방사형 레이아웃 적용 예제
 *
 * 이 파일은 calculateRadialLayout 함수의 사용 예제입니다.
 * 실제 프로젝트에서는 이 파일을 삭제하고, 아래 로직을
 * 노드 데이터를 처리하는 곳(예: hook, store)에 통합하세요.
 */

import { calculateRadialLayout, CANVAS_CENTER_X, CANVAS_CENTER_Y } from './d3Utils';

// API 응답 타입 (제공하신 JSON 기준)
interface ApiNodeResponse {
  id: string;
  nodeId: number;
  workspaceId: number;
  parentId: number | null;
  type: string;
  keyword: string;
  memo: string;
  analysisStatus: string;
  x: number | null;
  y: number | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// NodeData 타입 (실제로는 types.ts에서 import)
interface NodeData {
  id: string;
  x: number;
  y: number;
  parentId: string | null;
  // ... 기타 필드
  [key: string]: any;
}

/**
 * API 응답 노드 데이터에 방사형 레이아웃 적용
 *
 * @param apiNodes - API에서 받은 노드 배열
 * @param centerX - 루트 노드 X 좌표 (기본값: 캔버스 중앙)
 * @param centerY - 루트 노드 Y 좌표 (기본값: 캔버스 중앙)
 * @param baseRadius - 레벨 간 기본 거리 (기본값: 200)
 * @returns 좌표가 적용된 NodeData 배열
 */
export function applyRadialLayoutToApiNodes(
  apiNodes: ApiNodeResponse[],
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y,
  baseRadius: number = 200
): NodeData[] {
  if (apiNodes.length === 0) {
    return [];
  }

  // 1. nodeId -> id 매핑 생성 (parentId 변환용)
  const nodeIdToIdMap = new Map<number, string>();
  for (const node of apiNodes) {
    nodeIdToIdMap.set(node.nodeId, node.id);
  }

  // 2. calculateRadialLayout에 전달할 형식으로 변환
  const nodesForLayout = apiNodes.map(node => ({
    id: node.id,
    parentId: node.parentId ? nodeIdToIdMap.get(node.parentId) ?? null : null,
  }));

  console.log('[RadialLayout] Calculating positions for', nodesForLayout.length, 'nodes');

  // 3. 방사형 레이아웃 계산
  const positions = calculateRadialLayout(nodesForLayout, centerX, centerY, baseRadius);

  console.log('[RadialLayout] Positions calculated:', positions.length);

  // 4. 원본 노드에 계산된 좌표 적용
  const positionedNodes: NodeData[] = apiNodes.map(node => {
    const position = positions.find(p => p.id === node.id);

    const x = position?.x ?? centerX;
    const y = position?.y ?? centerY;

    // parentId를 nodeId에서 id로 변환
    const parentId = node.parentId ? nodeIdToIdMap.get(node.parentId) ?? null : null;

    return {
      ...node,
      id: node.id,
      x,
      y,
      parentId,
    };
  });

  console.log('[RadialLayout] Applied positions to all nodes');

  return positionedNodes;
}

/**
 * 이미 좌표가 있는 노드와 없는 노드를 혼합 처리
 * - x, y가 null인 노드만 방사형 레이아웃 적용
 * - 이미 좌표가 있는 노드는 그대로 유지
 *
 * @param apiNodes - API에서 받은 노드 배열
 * @returns 좌표가 적용된 NodeData 배열
 */
export function applyRadialLayoutToNullPositions(
  apiNodes: ApiNodeResponse[]
): NodeData[] {
  if (apiNodes.length === 0) {
    return [];
  }

  // 1. x, y가 null인 노드 확인
  const nullPositionNodes = apiNodes.filter(n => n.x === null || n.y === null);
  const hasPositionNodes = apiNodes.filter(n => n.x !== null && n.y !== null);

  console.log('[RadialLayout] Nodes without position:', nullPositionNodes.length);
  console.log('[RadialLayout] Nodes with position:', hasPositionNodes.length);

  // 2. 모든 노드에 좌표가 있으면 그대로 변환
  if (nullPositionNodes.length === 0) {
    const nodeIdToIdMap = new Map<number, string>();
    for (const node of apiNodes) {
      nodeIdToIdMap.set(node.nodeId, node.id);
    }

    return apiNodes.map(node => ({
      ...node,
      id: node.id,
      x: node.x!,
      y: node.y!,
      parentId: node.parentId ? nodeIdToIdMap.get(node.parentId) ?? null : null,
    }));
  }

  // 3. 모든 노드 또는 일부 노드에 좌표가 없으면 전체에 방사형 레이아웃 적용
  return applyRadialLayoutToApiNodes(apiNodes);
}

// ===== 테스트용 예제 데이터 =====

/**
 * 제공하신 JSON 데이터로 테스트
 * (브라우저 콘솔에서 실행 가능)
 */
export function testRadialLayout() {
  const testNodes: ApiNodeResponse[] = [
    {
      id: "69157a7f4960e57ab263b112",
      nodeId: 1,
      workspaceId: 1,
      parentId: null,
      type: "text",
      keyword: "프로젝트 마인드맵",
      memo: "전체 프로젝트의 루트 노드입니다",
      analysisStatus: "NONE",
      x: null,
      y: null,
      color: "#3b82f6",
      createdAt: "2025-11-13T15:28:15.338",
      updatedAt: "2025-11-13T15:28:15.338"
    },
    {
      id: "69157a7f4960e57ab263b113",
      nodeId: 2,
      workspaceId: 1,
      parentId: 1,
      type: "image",
      keyword: "백엔드",
      memo: "Spring Boot, MongoDB를 사용한 백엔드 시스템",
      analysisStatus: "NONE",
      x: null,
      y: null,
      color: "#10b981",
      createdAt: "2025-11-13T15:28:15.338",
      updatedAt: "2025-11-13T15:28:15.338"
    },
    {
      id: "69157a7f4960e57ab263b114",
      nodeId: 3,
      workspaceId: 1,
      parentId: 1,
      type: "video",
      keyword: "프론트엔드",
      memo: "React, TypeScript를 사용한 프론트엔드",
      analysisStatus: "NONE",
      x: null,
      y: null,
      color: "#8b5cf6",
      createdAt: "2025-11-13T15:28:15.338",
      updatedAt: "2025-11-13T15:28:15.338"
    },
    // ... 나머지 노드들 (여기서는 간략화)
  ];

  console.log('=== Radial Layout Test ===');
  const result = applyRadialLayoutToNullPositions(testNodes);

  console.log('Input nodes:', testNodes.length);
  console.log('Output nodes:', result.length);
  console.log('Sample positions:');
  result.slice(0, 5).forEach(node => {
    console.log(`  ${node.keyword}: (${node.x.toFixed(1)}, ${node.y.toFixed(1)})`);
  });

  return result;
}
