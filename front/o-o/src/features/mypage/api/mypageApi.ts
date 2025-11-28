import { apiClient } from "@/lib/axios"; // axios 인스턴스 (토큰 자동 넣어줌)
import {
  DEFAULT_MONTH_PARAMS,
  DEFAULT_DATE_PARAMS,
  DEFAULT_WORKSPACE_PARAMS,
  type ActiveDaysResponse,
  type KeywordResponse,
  type WorkspaceListResponse,
  type WorkspaceQueryParams,
  type ActiveDaysQueryParams,
  type KeywordQueryParams,
} from "../types/mypage";

export const mypageApi = {
  // GET /workspace/my - 내 워크스페이스 목록 조회
  getMyWorkspace: async (
    params: WorkspaceQueryParams = DEFAULT_WORKSPACE_PARAMS
  ): Promise<WorkspaceListResponse> => {
    const { data } = await apiClient.get<WorkspaceListResponse>(
      "/workspace/my",
      { params }
    );

    return data;
  },

  // GET /workspace/my/activity/monthly
  getMyActivityMonthlyWorkspace: async (
    params: ActiveDaysQueryParams = DEFAULT_MONTH_PARAMS
  ): Promise<ActiveDaysResponse> => {
    const { data } = await apiClient.get<ActiveDaysResponse>(
      "/workspace/my/activity/monthly",
      { params }
    );

    return data;
  },

  // GET /workspace/my/activity/daily - 키워드 조회
  getMyActivityDailyWorkspace: async (
    params: KeywordQueryParams = DEFAULT_DATE_PARAMS
  ): Promise<KeywordResponse> => {
    const { data } = await apiClient.get<KeywordResponse>(
      "/workspace/my/activity/daily",
      { params }
    );

    return data;
  },

  // DELETE /workspace/{workspaceId} - 워크스페이스 삭제
  deleteWorkspace: async (workspaceId: number): Promise<void> => {
    await apiClient.delete(`/workspace/${workspaceId}`);
  },
};
