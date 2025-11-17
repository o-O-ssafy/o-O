/**
 * OverlayLayer
 * - HTML overlay for Mindmap nodes
 * - Cytoscape overlay synchronization with React
 */
import type { Core } from "cytoscape";
import NodeOverlay from "./overlays/NodeOverlay";
import type {
  NodeData,
  ChildNodeRequest,
  MindmapMode,
  DetachedSelectionState,
  DeleteNodePayload,
  EditNodePayload,
} from "../types";

export default function OverlayLayer({
  cy,
  nodes,
  mode,
  analyzeSelection,
  selectedNodeId,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  onDeleteNode,
  onEditNode,
  onCreateChildNode,
  onBatchNodePositionChange,
  detachedSelectionMap,
  onKeepChildrenDelete,
  onConnectDetachedSelection,
  onDismissDetachedSelection,
}: Readonly<{
  cy: Core | null;
  nodes: NodeData[];
  mode: MindmapMode;
  analyzeSelection: string[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  onDeleteNode: (payload: DeleteNodePayload) => void;
  onEditNode: (payload: EditNodePayload) => void;
  onCreateChildNode: (request: ChildNodeRequest) => void;
  onBatchNodePositionChange?: (
    positions: Array<{ id: string; x: number; y: number }>
  ) => void;
  detachedSelectionMap?: Record<string, DetachedSelectionState>;
  onKeepChildrenDelete?: (payload: { deletedNodeId: string; parentId?: string | null }) => void;
  onConnectDetachedSelection?: (anchorNodeId: string) => void;
  onDismissDetachedSelection?: (anchorNodeId: string) => void;
}>) {
  const zoom = cy?.zoom() ?? 1;
  const container = cy?.container() ?? null;
  const viewportWidth = container?.clientWidth ?? null;
  const viewportHeight = container?.clientHeight ?? null;
  const OVERSCAN_PX = 200;
  const childCountMap = nodes.reduce<Map<string, number>>((acc, currentNode) => {
    if (currentNode.parentId) {
      const parentIdStr = String(currentNode.parentId);
      acc.set(parentIdStr, (acc.get(parentIdStr) ?? 0) + 1);
    }
    return acc;
  }, new Map());

  // Debug: 첫 3개 노드의 memo 확인
  console.log("[OverlayLayer] First 3 nodes:", nodes.slice(0, 3).map(n => ({
    id: n.id,
    keyword: n.keyword,
    memo: n.memo,
    hasMemo: !!n.memo
  })));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {cy &&
        nodes.map((node) => {
          const el = cy.getElementById(node.id);
          if (!el || el.empty()) return null;

          const { x, y } = el.renderedPosition();
          if (
            viewportWidth !== null &&
            viewportHeight !== null &&
            (x < -OVERSCAN_PX ||
              x > viewportWidth + OVERSCAN_PX ||
              y < -OVERSCAN_PX ||
              y > viewportHeight + OVERSCAN_PX)
          ) {
            return null;
          }

          const nodeId = String(node.id);
          return (
            <NodeOverlay
              key={nodeId}
              node={node}
              x={x}
              y={y}
              zoom={zoom}
              hasChildren={(childCountMap.get(nodeId) ?? 0) > 0}
              mode={mode}
              isAnalyzeSelected={analyzeSelection.includes(nodeId)}
              isSelected={selectedNodeId === nodeId}
              onSelect={() => onNodeSelect(nodeId)}
              onDeselect={onNodeUnselect}
              onApplyTheme={onApplyTheme}
              onDeleteNode={onDeleteNode}
              onEditNode={onEditNode}
              onCreateChildNode={onCreateChildNode}
              onBatchNodePositionChange={onBatchNodePositionChange}
              detachedSelection={detachedSelectionMap?.[nodeId]}
              onKeepChildrenDelete={onKeepChildrenDelete}
              onConnectDetachedSelection={onConnectDetachedSelection}
              onDismissDetachedSelection={onDismissDetachedSelection}
            />
          );
        })}
    </div>
  );
}
