import type { NodeData } from "@/features/mindmap/types";
import {
  mapDtoToNodeData,
  type NodeDTO,
  type InitialMindmapRequestDTO,
  type InitialMindmapResponseDTO,
} from "./dto/mindmap.dto";
import { apiClient } from "@/lib/axios";

const CANVAS_MIN = 0;
const CANVAS_MAX = 5000;

/**
 * 노드 좌표를 0~5000 범위로 정규화하고, 변경 여부를 표시
 */
function clampNodePosition(
  node: NodeData
): NodeData & { _wasClamped?: boolean } {
  if (node.x == null || node.y == null) {
    return node;
  }

  const clampedX = Math.max(CANVAS_MIN, Math.min(CANVAS_MAX, node.x));
  const clampedY = Math.max(CANVAS_MIN, Math.min(CANVAS_MAX, node.y));

  const wasClamped = clampedX !== node.x || clampedY !== node.y;

  return {
    ...node,
    x: clampedX,
    y: clampedY,
    _wasClamped: wasClamped,
  };
}

// Loads the initial node list so we can seed the collaborative Y.Map
export const fetchMindmapNodes = async (
  workspaceId: string
): Promise<NodeData[]> => {
  const { data } = await apiClient.get<NodeDTO[]>(
    `/mindmap/${workspaceId}/nodes`
  );
  return data
    .filter((dto) => !dto.deleted)
    .map(mapDtoToNodeData)
    .map(clampNodePosition);
};

// Creates a new mindmap node
export const createMindmapNode = async (
  workspaceId: string,
  request: {
    parentId?: number | null;
    type: string;
    keyword: string;
    memo?: string;
    x: number;
    y: number;
    color?: string;
  }
): Promise<NodeData> => {
  const { data } = await apiClient.post<NodeDTO>(
    `/mindmap/${workspaceId}/node`,
    request
  );
  return mapDtoToNodeData(data);
};

// Updates an existing mindmap node
export const updateMindmapNode = async (
  workspaceId: string,
  nodeId: number,
  request: {
    keyword?: string | null;
    memo?: string | null;
    x?: number | null;
    y?: number | null;
    color?: string | null;
    parentId?: number | null;
    type?: string | null;
    analysisStatus?: string | null;
  }
): Promise<NodeData> => {
  const { data } = await apiClient.patch<NodeDTO>(
    `/mindmap/${workspaceId}/node/${nodeId}`,
    request
  );
  return mapDtoToNodeData(data);
};

// Deletes a mindmap node
export const deleteMindmapNode = async (
  workspaceId: string,
  nodeId: number
): Promise<void> => {
  await apiClient.delete(`/mindmap/${workspaceId}/node/${nodeId}`);
};

// Batch update node positions (for auto-layout calculated coordinates)
export const batchUpdateNodePositions = async (
  workspaceId: string,
  updates: Array<{ nodeId: number; x: number; y: number }>
): Promise<void> => {
  // 각 노드를 개별적으로 PATCH 요청 (배치 엔드포인트가 없는 경우)
  await Promise.all(
    updates.map((update) =>
      updateMindmapNode(workspaceId, update.nodeId, {
        x: update.x,
        y: update.y,
      })
    )
  );
};

// AI 분석 요청 (CONTEXTUAL - 맥락 기반 확장)
export const requestNodeAnalysis = async (
  workspaceId: string,
  nodeId: number,
  ancestorNodes: Array<{
    nodeId: number;
    parentId: number | null;
    keyword: string;
    memo: string;
  }>
): Promise<void> => {
  await apiClient.post(`/mindmap/${workspaceId}/node/${nodeId}/analyze`, {
    workspaceId: Number(workspaceId),
    nodeId,
    contentUrl: null,
    contentType: "TEXT",
    prompt: null,
    analysisType: "CONTEXTUAL",
    nodes: ancestorNodes,
  });
};

// Creates initial mindmap with content (text/video)
export const createInitialMindmap = async (
  request: InitialMindmapRequestDTO
): Promise<InitialMindmapResponseDTO> => {
  const { data } = await apiClient.post<InitialMindmapResponseDTO>(
    "/mindmap/initial",
    request
  );
  return data;
};

// Creates initial mindmap from image file
export const createInitialMindmapFromImage = async (
  file: File,
  startPrompt: string | null
): Promise<InitialMindmapResponseDTO> => {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (startPrompt) {
    params.append("startPrompt", startPrompt);
  }

  const { data } = await apiClient.post<InitialMindmapResponseDTO>(
    `/mindmap/initial/image?${params.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
