import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { addToPath } from "@/store/slices/trendPathSlice";
import { useAppSelector } from "@/store/hooks";
import { useTrend } from "../hooks/useTrend";
import { useMypage } from "@/features/mypage/hooks/useMypage";
import { useCreateWorkspaceMutation } from "@/features/workspace/hooks/mutation/useCreateWorkspaceMutation";
import { TrendMindmapHeader } from "../components/TrendMindmap/TrendMindmapHeader";
import { D3Mindmap } from "../components/TrendMindmap/D3/D3Mindmap";
import { TrendExpandKeyword } from "../components/TrendMindmap/TrendExpandKeyword";
import { DrawerButton } from "../components/TrendMindmap/Drawer/DrawerButton";
import { MindmapSelectionModal } from "../components/TrendMindmap/Modal/MindmapSelectionModal";
import type { TrendKeywordItem } from "../types/trend";
import type { Project } from "../types/types";

export function TrendMindmapPage() {
  const { trendId } = useParams<{ trendId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { childKeywords, keywordsLoading, keywordsError, fetchChildTrendList } =
    useTrend();
  const { workspaces, fetchWorkspacesList } = useMypage();
  const { mutateAsync: createWorkspace } = useCreateWorkspaceMutation();
  const [showExpandKeywords, setShowExpandKeywords] = useState(false);
  const [expandedKeywords, setExpandedKeywords] = useState<TrendKeywordItem[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux에서 경로 가져오기
  const visitPath = useSelector(
    (state: RootState) => state.trendPath.visitPath
  );

  // 로그인 상태 확인
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  // Workspace를 Project 타입으로 변환
  const projects: Project[] = useMemo(() => {
    return workspaces.map((workspace) => ({
      id: workspace.id.toString(),
      title: workspace.title,
      date: new Date(workspace.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      isPrivate: workspace.visibility === "PRIVATE",
      collaborators: workspace.profiles.map((profileUrl: string, index: number) => ({
        id: `user-${workspace.id}-${index}`,
        name: `사용자 ${index + 1}`,
        image: profileUrl,
      })),
      thumbnail: workspace.thumbnail || undefined,
    }));
  }, [workspaces]);

  // 워크스페이스 데이터 가져오기 (회원인 경우에만)
  useEffect(() => {
    if (isLoggedIn && workspaces.length === 0) {
      fetchWorkspacesList({ category: "recent" });
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (trendId) {
      const decodedKeyword = decodeURIComponent(trendId);
      fetchChildTrendList(decodedKeyword);

      // Redux에 경로 추가
      dispatch(addToPath(decodedKeyword));

      // 더보기 창 자동 닫기
      setShowExpandKeywords(false);
    }
  }, [trendId, fetchChildTrendList, dispatch]);

  const parentKeyword = trendId ? decodeURIComponent(trendId) : "";

  const handleMoreClick = (remainingKeywords: TrendKeywordItem[]) => {
    setExpandedKeywords(remainingKeywords);
    setShowExpandKeywords((prev) => !prev);
  };

  // 자식 노드 클릭 핸들러
  const handleNodeClick = (keyword: string) => {
    navigate(`/trend/${encodeURIComponent(keyword)}`);
  };

  // 모달 핸들러
  const handleOpenModal = () => {
    console.log("페이지에서 모달 열기!");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateNewMindmap = async () => {
    console.log("새 마인드맵 생성");
    console.log("생성할 마인드맵 경로:", visitPath.join(" > "));

    // 로컬스토리지에 임시 저장
    if (visitPath.length > 0) {
      localStorage.setItem("pendingImportKeywords", JSON.stringify(visitPath));
    }

    setIsModalOpen(false);

    try {
      // 새 워크스페이스 생성
      const newWorkspace = await createWorkspace({
        title: visitPath.length > 0 ? visitPath[0] : "새 마인드맵",
        type: "PERSONAL",
        visibility: "PRIVATE",
      });

      console.log("새 워크스페이스 생성 완료:", newWorkspace);

      // 생성된 워크스페이스로 이동
      navigate(`/mindmap/${newWorkspace.id}`);
    } catch (error) {
      console.error("워크스페이스 생성 실패:", error);
      // 실패 시 로컬스토리지에서 제거
      localStorage.removeItem("pendingImportKeywords");
      alert("워크스페이스 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSelectMindmap = (mindmapId: string) => {
    console.log("마인드맵 선택:", mindmapId);
    console.log("선택한 경로:", visitPath.join(" > "));

    // 로컬스토리지에 임시 저장
    if (visitPath.length > 0) {
      localStorage.setItem("pendingImportKeywords", JSON.stringify(visitPath));
    }

    // 선택한 워크스페이스로 이동
    navigate(`/mindmap/${mindmapId}`);
    setIsModalOpen(false);
  };

  // 마인드맵 콘텐츠 렌더링
  const renderMindmapContent = () => {
    if (keywordsLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">마인드맵을 구성하는 중...</p>
          </div>
        </div>
      );
    }

    if (keywordsError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2 text-lg">⚠️ 오류가 발생했습니다</p>
            <p className="text-gray-600">{keywordsError}</p>
          </div>
        </div>
      );
    }

    return (
      <D3Mindmap
        parentKeyword={parentKeyword}
        childKeywords={childKeywords}
        onMoreClick={handleMoreClick}
        onNodeClick={handleNodeClick}
      />
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* 플로팅 헤더 */}
      <div className="fixed top-10 left-10 right-10 z-50">
        <TrendMindmapHeader />
      </div>

      {/* 경로 표시 (디버깅용, 필요시 제거) */}
      {/* <div className="fixed top-24 left-10 z-40 bg-white p-2 rounded shadow text-sm max-w-md">
        <p className="text-gray-600 break-all">
          경로: {visitPath.join(" > ") || "없음"}
        </p>
      </div> */}

      {/* 마인드맵 - 전체 화면 */}
      <div className="absolute inset-0 w-full h-full">
        {renderMindmapContent()}
      </div>

      {/* 확장 키워드 사이드바 */}
      {showExpandKeywords && (
        <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50">
          <TrendExpandKeyword keywords={expandedKeywords} />
        </div>
      )}

      {/* 드로어 버튼 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <DrawerButton onOpenModal={handleOpenModal} />
      </div>

      {/* 마인드맵 선택 모달 */}
      <MindmapSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateNew={handleCreateNewMindmap}
        onSelectMindmap={handleSelectMindmap}
        projects={projects}
      />
    </div>
  );
}
