# Edge-Crossing 방지 방사형 레이아웃 사용법

## 개요

이 레이아웃 시스템은 다음 조건을 **모두 만족**합니다:

1. ✅ **모든 edge는 100% 직선** (곡선 금지)
2. ✅ **Edge 간 교차(crossing) 방지**
3. ✅ **노드 간 충돌 방지** (forceManyBody + forceCollide)
4. ✅ **방사형 트리 구조 유지** (depth별 radius)
5. ✅ **Force simulation 적용**

## 사용 방법

### 1. Import

```typescript
import { calculateRadialLayoutWithForces } from '@/features/mindmap/utils/radialLayoutWithForces';
```

### 2. 기본 사용

```typescript
// 노드 데이터
const nodes = [
  { id: '1', parentId: null },
  { id: '2', parentId: '1' },
  { id: '3', parentId: '1' },
  { id: '4', parentId: '2' },
  // ...
];

// 레이아웃 계산 (비동기)
const positions = await calculateRadialLayoutWithForces(
  nodes,
  2500, // centerX (기본값: CANVAS_CENTER_X)
  2500, // centerY (기본값: CANVAS_CENTER_Y)
  350   // baseRadius (depth당 반지름 증가량)
);

// 결과: [{ id: '1', x: 2500, y: 2500 }, { id: '2', x: 2500, y: 2150 }, ...]
```

### 3. API 응답 노드에 적용

```typescript
import { applyRadialLayoutWithForcesToNodes } from '@/features/mindmap/utils/radialLayoutWithForces';

// API 응답
interface ApiNode {
  id: string;
  nodeId: number;
  parentId: number | null;
  keyword: string;
  x: number | null;
  y: number | null;
  // ...
}

const apiNodes: ApiNode[] = await fetchNodes();

// 레이아웃 적용
const positionedNodes = await applyRadialLayoutWithForcesToNodes(apiNodes);

// positionedNodes에는 계산된 x, y가 포함됨
```

## 알고리즘 동작 원리

### 1단계: D3 Tree Layout (Reingold-Tilford)
- 계층 구조를 트리로 변환
- Edge 교차를 최소화하는 직교좌표 배치
- 형제 노드는 1.5배, 다른 서브트리는 2.5배 간격

### 2단계: 극좌표 변환
```
angle = normalize(tree.x) * 2π
radius = depth * baseRadius
x = centerX + radius * sin(angle)
y = centerY - radius * cos(angle)
```

### 3단계: Force Simulation
```typescript
d3.forceSimulation()
  .force('charge', d3.forceManyBody().strength(-800))      // 강한 반발력
  .force('collide', d3.forceCollide().radius(NODE_RADIUS * 2.8)) // 충돌 방지
  .force('radial', d3.forceRadial((d) => d.radius).strength(0.8)) // 방사형 유지
```

### 4단계: Edge Crossing 검증 및 조정
- 100 tick마다 crossing 개수 체크
- 최종적으로 crossing이 남아있으면 각 depth별로 균등 각도 재배치

## 파라미터 조정 가이드

### `baseRadius` (기본값: 350)
- **역할**: depth당 반지름 증가량
- **작게 하면**: 노드들이 중심에 모임 (compact)
- **크게 하면**: 노드들이 넓게 퍼짐 (spacious)
- **권장값**: 300~500

### Force 파라미터 (radialLayoutWithForces.ts 내부)

현재 최적화된 설정 (노드 겹침 최소화):

```typescript
// 노드 간 반발력 - 더 강하게
forceManyBody().strength(-1200)  // 기본: -1200 (범위: -800 ~ -1500)

// 충돌 반지름 - 더 넓게
forceCollide().radius(NODE_RADIUS * 3.5)  // 기본: 3.5 (범위: 2.5 ~ 4.0)

// 방사형 인력 - 약간 완화
forceRadial().strength(0.7)  // 기본: 0.7 (범위: 0.5 ~ 0.9)

// Tree 분리도 - 더 넓게
separation: a.parent === b.parent ? 2.0 : 3.5  // 형제: 2.0, 다른 서브트리: 3.5
```

