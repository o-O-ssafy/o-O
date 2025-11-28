import type { CreateWorkspaceRequestDTO } from "@/services/dto/workspace.dto";

// undefined를 걸러서 API 요청 바디를 정리하는 함수
// 사용자가 테마/공개범위 등을 “명시적으로 바꿨을 때만” 보내도록 처리
export function buildWorkspacePayload(
  payload?: CreateWorkspaceRequestDTO
): CreateWorkspaceRequestDTO {
  if (!payload) return {};

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as CreateWorkspaceRequestDTO;
}
