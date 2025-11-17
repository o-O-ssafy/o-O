// ============================================
// Mindmap UI Component Props Types
// ============================================

// D3 Transform type (replaces Cytoscape)
export type Transform = {
  x: number;
  y: number;
  k: number;
};

// NodeAddInput.tsx
export type NodeAddInputProps = Readonly<{
  open: boolean;
  onConfirm: (keyword: string, description: string) => void;
  onCancel: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  centerX?: number;
  centerY?: number;
  buttonOffsetX?: number;
  buttonOffsetY?: number;
}>;

// ColorPalette.tsx
export type ColorPaletteProps = Readonly<{
  open: boolean;
  onColorChange?: (color: string) => void;
  onApplyTheme?: (colors: string[]) => void;
  onClose?: () => void;
  value?: string;
  className?: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}>;

export type MindmapMode = "edit" | "analyze";

// CytoscapeCanvas.tsx
export type CytoscapeCanvasProps = Readonly<{
  nodes: NodeData[];
  className?: string;
  mode: MindmapMode;
  analyzeSelection: string[];
  selectedNodeId: string | null;
  isReadOnly?: boolean;
  onNodeSelect: (nodeId: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  onDeleteNode: (payload: DeleteNodePayload) => void;
  onEditNode: (payload: EditNodePayload) => void;
  onBatchNodePositionChange?: (
    positions: Array<{ id: string; x: number; y: number }>
  ) => void;
  onCyReady?: (cy: any) => void;
  onCreateChildNode: (request: ChildNodeRequest) => void;
  onAnalyzeNodeToggle: (nodeId: string) => void;
  detachedSelectionMap?: Record<string, DetachedSelectionState>;
  onKeepChildrenDelete?: (payload: {
    deletedNodeId: string;
    parentId?: string | null;
  }) => void;
  onConnectDetachedSelection?: (anchorNodeId: string) => void;
  onDismissDetachedSelection?: (anchorNodeId: string) => void;
}>;

export type CytoscapeNodeOverlayProps = {
  node: NodeData;
  x: number;
  y: number;
  zoom: number;
  hasChildren: boolean;
  isSelected: boolean;
  mode: MindmapMode;
  isAnalyzeSelected: boolean;
  allNodes?: NodeData[]; // 🔥 force simulation을 위한 전체 노드 정보
  canvasApi?: any; // D3Canvas mockCy 객체 (focusOnNode 등의 API)
  aiRecommendations?: RecommendNodeData[]; // AI 추천 노드 목록
  trendRecommendations?: RecommendNodeData[]; // 트렌드 추천 노드 목록
  isLoadingRecommendation?: boolean; // 추천 로딩 상태
  setIsLoadingRecommendation?: (isLoading: boolean) => void; // 로딩 상태 설정 함수
  workspaceId?: string; // 워크스페이스 ID (AI 분석 요청에 필요)
  isReadOnly?: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  onDeleteNode: (payload: DeleteNodePayload) => void;
  onEditNode: (payload: EditNodePayload) => void;
  onCreateChildNode: (request: ChildNodeRequest) => void;
  onBatchNodePositionChange?: (
    positions: Array<{ id: string; x: number; y: number }>
  ) => void;
  detachedSelection?: DetachedSelectionState;
  onKeepChildrenDelete?: (payload: {
    deletedNodeId: string;
    parentId?: string | null;
  }) => void;
  onConnectDetachedSelection?: (anchorNodeId: string) => void;
  onDismissDetachedSelection?: (anchorNodeId: string) => void;
};

// RadialToolGroup.tsx
export type RadialToolGroupProps = Readonly<{
  open: boolean;
  radius?: number;
  paletteOpen?: boolean;
  addInputOpen?: boolean;
  currentColor?: string;
  focusedButton?: "delete" | "add" | "edit" | "palette" | "recommend" | null;
  centerX?: number;
  centerY?: number;
  onClose?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  onAddConfirm?: (keyword: string, description: string) => void;
  onAddCancel?: () => void;
  onPalette?: () => void;
  onPaletteClose?: () => void;
  onRecommend?: () => void;
  onColorChange?: (color: string) => void;
  onApplyTheme?: (colors: string[]) => void;
}>;

// RecommendNodeOverlay.tsx
export type RecommendNodeData = {
  id: string;
  keyword: string;
  memo?: string; // AI 추천의 경우 메모 포함
  type: "ai" | "trend";
};

export type RecommendNodeOverlayProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onSelectRecommendation: (text: string) => void;
  selectedNodeX: number;
  selectedNodeY: number;
  trendRecommendations?: RecommendNodeData[];
  aiRecommendations?: RecommendNodeData[];
  isLoading?: boolean; // 추천 로딩 상태
}>;

// Textbox.tsx
export type TextboxProps = Readonly<{
  onAddNode: (text: string) => void;
  disabled?: boolean;
}>;

// ============================================
// Data Types
//  Yjs · REST API · Redux가 동일한 데이터 구조를 공유하도록 함
// ============================================

export type MindmapNodeType = "text" | "image" | "video" | "link";

export type NodeAnalysisStatus =
  | "NONE"
  | "PENDING"
  | "PROCESSING"
  | "DONE"
  | "FAILED";

export type NodeOperation = "ADD" | "UPDATE" | "DELETE";

// Mindmap nodes can carry optional metadata from REST → Yjs → UI
export type NodeData = {
  id: string;
  nodeId?: number; // Backend DB ID (for update/delete operations)
  workspaceId?: number; // Workspace ID (required for backend persistence)
  keyword: string;
  x: number;
  y: number;
  color: string;
  parentId?: string | number | null; // Frontend uses string IDs, backend uses numeric nodeId (0 for root)
  memo?: string;
  type?: MindmapNodeType;
  contentUrl?: string;
  analysisStatus?: NodeAnalysisStatus;
  operation?: NodeOperation; // Operation type for backend sync (ADD/UPDATE/DELETE)
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChildNodeRequest = {
  parentId: string;
  parentX: number;
  parentY: number;
  keyword: string;
  memo?: string;
};

export type DeleteNodePayload = {
  nodeId: string;
  deleteDescendants?: boolean;
};

export type EditNodePayload = {
  nodeId: string;
  newText?: string;
  newMemo?: string;
  newColor?: string;
  newParentId?: string | null;
};

export type DetachedSelectionState = {
  id: string;
  anchorNodeId: string;
  originalParentId: string;
  targetParentId?: string | null;
};

// ============================================
// Dialog Types
// ============================================
export interface DialogButton {
  id: string;
  text: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export interface ContentDialogProps {
  characterImage?: string;
  title: string;
  buttons: DialogButton[];
  content: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// ============================================
// VoiceChat Types
// ============================================
export interface User {
  id: string;
  avatar: string;
  name: string;
  isSpeaking?: boolean;
  colorIndex?: number;
}

export interface VoiceChatProps {
  users?: User[];
  onMicToggle?: (isMuted: boolean) => void;
  onCallEnd?: () => void;
  onOrganize?: () => void;
  onShare?: () => void;
}