**💡 Tip**: 노드가 겹치지 않게 하려면 `forceCollide().radius()`를 크게 설정하세요!

## Edge 렌더링 (직선 강제)

기존의 `createBezierPath`는 이제 직선만 생성합니다:

```typescript
import { createStraightPath, createBezierPath } from '@/features/mindmap/utils/d3Utils';

// 둘 다 동일하게 직선 생성 (createBezierPath는 deprecated alias)
const path1 = createStraightPath({ x: 0, y: 0 }, { x: 100, y: 100 });
const path2 = createBezierPath({ x: 0, y: 0 }, { x: 100, y: 100 });
// 결과: "M 0 0 L 100 100"
```

## 실제 통합 예제

### useCollaborativeNodes.ts 등에서 사용

```typescript
import { calculateRadialLayoutWithForces } from '@/features/mindmap/utils/radialLayoutWithForces';
import { CANVAS_CENTER_X, CANVAS_CENTER_Y } from '@/features/mindmap/utils/d3Utils';

// 노드 추가/생성 후
const handleNodesUpdated = async (newNodes: NodeData[]) => {
  // 좌표가 없는 노드만 필터링
  const needsLayout = newNodes.filter(n => n.x == null || n.y == null);

  if (needsLayout.length === 0) {
    // 이미 모든 노드에 좌표가 있음
    return newNodes;
  }

  // 레이아웃 재계산
  const positions = await calculateRadialLayoutWithForces(
    newNodes,
    CANVAS_CENTER_X,
    CANVAS_CENTER_Y,
    350
  );

  // 위치 업데이트
  const positionMap = new Map(positions.map(p => [p.id, p]));

  return newNodes.map(node => ({
    ...node,
    x: node.x ?? positionMap.get(node.id)?.x ?? CANVAS_CENTER_X,
    y: node.y ?? positionMap.get(node.id)?.y ?? CANVAS_CENTER_Y,
  }));
};
```

## 디버깅

레이아웃 계산 중 콘솔에 다음 로그가 출력됩니다:

```
[RadialForces] Starting layout calculation for 10 nodes
[RadialForces] Initial positions calculated
[RadialForces] Tick 100: 2 edge crossings
[RadialForces] Tick 200: 1 edge crossings
[RadialForces] Tick 300: 0 edge crossings
[RadialForces] Simulation complete after 300 ticks
[RadialForces] Final edge crossings: 0
[RadialForces] Layout complete: 10 nodes positioned
```

Edge crossing이 0이 되지 않으면 자동으로 각도 재조정이 수행됩니다.

## 성능 최적화

- **시뮬레이션 시간**: 보통 300~400 ticks (약 1~2초)
- **노드 100개 미만**: 실시간 계산 가능
- **노드 100개 이상**: 로딩 인디케이터 권장

```typescript
const [isCalculating, setIsCalculating] = useState(false);

const applyLayout = async () => {
  setIsCalculating(true);
  try {
    const positions = await calculateRadialLayoutWithForces(nodes);
    // ...
  } finally {
    setIsCalculating(false);
  }
};
```

## 문제 해결

### Q: Edge가 여전히 교차합니다
A: `baseRadius`를 증가시키거나, `forceManyBody().strength()`를 더 음수로 설정하세요.

### Q: 노드가 너무 멀리 흩어집니다
A: `baseRadius`를 감소시키거나, `forceRadial().strength()`를 증가시키세요.

### Q: 노드가 겹칩니다
A: `forceCollide().radius()`를 증가시키세요 (예: `NODE_RADIUS * 3.2`).

### Q: 레이아웃 계산이 너무 느립니다
A: `maxTicks`를 줄이거나 (400 → 250), `alphaDecay`를 증가시키세요 (0.015 → 0.03).
