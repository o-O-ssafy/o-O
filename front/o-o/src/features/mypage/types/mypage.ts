export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export type WorkspaceCategory = "recent" | "team" | "personal";

// 워크스페이스 전체 조회 응답
export interface Workspace {
  id: number;
  title: string;
  visibility: WorkspaceVisibility;
  createdAt: string;
  thumbnail: string | null;
  startPrompt: string | null;
  profiles: string[];
}

export interface WorkspaceListResponse {
  workspaces: Workspace[];
  nextCursor: number;
  hasNext: boolean;
}

// 월별 활성 날짜 조회 응답
export interface ActiveDaysResponse {
  dates: string[];
}

// 특정 날짜의 키워드 조회 응답
export interface KeywordResponse {
  keywords: string[];
}

/* 요청 파라미터 타입 */
// 워크스페이스 전체 조회 요청
export interface WorkspaceQueryParams {
  category?: WorkspaceCategory;
  cursor?: number;
}

export const DEFAULT_WORKSPACE_PARAMS: WorkspaceQueryParams = {
  category: "recent",
};

// 키워드 존재 날짜 조회 요청
export interface ActiveDaysQueryParams {
  month?: string;
}

const today = new Date();
const todayISO = today.toISOString().slice(0, 10); // "2025-11-14"

export const DEFAULT_MONTH_PARAMS: ActiveDaysQueryParams = {
  month: todayISO.slice(0, 7), // "2025-11"
};

// 특정일 키워드 조회 요청
export interface KeywordQueryParams {
  date?: string;
}

export const DEFAULT_DATE_PARAMS: KeywordQueryParams = {
  date: todayISO, // "2025-11-14"
};
