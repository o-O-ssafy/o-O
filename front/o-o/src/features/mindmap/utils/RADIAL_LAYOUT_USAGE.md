# 방사형 레이아웃 사용 가이드

## 개요

`calculateRadialLayout` 함수는 부모-자식 관계를 가진 노드들을 방사형(radial) 패턴으로 자동 배치합니다.

## 특징

- **계층적 배치**: parentId를 기반으로 BFS 알고리즘을 사용하여 레벨 계산
- **섹터 기반 분할**: 각 부모 노드의 자식들은 부모가 차지하는 각도 범위(섹터) 내에서 균등 분할
- **동적 거리 조정**: 자식 노드 개수에 따라 부모-자식 간 거리를 자동 조정하여 겹침 방지
- **루트 중심 배치**: 루트 노드(parentId가 null)는 캔버스 중앙에 배치

## 사용 방법

```typescript
import { calculateRadialLayout, CANVAS_CENTER_X, CANVAS_CENTER_Y } from './d3Utils';

// 1. 노드 데이터 준비 (id, parentId만 있으면 됨)
const nodes = [
  { id: "1", parentId: null },
  { id: "2", parentId: "1" },
  { id: "3", parentId: "1" },
  { id: "4", parentId: "2" },
  // ...
];

// 2. 레이아웃 계산
const positions = calculateRadialLayout(nodes);

// 3. 결과 사용
// positions = [
//   { id: "1", x: 2500, y: 2500 }, // 루트 (중앙)
//   { id: "2", x: 2700, y: 2500 }, // 레벨 1
//   { id: "3", x: 2500, y: 2700 }, // 레벨 1
//   { id: "4", x: 2900, y: 2500 }, // 레벨 2
//   // ...
// ]

// 4. 노드에 좌표 적용
const positionedNodes = nodes.map(node => {
  const pos = positions.find(p => p.id === node.id);
  return {
    ...node,
    x: pos?.x ?? CANVAS_CENTER_X,
    y: pos?.y ?? CANVAS_CENTER_Y,
  };
});
```

## 매개변수

```typescript
calculateRadialLayout(
  nodes: Array<{ id: string; parentId: string | null | undefined }>,
  centerX?: number,  // 기본값: CANVAS_CENTER_X (2500)
  centerY?: number,  // 기본값: CANVAS_CENTER_Y (2500)
  baseRadius?: number // 기본값: 200 (레벨당 기본 반지름)
): PositionedNode[]
```

### 매개변수 설명

- `nodes`: 노드 배열 (최소한 `id`, `parentId` 속성 필요)
- `centerX`: 루트 노드의 X 좌표
- `centerY`: 루트 노드의 Y 좌표
- `baseRadius`: 레벨 간 기본 간격 (픽셀)
  - 레벨 1 노드는 루트로부터 `baseRadius` 거리
  - 레벨 2 노드는 부모로부터 `baseRadius * 2` 거리
  - 자식 개수에 따라 추가 간격 자동 조정

## 알고리즘 동작 방식

### 1. 레벨 계산 (BFS)
```
레벨 0: parentId가 null인 루트 노드
레벨 1: 루트의 직접 자식
레벨 2: 레벨 1 노드의 자식
...
```

### 2. 루트 노드 배치
- 캔버스 중앙 (centerX, centerY)에 배치
- 여러 루트가 있으면 가로로 나열

### 3. 자식 노드 배치 (레벨 1 이상)

#### 레벨 1: 루트의 직접 자식
- 360도를 자식 개수로 균등 분할
- 예: 자식 4개 → 각각 90도씩 차지

#### 레벨 2 이상: 부모 섹터 내 분할
- 부모가 차지하는 각도 범위(섹터)를 자식들이 균등 분할
- 예: 부모가 90도 차지, 자식 3개 → 각각 30도씩 차지

### 4. 거리 조정
```typescript
const radius = level * baseRadius + (siblingCount - 1) * 30;
```
- 기본 거리: `level * baseRadius`
- 자식이 많으면 추가 간격: `(siblingCount - 1) * 30px`

## 실전 사용 예제

### API 응답 데이터에 적용

