import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearRedirectPath, setAccessToken } from "@/store/slices/authSlice";
import { fetchUserProfile, setUserId } from "@/store/slices/userSlice";
import type { RootState } from "@/store/store";

export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const hasProcessed = useRef(false);

  // Redux에서 리다이렉트 정보 가져오기
  const redirectPathFromRedux = useAppSelector(
    (state: RootState) => state.auth.redirectPath
  );
  useEffect(() => {
    if (hasProcessed.current) {
      console.log("⏭️ 이미 처리됨 - 스킵");
      return;
    }

    const handleCallback = async () => {
      try {
        // 1. URL에서 token과 userId 추출
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");

        console.log("📥 Callback 받음:", { token, userId });

        if (!token) {
          throw new Error("토큰이 없습니다.");
        }

        if (!userId) {
          throw new Error("사용자 ID가 없습니다.");
        }

        hasProcessed.current = true;

        // 2. accessToken을 authSlice에 저장
        dispatch(setAccessToken(token));
        console.log("✅ accessToken Redux에 저장");

        // 3. 사용자 정보 조회 (userSlice에 자동 저장됨)
        console.log("📡 사용자 정보 조회 중...");
        const resultAction = await dispatch(fetchUserProfile());

        if (fetchUserProfile.fulfilled.match(resultAction)) {
          console.log("✅ 사용자 정보 조회 성공:", resultAction.payload);

          // 4. userId를 Redux에 저장
          dispatch(setUserId(Number(userId)));
          console.log("✅ userId Redux에 저장:", userId);

          console.log("✅ 로그인 완료!");
          console.log("🍪 refreshToken은 쿠키에 자동 저장됨");

          // 5. redirectPath가 있으면 그곳으로, 없으면 홈으로
          let destination = redirectPathFromRedux;

          if (!destination) {
            // Redux에 없으면 localStorage에서 읽기
            const savedPath = localStorage.getItem("redirectPath");
            destination = savedPath || "/";
            console.log("📦 localStorage에서 읽음:", savedPath);
          }

          console.log("🚀 리다이렉트 대상:", destination);

          // redirectPath 초기화
          dispatch(clearRedirectPath());
          localStorage.removeItem("redirectPath");

          // 페이지 이동
          navigate(destination, { replace: true });
        } else {
          throw new Error("사용자 정보 조회 실패");
        }
      } catch (error: any) {
        console.error("❌ 로그인 실패:", error);

        if (error.response) {
          console.error("📡 서버 응답 상태:", error.response.status);
          console.error("📨 서버 응답 데이터:", error.response.data);
        } else if (error.request) {
          console.error("📭 요청은 갔지만 응답 없음:", error.request);
        } else {
          console.error("⚙️ 요청 설정 중 오류:", error.message);
        }

        // 에러 시 홈으로
        navigate("/", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch, redirectPathFromRedux]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            로그인 처리 중...
          </p>
          <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return null;
}
