import { useCallback } from "react";
import type {
  ChildNodeRequest,
  DeleteNodePayload,
  EditNodePayload,
  NodeData,
} from "../../types";
import type { FocusedButton } from './useNodeFocus';
import { requestNodeAnalysis } from "@/services/mindmapService";

type UseNodeHandlersParams = {
  id: string;
  x: number;
  y: number;
  initialColor: string;
  isSelected: boolean;
  nodeId?: number; // Backend node ID
  workspaceId?: string;
  allNodes?: NodeData[]; // All nodes for finding ancestors
  onSelect: () => void;
  onDeselect: () => void;
  setFocusedButton: (button: FocusedButton) => void;
  deleteNode: (payload: DeleteNodePayload) => void;
  editNode: (payload: EditNodePayload) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  confirmEdit: () => { text: string; memo: string };
  openAddInput: () => void;
  closeAddInput: () => void;
  togglePalette: () => void;
  closePalette: () => void;
  paletteOpen: boolean;
  onCreateChildNode: (request: ChildNodeRequest) => void;
};

export const useNodeHandlers = ({
  id,
  x,
  y,
  initialColor,
  isSelected,
  nodeId,
  workspaceId,
  allNodes,
  onSelect,
  onDeselect,
  setFocusedButton,
  deleteNode,
  editNode,
  startEdit,
  cancelEdit,
  confirmEdit,
  openAddInput,
  closeAddInput,
  togglePalette,
  closePalette,
  paletteOpen,
  onCreateChildNode,
}: UseNodeHandlersParams) => {
  const handleClick = useCallback(() => {
    if (isSelected) {
      onDeselect();
      setFocusedButton(null);
    } else {
      onSelect();
      setFocusedButton(null);
    }
  }, [isSelected, onDeselect, onSelect, setFocusedButton]);

  const handleDelete = useCallback(
    (options?: { deleteDescendants?: boolean }) => {
      deleteNode({
        nodeId: id,
        deleteDescendants: options?.deleteDescendants,
      });
      onDeselect();
      setFocusedButton(null);
    },
    [deleteNode, id, onDeselect, setFocusedButton]
  );

  const handleEdit = useCallback(() => {
    startEdit();
    setFocusedButton('edit');
  }, [startEdit, setFocusedButton]);

  const handleEditCancel = useCallback(() => {
    cancelEdit();
    setFocusedButton(null);
  }, [cancelEdit, setFocusedButton]);

  const handleEditConfirm = useCallback(() => {
    const { text: newText, memo: newMemo } = confirmEdit();
    if (newText) {
      editNode({ nodeId: id, newText, newMemo });
    }
    setFocusedButton(null);
  }, [confirmEdit, editNode, id, setFocusedButton]);

  const handleAdd = useCallback(() => {
    openAddInput();
    setFocusedButton('add');
  }, [openAddInput, setFocusedButton]);

  const handleAddCancel = useCallback(() => {
    closeAddInput();
    setFocusedButton(null);
  }, [closeAddInput, setFocusedButton]);

  const handleAddConfirm = useCallback(
    (keyword: string, description: string) => {
      if (keyword) {
        onCreateChildNode({
          parentId: id,
          parentX: x,
          parentY: y,
          keyword: keyword,
          memo: description || undefined,
        });
        closeAddInput();
      }
      setFocusedButton(null);
    },
    [id, x, y, onCreateChildNode, closeAddInput, setFocusedButton]
  );

  const handlePalette = useCallback(() => {
    const willBeOpen = !paletteOpen;
    togglePalette();
    setFocusedButton(willBeOpen ? 'palette' : null);
  }, [paletteOpen, togglePalette, setFocusedButton]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      if (newColor === initialColor) {
        return;
      }
      editNode({ nodeId: id, newColor });
    },
    [id, initialColor, editNode]
  );

  const handlePaletteClose = useCallback(() => {
    closePalette();
    setFocusedButton(null);
  }, [closePalette, setFocusedButton]);

  const handleRecommend = useCallback(async () => {
    // AI 추천 요청
    if (nodeId && workspaceId && allNodes) {
      try {
        // 현재 노드부터 루트까지의 조상 경로 찾기
        const ancestorPath: Array<{ nodeId: number; parentId: number | null; keyword: string; memo: string }> = [];

        // 현재 노드 찾기
        const currentNode = allNodes.find(n => n.id === id);
        if (!currentNode || !currentNode.nodeId) {
          console.warn("[handleRecommend] Current node not found or missing nodeId");
          setFocusedButton('recommend');
          return;
        }

        // 조상 경로 구축 (현재 노드 -> 루트)
        let node: NodeData | undefined = currentNode;
        while (node) {
          ancestorPath.push({
            nodeId: node.nodeId as number,
            parentId: typeof node.parentId === 'number' ? node.parentId : null,
            keyword: node.keyword,
            memo: node.memo || "",
          });

          // 부모 노드 찾기
          if (!node.parentId) break;

          const parentIdNum = typeof node.parentId === 'number'
            ? node.parentId
            : Number(node.parentId);

          node = allNodes.find(n => n.nodeId === parentIdNum);
        }

        console.log("[handleRecommend] Requesting AI analysis with ancestor path:", ancestorPath);

        // AI 분석 요청
        await requestNodeAnalysis(workspaceId, nodeId, ancestorPath);

        console.log("[handleRecommend] ✅ AI analysis request sent successfully");
      } catch (error) {
        console.error("[handleRecommend] Failed to request AI analysis:", error);
      }
    }

    // UI 열기
    setFocusedButton('recommend');
  }, [setFocusedButton, nodeId, workspaceId, allNodes, id]);

  const handleRecommendSelect = useCallback(
    (recommendText: string) => {
      onCreateChildNode({
        parentId: id,
        parentX: x,
        parentY: y,
        keyword: recommendText,
      });
      setFocusedButton(null);
    },
    [id, x, y, onCreateChildNode, setFocusedButton]
  );

  return {
    handleClick,
    handleDelete,
    handleEdit,
    handleEditCancel,
    handleEditConfirm,
    handleAdd,
    handleAddCancel,
    handleAddConfirm,
    handlePalette,
    handleColorChange,
    handlePaletteClose,
    handleRecommend,
    handleRecommendSelect,
  };
};
