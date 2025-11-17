import { memo, useCallback, useState, useEffect, useRef } from "react";
import RadialToolGroup from "./RadialToolGroup";
import RecommendNodeOverlay from "./RecommendNodeOverlay";
import NodeEditForm from "./NodeEditForm";
import NodeDetailModal from "./NodeDetailModal";
import { useNodeTextEdit } from "../../hooks/custom/useNodeTextEdit";
import { useNodeAdd } from "../../hooks/custom/useNodeAdd";
import { useNodeColorEdit } from "../../hooks/custom/useNodeColorEdit";
import { useNodeFocus } from "../../hooks/custom/useNodeFocus";
import { useNodeZIndex } from "../../hooks/custom/useNodeZIndex";
import { useNodeHandlers } from "../../hooks/custom/useNodeHandlers";
import { getContrastTextColor } from "@/shared/utils/colorUtils";
import { createRadialGradient } from "@/shared/utils/gradientUtils";
import type { CytoscapeNodeOverlayProps, RecommendNodeData } from "../../types";
import warningPopoImage from "@/shared/assets/images/warning_popo.webp";
import ConfirmDialog from "../../../../shared/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PhotoSizeSelectActualOutlinedIcon from "@mui/icons-material/PhotoSizeSelectActualOutlined";
import {
  applyDragForce,
  findNearestNode,
  NODE_RADIUS,
} from "../../utils/d3Utils";
function NodeOverlay({
  node,
  x,
  y,
  zoom,
  hasChildren,
  mode,
  isSelected,
  isAnalyzeSelected,
  allNodes = [], // 🔥 force simulation을 위한 전체 노드 정보
  canvasApi, // 🔥 D3Canvas API (focusOnNode 등)
  aiRecommendations = [], // AI 추천 노드 목록
  trendRecommendations = [], // 트렌드 추천 노드 목록
  isLoadingRecommendation = false, // 추천 로딩 상태
  setIsLoadingRecommendation, // 로딩 상태 설정 함수
  workspaceId,
  isReadOnly = false,
  onSelect,
  onDeselect,
  onApplyTheme,
  onDeleteNode,
  onEditNode,
  onCreateChildNode,
  onBatchNodePositionChange,
  detachedSelection,
  onKeepChildrenDelete,
  onConnectDetachedSelection,
  onDismissDetachedSelection,
}: Readonly<CytoscapeNodeOverlayProps>) {
  const { keyword, memo, color: initialColor } = node;
  const isAnalyzeMode = mode === "analyze";
  const isEditDisabled = isReadOnly || isAnalyzeMode;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [hasMoved, setHasMoved] = useState(false);
  const dragThrottleRef = useRef<number>(0); // 🔥 드래그 중 force simulation 스로틀링

  const {
    isEditing,
    editValue,
    editMemo,
    setEditValue,
    setEditMemo,
    startEdit,
    cancelEdit,
    confirmEdit,
  } = useNodeTextEdit(keyword, memo);
  const { showAddInput, openAddInput, closeAddInput } = useNodeAdd();
  const { paletteOpen, togglePalette, closePalette } =
    useNodeColorEdit(initialColor);
  const { focusedButton, setFocusedButton } = useNodeFocus();

  // 노드 선택 해제 시 모달 및 추천 오버레이 닫기
  useEffect(() => {
    if (!isSelected) {
      setDetailModalOpen(false);
      setFocusedButton(null);
    }
  }, [isSelected, setFocusedButton]);

  const {
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
  } = useNodeHandlers({
    id: node.id,
    x: node.x,
    y: node.y,
    initialColor,
    isSelected,
    nodeId: node.nodeId,
    workspaceId,
    setIsLoadingRecommendation,
    onSelect,
    onDeselect,
    setFocusedButton,
    deleteNode: onDeleteNode,
    editNode: onEditNode,
    startEdit,
    cancelEdit,
    confirmEdit,
    openAddInput,
    closeAddInput,
    togglePalette,
    closePalette,
    paletteOpen,
    onCreateChildNode,
  });

  const handleDeleteRequest = useCallback(() => {
    // 루트 노드(nodeId === 1)는 삭제 불가
    if (node.nodeId === 1) {
      return;
    }

    if (hasChildren) {
      setFocusedButton(null);
      setDeleteDialogOpen(true);
      return;
    }
    handleDelete();
  }, [node.nodeId, hasChildren, handleDelete, setFocusedButton]);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDeleteOnlyCurrent = useCallback(() => {
    if (hasChildren) {
      onKeepChildrenDelete?.({
        deletedNodeId: node.id,
        parentId: node.parentId ? String(node.parentId) : null,
      });
    }
    handleDelete();
    setDeleteDialogOpen(false);
  }, [handleDelete, hasChildren, node.id, node.parentId, onKeepChildrenDelete]);

  const handleDeleteWithChildren = useCallback(() => {
    handleDelete({ deleteDescendants: true });
    setDeleteDialogOpen(false);
  }, [handleDelete]);

  const handleConnectDetachedSelection = useCallback(() => {
    if (!detachedSelection) return;
    onConnectDetachedSelection?.(detachedSelection.anchorNodeId);
  }, [detachedSelection, onConnectDetachedSelection]);

  const handleDismissDetachedSelection = useCallback(() => {
    if (!detachedSelection) return;
    onDismissDetachedSelection?.(detachedSelection.anchorNodeId);
  }, [detachedSelection, onDismissDetachedSelection]);

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // 분석 모드에서는 모달을 열지 않음
      if (isAnalyzeMode) {
        return;
      }
      if (node.type === "image" || node.type === "video") {
        setDetailModalOpen((prev) => !prev);
      }
    },
    [node.type, isAnalyzeMode]
  );

  // 드래그/클릭 핸들러
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isAnalyzeMode) {
        // analyze 모드에서는 클릭만 처리
        onSelect();
        return;
      }

      if (isReadOnly) {
        // 읽기 전용 모드에서는 드래그 비활성화, 클릭만 처리
        onSelect();
        return;
      }

      // edit 모드: 드래그 시작
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setHasMoved(false);
    },
    [isAnalyzeMode, isReadOnly, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        !isDragging ||
        !dragStart ||
        !onBatchNodePositionChange ||
        isAnalyzeMode
      )
        return;

      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      // 움직임이 있으면 hasMoved 설정
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        setHasMoved(true);
      }

      const newX = node.x + dx;
      const newY = node.y + dy;

      // 좌표를 100~4900 범위로 제한 (100px 마진으로 노드가 경계에서 잘리지 않도록)
      const MARGIN = 100;
      const CANVAS_MIN = MARGIN;
      const CANVAS_MAX = 5000 - MARGIN;
      const clampedX = Math.max(CANVAS_MIN, Math.min(CANVAS_MAX, newX));
      const clampedY = Math.max(CANVAS_MIN, Math.min(CANVAS_MAX, newY));

      // 🔥 드래그 중에는 밀어내기 없이 드래그 노드만 업데이트
      onBatchNodePositionChange([
        {
          id: node.id,
          x: clampedX,
          y: clampedY,
        },
      ]);

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [
      isDragging,
      dragStart,
      zoom,
      node.x,
      node.y,
      node.id,
      onBatchNodePositionChange,
      isAnalyzeMode,
    ]
  );

  const handleMouseUp = useCallback(() => {
    // 드래그하지 않고 클릭만 한 경우
    if (!hasMoved) {
      if (isAnalyzeMode) {
        // 분석 모드: 즉시 onSelect 호출 (토글 동작)
        onSelect();
      } else {
        // 편집 모드: 노드 중앙 포커스 후 onSelect 호출
        // 🔥 노드를 화면 중앙으로 이동하고 최대 줌 레벨로 확대
        if (canvasApi && canvasApi.focusOnNode) {
          canvasApi.focusOnNode(node.id);

          // 이미 최대 확대 상태(zoom >= 1.2)라면 짧은 시간(100ms) 후 표시
          // 그렇지 않으면 애니메이션 완료 후(500ms) 표시
          const delay = zoom >= 1.2 ? 100 : 500;

          setTimeout(() => {
            onSelect();
            // 이미지 또는 비디오 노드인 경우 모달 자동 열기
            if (node.type === "image" || node.type === "video") {
              setDetailModalOpen(true);
            }
          }, delay);
        } else {
          // canvasApi가 없으면 즉시 선택
          onSelect();
          // 이미지 또는 비디오 노드인 경우 모달 자동 열기
          if (node.type === "image" || node.type === "video") {
            setDetailModalOpen(true);
          }
        }
      }
    }

    // 🔥 드래그 종료 시 주변 노드들을 부드럽게 밀어내기 (편집 모드에서만)
    if (
      hasMoved &&
      !isAnalyzeMode &&
      allNodes.length > 1 &&
      onBatchNodePositionChange
    ) {
      // Force simulation 적용 (부드럽게 밀어내기)
      const pushedNodes = applyDragForce(
        node.id,
        allNodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
        NODE_RADIUS * 4 // 거리 임계값 (약 320px)
      );

      // 밀려난 노드들의 위치만 업데이트
      const updates = pushedNodes
        .filter((p) => p.id !== node.id) // 드래그 노드 제외
        .map((p) => ({ id: p.id, x: p.x, y: p.y }));

      if (updates.length > 0) {
        onBatchNodePositionChange(updates);
      }

      // 가까운 노드 찾기 (거리 임계값 200px 이내)
      const nearestNode = findNearestNode(
        { id: node.id, x: node.x, y: node.y },
        allNodes.map((n) => ({
          id: n.id,
          x: n.x,
          y: n.y,
          parentId: n.parentId ? String(n.parentId) : null,
        })),
        200
      );

      // 🔥 가까운 노드가 있고, 현재 부모와 다른 경우 부모 재연결
      if (nearestNode && nearestNode.id !== node.parentId) {
        const targetNode = allNodes.find((n) => n.id === nearestNode.id);

        // 루트 노드(nodeId가 1)를 드래그한 경우
        if (node.nodeId === 1) {
          // 루트 노드는 부모가 변경되지 않고, 대상 노드의 부모를 루트로 변경
          onEditNode({
            nodeId: nearestNode.id,
            newText: targetNode?.keyword,
            newMemo: targetNode?.memo,
            newParentId: node.id, // 대상 노드의 부모를 루트로 변경
          });
        } else {
          // 일반 노드를 드래그한 경우: 기존처럼 드래그한 노드의 부모 변경
          onEditNode({
            nodeId: node.id,
            newText: node.keyword,
            newMemo: node.memo,
            newParentId: nearestNode.id,
          });
        }
      }
    }

    // 드래그가 끝났을 때는 이미 onEditNode로 Y.Map이 업데이트되어 있음
    // useMindmapSync에서 300ms debounce 후 마지막 업데이트만 서버로 전송됨

    setIsDragging(false);
    setDragStart(null);
    setHasMoved(false);
  }, [
    hasMoved,
    isAnalyzeMode,
    onSelect,
    canvasApi,
    allNodes,
    node.id,
    node.x,
    node.y,
    node.keyword,
    node.memo,
    node.nodeId,
    node.parentId,
    node.type,
    zoom,
    onBatchNodePositionChange,
    onEditNode,
  ]);

  // 드래그 이벤트 리스너 등록
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const zIndex = useNodeZIndex({ focusedButton, isSelected });
  const textColor = getContrastTextColor(initialColor);

  const selectionRingClass = isAnalyzeMode
    ? isAnalyzeSelected
      ? "ring-4 ring-emerald-400"
      : "ring-2 ring-slate-200"
    : isSelected
      ? "ring-4 ring-primary/30"
      : "";

  return (
    <>
      <div
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: `translate(-50%, -50%) scale(${zoom})`,
          zIndex,
          pointerEvents: "none", // 기본은 none, 자식 요소에서 개별 설정
          transition: "none", // 애니메이션 제거
        }}
      >
        <div
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center ${selectionRingClass}`}
          style={{
            background: createRadialGradient(initialColor),
            pointerEvents: "auto", // 노드 원형은 클릭 가능
            cursor: isAnalyzeMode
              ? "pointer"
              : isDragging
                ? "grabbing"
                : "grab",
            userSelect: "none", // 드래그 중 텍스트 선택 방지
            transition: "none", // transition-all 제거
          }}
          data-node-id={node.id}
          data-has-memo={!!memo}
          onMouseDown={handleMouseDown}
        >
          {isEditing ? (
            <NodeEditForm
              value={editValue}
              memo={editMemo}
              onChange={setEditValue}
              onMemoChange={setEditMemo}
              onConfirm={handleEditConfirm}
              onCancel={handleEditCancel}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center px-4 text-center"
              style={{
                pointerEvents: "none",
              }}
            >
              {node.type === "image" ? (
                <>
                  <div
                    className="rounded-lg mb-1 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleIconClick}
                  >
                    <PhotoSizeSelectActualOutlinedIcon
                      sx={{ fontSize: 60, color: textColor }}
                    />
                  </div>
                  {memo && (
                    <span
                      className="font-paperlogy text-xs leading-tight break-words line-clamp-2"
                      style={{ color: textColor, opacity: 0.85 }}
                    >
                      {memo}
                    </span>
                  )}
                </>
              ) : node.type === "video" ? (
                <>
                  <div
                    className="rounded-lg mb-1 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleIconClick}
                  >
                    <YouTubeIcon sx={{ fontSize: 60, color: textColor }} />
                  </div>
                  {memo && (
                    <span
                      className="font-paperlogy text-xs leading-tight break-words line-clamp-2"
                      style={{ color: textColor, opacity: 0.85 }}
                    >
                      {memo}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span
                    className="font-paperlogy font-bold text-base mb-1 break-words"
                    style={{ color: textColor }}
                  >
                    {keyword}
                  </span>
                  {memo && (
                    <span
                      className="font-paperlogy text-xs leading-tight break-words line-clamp-3"
                      style={{ color: textColor, opacity: 0.85 }}
                    >
                      {memo}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {!isAnalyzeMode && !isReadOnly && (
          <RadialToolGroup
            open={
              isSelected &&
              !isEditing &&
              focusedButton !== "recommend" &&
              zoom >= 1.2
            }
            paletteOpen={paletteOpen}
            addInputOpen={showAddInput}
            currentColor={initialColor}
            focusedButton={focusedButton}
            centerX={x}
            centerY={y}
            onClose={onDeselect}
            onDelete={node.nodeId === 1 ? undefined : handleDeleteRequest}
            onEdit={handleEdit}
            onAdd={handleAdd}
            onAddConfirm={handleAddConfirm}
            onAddCancel={handleAddCancel}
            onPalette={handlePalette}
            onPaletteClose={handlePaletteClose}
            onRecommend={handleRecommend}
            onColorChange={handleColorChange}
            onApplyTheme={onApplyTheme}
          />
        )}

        {!isAnalyzeMode && !isReadOnly && focusedButton === "recommend" && isSelected && zoom >= 1.2 && (
          <RecommendNodeOverlay
            open={focusedButton === "recommend"}
            onClose={() => setFocusedButton(null)}
            onSelectRecommendation={handleRecommendSelect}
            selectedNodeX={x}
            selectedNodeY={y}
            trendRecommendations={trendRecommendations}
            aiRecommendations={aiRecommendations}
            isLoading={isLoadingRecommendation}
          />
        )}

        {!isAnalyzeMode && detachedSelection && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 pointer-events-auto flex flex-col items-start gap-2">
            <Button
              className="rounded-2xl bg-[#2C4A7C] hover:bg-[#1e3456] px-5 py-2 text-sm font-semibold text-white shadow-lg"
              onClick={handleConnectDetachedSelection}
            >
              아이디어 연결하기
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-[#2C4A7C] hover:underline"
              onClick={handleDismissDetachedSelection}
            >
              이대로 유지하기
            </button>
          </div>
        )}
      </div>

      {deleteDialogOpen && (
        <div className="pointer-events-auto">
          <ConfirmDialog
            isOpen={deleteDialogOpen}
            characterImage={warningPopoImage}
            title="주의"
            description={
              "선택한 아이디어에 하위 아이디어가 있습니다.\n하위 아이디어까지 삭제하시겠습니까?"
            }
            onClose={handleDeleteDialogClose}
            buttons={[
              {
                id: "delete-all",
                text: "모두 삭제",
                onClick: handleDeleteWithChildren,
                variant: "outline",
              },
              {
                id: "delete-current",
                text: "선택한 아이디어만 삭제",
                onClick: handleDeleteOnlyCurrent,
              },
            ]}
          />
        </div>
      )}

      <NodeDetailModal
        isOpen={detailModalOpen}
        node={node}
        nodeX={x}
        nodeY={y}
        onClose={() => setDetailModalOpen(false)}
      />
    </>
  );
}

export default memo(
  NodeOverlay,
  (prev, next) =>
    prev.node.id === next.node.id &&
    prev.node.keyword === next.node.keyword &&
    prev.node.memo === next.node.memo &&
    prev.node.color === next.node.color &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.zoom === next.zoom &&
    prev.mode === next.mode &&
    prev.hasChildren === next.hasChildren &&
    prev.isSelected === next.isSelected &&
    prev.isAnalyzeSelected === next.isAnalyzeSelected &&
    prev.detachedSelection?.id === next.detachedSelection?.id &&
    prev.aiRecommendations === next.aiRecommendations &&
    prev.trendRecommendations === next.trendRecommendations
);
