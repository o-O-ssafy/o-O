/* 인증 담당 */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  redirectPath: string | null;
}

/**
 * JWT 토큰의 유효성을 검증합니다.
 * @param token - 검증할 JWT 토큰
 * @returns 토큰이 유효하면 true, 만료되었거나 잘못된 토큰이면 false
 */
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    // 1분 버퍼를 두고 만료 체크 (곧 만료될 토큰도 미리 제거)
    return decoded.exp > currentTime + 60;
  } catch {
    // 토큰 디코딩 실패 시 유효하지 않은 토큰으로 처리
    return false;
  }
};

const getInitialState = (): AuthState => {
  const token = localStorage.getItem("accessToken");

  // 토큰이 존재하고 유효한 경우에만 로그인 상태 유지
  if (token && isTokenValid(token)) {
    return {
      accessToken: token,
      isLoggedIn: true,
      redirectPath: null,
    };
  }

  // 만료되었거나 잘못된 토큰은 localStorage에서 제거
  if (token) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }

  return {
    accessToken: null,
    isLoggedIn: false,
    redirectPath: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem("accessToken", action.payload);
    },

    clearAuth: (state) => {
      state.accessToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem("accessToken");
    },

    // 로그인 필요 액션 발생 시 - 현재 경로와 상태 저장
    // 로그인 버튼 클릭 시 현재 경로 저장
    setRedirectPath: (state, action: PayloadAction<string>) => {
      state.redirectPath = action.payload;
    },
    // 로그인 후 리다이렉트 경로 초기화
    clearRedirectPath: (state) => {
      state.redirectPath = null;
    },
  },
});

export const { setAccessToken, clearAuth, setRedirectPath, clearRedirectPath } =
  authSlice.actions;
export default authSlice.reducer;
