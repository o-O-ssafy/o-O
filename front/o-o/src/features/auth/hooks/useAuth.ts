// src/features/auth/api/useLogout.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import { clearUser } from "@/store/slices/userSlice";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      // Redux 초기화
      dispatch(clearAuth());
      dispatch(clearUser());

      // TanStack Query 캐시 전체 초기화
      queryClient.clear();

      console.log("✅ 로그아웃 성공");

      // 로그인 페이지로 이동
      navigate("/login");
    },

    onError: (error) => {
      console.error("❌ 로그아웃 실패:", error);
    },
  });
};
