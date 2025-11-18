import { useCallback } from "react";
import type {
  ChildNodeRequest,
  DeleteNodePayload,
  EditNodePayload,
  NodeData,
} from "../../types";
import type { FocusedButton } from "./useNodeFocus";
import { requestNodeAnalysis } from "@/services/mindmapService";

type UseNodeHandlersParams = {
  id: string;
  x: number;
  y: number;
  initialColor: string;
  isSelected: boolean;
  nodeId?: number; // Backend node ID
  workspaceId?: string;
  setIsLoadingRecommendation?: (isLoading: boolean) => void; // 로딩 상태 설정 함수
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
  setIsLoadingRecommendation,
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
    setFocusedButton("edit");
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
    setFocusedButton("add");
  }, [openAddInput, setFocusedButton]);

  const handleAddCancel = useCallback(() => {
    closeAddInput();
    setFocusedButton(null);
  }, [closeAddInput, setFocusedButton]);

  const handleAddConfirm = useCallback(
    (keyword: string, description: string, mediaData?: import("@/features/home/types").MediaData) => {
      if (keyword || mediaData?.type) {
        onCreateChildNode({
          parentId: id,
          parentX: x,
          parentY: y,
          keyword: keyword,
          memo: description || undefined,
          mediaData: mediaData,
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
    setFocusedButton(willBeOpen ? "palette" : null);
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
    // UI 열기
    setFocusedButton("recommend");

    // AI + 트렌드 통합 추천 요청
    if (nodeId && workspaceId) {
      try {
        console.log(
          "[handleRecommend] Requesting AI+Trend analysis for nodeId:",
          nodeId
        );

        // 로딩 시작
        setIsLoadingRecommendation?.(true);

        // AI + 트렌드 통합 분석 요청 (서버에서 맥락을 자동으로 수집)
        await requestNodeAnalysis(workspaceId, nodeId);

        console.log(
          "[handleRecommend] ✅ AI+Trend analysis request sent successfully"
        );
      } catch (error) {
        console.error(
          "[handleRecommend] Failed to request AI+Trend analysis:",
          error
        );
        // 에러 발생 시 로딩 종료
        setIsLoadingRecommendation?.(false);
      }
    }
  }, [setFocusedButton, nodeId, workspaceId, setIsLoadingRecommendation]);

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
