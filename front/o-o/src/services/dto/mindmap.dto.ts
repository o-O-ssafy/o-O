import type {
  MindmapNodeType,
  NodeAnalysisStatus,
  NodeData,
} from "@/features/mindmap/types";

// API Response
export interface MindmapNode {
  id: string;
  nodeId: number;
  workspaceId: number;
  parentId: number | null;
  type: string;
  keyword: string;
  memo: string;
  analysisStatus: NodeAnalysisStatus;
  x: number;
  y: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// API Request
export interface CreateMindmapNodeRequest {
  parentId?: number | null;
  type: string;
  keyword: string;
  memo?: string;
  x: number;
  y: number;
  color?: string;
}

export interface UpdateMindmapNodeRequest {
  keyword?: string | null;
  memo?: string | null;
  x?: number | null;
  y?: number | null;
  color?: string | null;
  parentId?: number | null;
  type?: string | null;
  analysisStatus?: NodeAnalysisStatus | null;
}

export interface CreateImageNodeRequest {
  file: File;
  parentId?: number | null;
  keyword?: string;
  memo?: string;
  x: number;
  y: number;
  color?: string;
}

export interface AnalyzeNodesRequestDTO {
  nodeIds: number[];
}

export interface AnalyzeNodesResponseDTO {
  analysis: string;
}

export interface CreatePlanRequestDTO {
  analysisText: string;
  title: string;
}

export interface CreatePlanResponseDTO {
  plan: string;
}

// Add Idea to Mindmap
export interface AddIdeaRequestDTO {
  idea: string;
}

export interface AddIdeaResponseDTO {
  workspaceId: number;
  createdNodeCount: number;
  createdNodeIds: number[];
  message: string;
}

// Initial Mindmap Creation
export interface InitialMindmapRequestDTO {
  contentUrl: string | null;
  contentType: "TEXT" | "VIDEO" | "IMAGE";
  startPrompt: string | null;
}

export interface InitialMindmapResponseDTO {
  workspaceId: number;
  nodeId: number;
  keyword: string;
  memo: string;
  analysisStatus: NodeAnalysisStatus;
  message: string;
}

// Normalizes REST DTOs into the NodeData shape consumed by Yjs/React state

export type NodeDTO = {
  id?: string;
  nodeId?: number | string;
  workspaceId: number | string;
  parentId?: number | string | null;
  type?: MindmapNodeType;
  keyword: string;
  memo?: string;
  contentUrl?: string;
  analysisStatus?: NodeAnalysisStatus;
  x: number;
  y: number;
  color?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
};

// Converts possible numeric IDs into string IDs Yjs expects
const ensureString = (value?: number | string | null): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
};

// Guarantees every node has a stable string ID for the shared map
const resolveNodeId = (dto: NodeDTO): string => {
  const resolved = dto.id ?? ensureString(dto.nodeId);
  if (resolved) {
    return resolved;
  }
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mindmap-node-${Math.random().toString(36).slice(2)}`;
};

// Maps backend payload into the structure Cytoscape + overlays render (DataSource 역할)
export const mapDtoToNodeData = (dto: NodeDTO): NodeData => ({
  id: resolveNodeId(dto),
  nodeId: typeof dto.nodeId === 'number' ? dto.nodeId : undefined,
  workspaceId: typeof dto.workspaceId === 'number' ? dto.workspaceId :
               (typeof dto.workspaceId === 'string' ? parseInt(dto.workspaceId, 10) : undefined),
  keyword: dto.keyword,
  x: dto.x,
  y: dto.y,
  color: dto.color ?? "#222222",
  parentId: ensureString(dto.parentId) ?? null,
  memo: dto.memo,
  type: dto.type ?? 'text',
  contentUrl: dto.contentUrl,
  analysisStatus: dto.analysisStatus ?? "NONE",
  createdBy: dto.createdBy,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});