```typescript
import { calculateRadialLayout } from '@/features/mindmap/utils/d3Utils';

// API에서 받은 노드 데이터
interface ApiNode {
  id: string;
  nodeId: number;
  parentId: number | null;
  x: number | null;
  y: number | null;
  keyword: string;
  // ... 기타 필드
}

function applyRadialLayout(apiNodes: ApiNode[]): NodeData[] {
  // 1. x, y가 null인 노드만 필터링
  const nullPositionNodes = apiNodes.filter(n => n.x === null || n.y === null);

  if (nullPositionNodes.length === 0) {
    // 모든 노드에 좌표가 있으면 그대로 반환
    return apiNodes.map(n => ({ ...n, x: n.x!, y: n.y! }));
  }

  // 2. parentId를 문자열 ID로 변환
  const nodesForLayout = apiNodes.map(n => ({
    id: n.id,
    parentId: n.parentId ? apiNodes.find(node => node.nodeId === n.parentId)?.id : null,
  }));

  // 3. 레이아웃 계산
  const positions = calculateRadialLayout(nodesForLayout);

  // 4. 좌표 적용
  return apiNodes.map(node => {
    const pos = positions.find(p => p.id === node.id);
    return {
      ...node,
      x: pos?.x ?? node.x ?? CANVAS_CENTER_X,
      y: pos?.y ?? node.y ?? CANVAS_CENTER_Y,
    };
  });
}

// 사용
const positionedNodes = applyRadialLayout(apiResponseNodes);
```

### React Hook에서 사용

```typescript
import { useMemo } from 'react';
import { calculateRadialLayout } from '@/features/mindmap/utils/d3Utils';

function useMindmapNodes(rawNodes: ApiNode[]) {
  const positionedNodes = useMemo(() => {
    // x, y가 null인 노드 확인
    const needsLayout = rawNodes.some(n => n.x === null || n.y === null);

    if (!needsLayout) {
      return rawNodes;
    }

    // 레이아웃 계산 및 적용
    const nodesForLayout = rawNodes.map(n => ({
      id: n.id,
      parentId: n.parentId ? rawNodes.find(node => node.nodeId === n.parentId)?.id : null,
    }));

    const positions = calculateRadialLayout(nodesForLayout);

    return rawNodes.map(node => {
      const pos = positions.find(p => p.id === node.id);
      return {
        ...node,
        x: pos?.x ?? node.x ?? CANVAS_CENTER_X,
        y: pos?.y ?? node.y ?? CANVAS_CENTER_Y,
      };
    });
  }, [rawNodes]);

  return positionedNodes;
}
```

## 시각적 예제

제공하신 JSON 데이터 (31개 노드)를 기준으로:

```
레벨 0: 노드 1 (프로젝트 마인드맵) - 중앙
  │
  ├─ 레벨 1: 노드 2, 3, 4, 5, 10, 26 (6개) - 루트 주위 360도 분할
  │   │
  │   ├─ 노드 2의 자식: 6, 13 - 노드 2의 섹터(60도) 내에서 2분할
  │   ├─ 노드 3의 자식: 7, 15, 29 - 노드 3의 섹터(60도) 내에서 3분할
  │   └─ ...
  │
  └─ 레벨 2, 3, ... 계속 방사형으로 확장
```

## 커스터마이징

### 간격 조정
```typescript
// 노드 간 간격을 넓히고 싶을 때
const positions = calculateRadialLayout(nodes, undefined, undefined, 300);
// baseRadius를 200 → 300으로 증가
```

### 시작 위치 변경
```typescript
// 좌측 상단에서 시작
const positions = calculateRadialLayout(nodes, 1000, 1000);
```

### 자식 개수 보너스 조정
[d3Utils.ts:307](src/features/mindmap/utils/d3Utils.ts#L307)에서 수정:
```typescript
// 현재: const childCountBonus = Math.max(0, siblingCount - 1) * 30;
// 변경: const childCountBonus = Math.max(0, siblingCount - 1) * 50; // 더 넓은 간격
```

## 주의사항

1. **parentId 참조**: parentId는 실제로 존재하는 노드의 ID를 참조해야 합니다
2. **순환 참조 방지**: 부모-자식 관계에 순환이 없어야 합니다
3. **성능**: 노드가 수백 개 이상일 때는 성능 최적화가 필요할 수 있습니다
4. **캔버스 크기**: CANVAS_WIDTH/HEIGHT (5000x5000)를 벗어나지 않도록 baseRadius 조정
