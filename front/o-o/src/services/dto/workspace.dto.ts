export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export type WorkspaceRole = "MAINTAINER" | "EDIT" | "VIEW";

export type WorkspaceTheme = "SUMMER_BEACH" | "CITRUS" | "RETRO" | "COOL" | "LAVENDER" | "PASTEL";

export type WorkspaceType = "TEAM" | "PERSONAL";

// 백엔드 WorkspaceTheme을 프론트엔드 ColorThemeName으로 매핑
export function mapWorkspaceThemeToColorTheme(theme: WorkspaceTheme): string {
  const map: Record<WorkspaceTheme, string> = {
    SUMMER_BEACH: "Summer Beach",
    CITRUS: "Citrus",
    RETRO: "Retro",
    COOL: "Cool",
    LAVENDER: "Lavendar",
    PASTEL: "Pastel",
  };
  return map[theme];
}

// 프론트엔드 ColorThemeName을 백엔드 WorkspaceTheme으로 역매핑
export function mapColorThemeToWorkspaceTheme(colorTheme: string): WorkspaceTheme {
  const reverseMap: Record<string, WorkspaceTheme> = {
    "Summer Beach": "SUMMER_BEACH",
    "Citrus": "CITRUS",
    "Retro": "RETRO",
    "Cool": "COOL",
    "Lavendar": "LAVENDER",  // ColorTheme 오타에 맞춤
    "Pastel": "PASTEL",
  };
  return reverseMap[colorTheme] || "PASTEL";
}

// --------------------------------------
// REQUEST
// --------------------------------------

// POST /workspace 요청 바디 (선택 필드들)
export interface CreateWorkspaceRequestDTO {
  readonly title?: string;
  readonly theme?: WorkspaceTheme;
  readonly type?: WorkspaceType;
  readonly visibility?: WorkspaceVisibility;
}

// PATCH /workspace/{workspaceId}/member/{targetUserId} 요청 바디
export interface UpdateMemberRoleRequestDTO {
  readonly role: WorkspaceRole;
}

// PATCH /workspace/{workspaceId}/visibility 요청 바디
export interface UpdateWorkspaceVisibilityRequestDTO {
  readonly visibility: WorkspaceVisibility;
}

// PATCH /workspace/{workspaceId}/theme 요청 바디
export interface UpdateWorkspaceThemeRequestDTO {
  readonly theme: WorkspaceTheme;
}


// --------------------------------------
// RESPONSE
// --------------------------------------

// GET /workspace/{id} 응답
export interface WorkspaceDetailDTO {
  readonly id: number;
  readonly type: WorkspaceType;
  readonly visibility: WorkspaceVisibility;
  readonly theme: WorkspaceTheme;
  readonly title: string;
  readonly thumbnail?: string;
  readonly createdAt: string;       // ISO
  readonly isMember: boolean;
  readonly myRole: WorkspaceRole;
  readonly token: string;           // 워크스페이스 초대/공유 토큰
  readonly memberCount: number;
}


// POST /workspace 응답
export interface CreateWorkspaceResponseDTO {
  readonly id: number;
  readonly theme: WorkspaceTheme;
  readonly type: WorkspaceType;
  readonly visibility: WorkspaceVisibility;
  readonly title: string;
  readonly token: string;             // 초대/보안 토큰
}

// POST /workspace/join?token=...
export interface JoinWorkspaceResponseDTO {
  readonly workspaceId: number; // 워크스페이스 id (리다이렉트용)
}


