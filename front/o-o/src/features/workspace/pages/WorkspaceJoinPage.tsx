import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useJoinWorkspaceMutation } from "../hooks/mutation/useJoinWorkspaceMutation";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import type { AxiosError } from "axios";

export function WorkspaceJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { mutate: joinWorkspace, isPending, isError, error } = useJoinWorkspaceMutation();

  useEffect(() => {
    // 토큰이 없으면 홈으로 리다이렉트
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // 토큰이 있으면 워크스페이스 참여 시도
    joinWorkspace(token, {
      onSuccess: (data) => {
        // 성공 시 마인드맵 페이지로 이동
        navigate(`/mindmap/${data.workspaceId}`, { replace: true });
      },
      onError: (err) => {
        const axiosError = err as AxiosError<{ id?: number; message?: string }>;

        // 409 Conflict: 이미 멤버인 경우
        if (axiosError.response?.status === 409) {
          // 응답 바디에 워크스페이스 ID가 있으면 사용
          const workspaceId = axiosError.response.data?.id;
          if (workspaceId) {
            navigate(`/mindmap/${workspaceId}`, { replace: true });
          } else {
            // ID가 없으면 홈으로 (일반적으로는 응답에 포함되어야 함)
            navigate("/", { replace: true });
          }
        }
        // 다른 에러는 UI에서 처리
      },
    });
  }, [token, joinWorkspace, navigate]);

  // 로딩 중
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen font-paperlogy">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-700">워크스페이스에 참여하는 중...</p>
      </div>
    );
  }

  // 에러 발생
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen font-paperlogy">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">워크스페이스 참여 실패</h2>
        <p className="text-gray-600 mb-6 text-center px-4">
          {error instanceof Error && error.message.includes("401")
            ? "로그인이 필요합니다."
            : error instanceof Error && error.message.includes("404")
            ? "유효하지 않은 초대 링크입니다."
            : "워크스페이스에 참여할 수 없습니다."}
        </p>
        <Button
          onClick={() => navigate("/", { replace: true })}
          className="font-paperlogy"
        >
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return null;
}
