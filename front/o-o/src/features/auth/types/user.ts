export interface User {
  id: number; // 사용자 ID (OAuth 콜백에서 받음)
  nickname: string;
  email: string;
  profileImage?: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
}
