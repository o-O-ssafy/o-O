/**
 * OverlayLayer
 * - HTML overlay for Mindmap nodes
 * - D3 transform synchronization with React
 */
import NodeOverlay from "./overlays/NodeOverlay";
import type {
  NodeData,
  ChildNodeRequest,
  MindmapMode,
  DetachedSelectionState,
  DeleteNodePayload,
  EditNodePayload,
  Transform,
} from "../types";

export default function OverlayLayer({
  transform,
  containerSize,
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
  transform: Transform;
  containerSize: { width: number; height: number };
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
  const { x: tx, y: ty, k: zoom } = transform;
  const { width: viewportWidth, height: viewportHeight } = containerSize;
  const OVERSCAN_PX = 200;

  const childCountMap = nodes.reduce<Map<string, number>>((acc, currentNode) => {
    if (currentNode.parentId) {
      const parentIdStr = String(currentNode.parentId);
      acc.set(parentIdStr, (acc.get(parentIdStr) ?? 0) + 1);
    }
    return acc;
  }, new Map());

  return (
    <div className="absolute inset-0 pointer-events-none">
      {nodes.map((node) => {
        // Skip nodes without coordinates
        if (node.x == null || node.y == null) return null;

        // D3 transform: screen coordinates = model * zoom + translate
        const screenX = node.x * zoom + tx;
        const screenY = node.y * zoom + ty;

        // Viewport culling with overscan
        if (
          screenX < -OVERSCAN_PX ||
          screenX > viewportWidth + OVERSCAN_PX ||
          screenY < -OVERSCAN_PX ||
          screenY > viewportHeight + OVERSCAN_PX
        ) {
          return null;
        }

        const nodeId = String(node.id);
        return (
          <NodeOverlay
            key={nodeId}
            node={node}
            x={screenX}
            y={screenY}
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
