import type { NodeData } from "@/features/mindmap/types";
import {
  mapDtoToNodeData,
  type NodeDTO,
  type InitialMindmapRequestDTO,
  type InitialMindmapResponseDTO,
  type CreateImageNodeRequest,
  type AnalyzeNodesRequestDTO,
  type AnalyzeNodesResponseDTO,
  type CreatePlanResponseDTO,
  type AddIdeaRequestDTO,
  type AddIdeaResponseDTO,
  type RestructureMindmapResponseDTO,
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

// Creates a new mindmap node from image file
export const createMindmapNodeFromImage = async (
  workspaceId: string,
  request: Omit<CreateImageNodeRequest, "file"> & { file: File }
): Promise<NodeData> => {
  const formData = new FormData();
  formData.append("file", request.file);

  // Build the request JSON object
  const requestBody: Record<string, unknown> = {
    x: request.x,
    y: request.y,
  };

  if (request.parentId !== undefined && request.parentId !== null) {
    requestBody.parentId = request.parentId;
  }
  if (request.keyword) {
    requestBody.keyword = request.keyword;
  }
  if (request.memo) {
    requestBody.memo = request.memo;
  }
  if (request.color) {
    requestBody.color = request.color;
  }

  formData.append(
    "request",
    new Blob([JSON.stringify(requestBody)], { type: "application/json" })
  );

  const { data } = await apiClient.post<NodeDTO>(
    `/mindmap/${workspaceId}/node/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return mapDtoToNodeData(data);
};

// AI 분석 요청 (CONTEXTUAL - 맥락 기반 AI + 트렌드 확장 추천)
// WebSocket으로 aiList와 trendList를 함께 응답받음
export const requestNodeAnalysis = async (
  workspaceId: string,
  nodeId: number
): Promise<void> => {
  await apiClient.post(`/mindmap/${workspaceId}/node/${nodeId}/analyze`, {});
};

// 선택된 노드들을 한 번에 분석 (Analyze 모드 전용)
export const analyzeSelectedNodes = async (
  workspaceId: string,
  nodeIds: number[]
): Promise<AnalyzeNodesResponseDTO> => {
  const { data } = await apiClient.post<AnalyzeNodesResponseDTO>(
    `/mindmap/${workspaceId}/ai/analyze-nodes`,
    {
      nodeIds,
    } as AnalyzeNodesRequestDTO,
    {
      timeout: 50000, // 50초 timeout (AI 분석은 시간이 오래 걸릴 수 있음)
    }
  );
  return data;
};

// 기획안 생성
export const createPlan = async (
  workspaceId: string,
  analysisText: string
): Promise<CreatePlanResponseDTO> => {
  const { data } = await apiClient.post<CreatePlanResponseDTO>(
    `/mindmap/${workspaceId}/ai/create-plan`,
    {
      analysisText,
    },
    { timeout: 60000 }
  );
  return data;
};

// 아이디어 추가 (GPT 키워드 자동 추출)
export const addIdeaToMindmap = async (
  workspaceId: string,
  idea: string
): Promise<AddIdeaResponseDTO> => {
  const { data } = await apiClient.post<AddIdeaResponseDTO>(
    `/mindmap/${workspaceId}/add-idea`,
    {
      idea,
    } as AddIdeaRequestDTO,
    {
      timeout: 60000, // GPT 키워드 추출 + 노드 생성은 시간이 오래 걸릴 수 있음 (60초)
    }
  );
  return data;
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

// 마인드맵 전체 구조 정리하기 (GPT 기반 재구성)
export const restructureMindmap = async (
  workspaceId: string
): Promise<RestructureMindmapResponseDTO> => {
  const { data } = await apiClient.post<RestructureMindmapResponseDTO>(
    `/mindmap/${workspaceId}/ai/restructure`,
    {},
    {
      timeout: 60000, // 60초 timeout (GPT 재구성 작업 소요 시간 고려)
    }
  );
  return data;
};
