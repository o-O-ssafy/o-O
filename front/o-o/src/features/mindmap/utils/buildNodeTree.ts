import type { NodeData } from "../types";

export type TreeNode = NodeData & {
  children: TreeNode[];
  depth: number;
};

/**
 * 선택된 노드들을 계층 구조(트리)로 변환
 *
 * @param selectedNodes - 선택된 노드 배열
 * @returns 루트 노드들의 배열 (각 노드는 children을 가짐)
 */
export function buildNodeTree(selectedNodes: NodeData[]): TreeNode[] {
  if (selectedNodes.length === 0) return [];

  console.log('[buildNodeTree] 선택된 노드들:', selectedNodes.map(n => ({
    keyword: n.keyword,
    id: n.id,
    nodeId: (n as any).nodeId,
    parentId: n.parentId
  })));

  // 1단계: nodeId -> id 매핑 생성 (D3Canvas와 동일한 방식)
  const nodeIdToIdMap = new Map<number, string>();
  for (const node of selectedNodes) {
    const nodeIdValue = (node as any).nodeId;
    if (nodeIdValue !== undefined) {
      nodeIdToIdMap.set(Number(nodeIdValue), node.id);
    }
  }

  console.log('[buildNodeTree] nodeId -> id 매핑:', Array.from(nodeIdToIdMap.entries()));


  // 2단계: 모든 노드를 TreeNode로 변환하고 Map에 저장
  const nodeMap = new Map<string, TreeNode>();

  selectedNodes.forEach((node) => {
    nodeMap.set(String(node.id), {
      ...node,
      children: [],
      depth: 0,
    });
  });

  // 3단계: 루트 노드와 자식 노드 분류
  const roots: TreeNode[] = [];

  selectedNodes.forEach((node) => {
    const nodeIdStr = String(node.id);
    const treeNode = nodeMap.get(nodeIdStr)!;

    // parentId를 실제 노드 id로 변환 (D3Canvas와 동일한 방식)
    let actualParentId: string | null = null;
    if (node.parentId && node.parentId !== "0") {
      const parentIdNum = Number(node.parentId);
      if (!isNaN(parentIdNum) && nodeIdToIdMap.has(parentIdNum)) {
        actualParentId = nodeIdToIdMap.get(parentIdNum)!;
      } else {
        actualParentId = String(node.parentId);
      }
    }

    console.log(`[buildNodeTree] ${node.keyword}:`, {
      parentId: node.parentId,
      parentIdNum: node.parentId ? Number(node.parentId) : null,
      actualParentId,
      hasParentInSelection: actualParentId ? nodeMap.has(actualParentId) : false,
      willBeRoot: !actualParentId || !nodeMap.has(actualParentId)
    });

    // 부모가 선택되지 않았거나 없는 경우 → 루트로 표시
    if (!actualParentId || !nodeMap.has(actualParentId)) {
      console.log(`  → 루트로 추가`);
      roots.push(treeNode);
    } else {
      // 부모가 선택된 경우 → 자식 노드로 추가
      const parent = nodeMap.get(actualParentId)!;
      console.log(`  → ${parent.keyword}의 자식으로 추가`);
      treeNode.depth = parent.depth + 1;
      parent.children.push(treeNode);
    }
  });

  // 3단계: 각 레벨에서 자식들을 정렬 (선택 순서 유지 또는 텍스트 기준)
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(roots);

  // 트리 구조를 재귀적으로 출력
  const printTree = (nodes: TreeNode[], indent = 0) => {
    nodes.forEach(node => {
      console.log(`${'  '.repeat(indent)}${node.keyword} (depth: ${node.depth}, children: ${node.children.length})`);
      if (node.children.length > 0) {
        printTree(node.children, indent + 1);
      }
    });
  };

  console.log('[buildNodeTree] 최종 트리 구조:');
  printTree(roots);

  return roots;
}
