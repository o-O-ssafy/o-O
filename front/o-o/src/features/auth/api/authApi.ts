// src/features/auth/api/auth.api.ts
import { apiClient } from "@/lib/axios";
import type { User } from "@/features/auth/types/user";

/**
 * 사용자 정보 조회
 * Authorization 헤더는 axios 인터셉터가 자동으로 추가
 */
export const fetchUserInfo = async (): Promise<User> => {
  const response = await apiClient.get<User>("/users");
  return response.data;
};

/**
 * 사용자 정보 수정
 */
export const updateUserInfo = async (userData: {
  nickname: string;
  profileImage: string;
}): Promise<User> => {
  const response = await apiClient.patch<User>("/users", userData);
  return response.data;
};

/**
 * 로그아웃
 */

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
