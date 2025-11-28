// 라우트 경로 상수 정의
export const PATHS = {
  HOME: "/",
  TREND: "/trend",
  TREND_MINDMAP: "/trend/:trendId",
  MINDMAP: "/mindmap/:workspaceId",
  WORKSPACE_JOIN: "/workspace/join",
  MYPAGE: "/mypage",
  PROJECT_DETAIL: "/project/:id",
  CALLBACK: "/callback",
} as const;

// 경로 타입 정의
export type PathType = (typeof PATHS)[keyof typeof PATHS];

// 동적 경로 생성 헬퍼 함수
export const getProjectDetailPath = (id: string) => `/project/${id}`;

export const getMindmapPath = (workspaceId: string | number) =>
  `/mindmap/${workspaceId}`;
