import { DashboardTabNav } from "./DashboardTabNav";
import { ProjectList } from "../components/ProjectCard/ProjectList";
import type { Workspace } from "../types/mypage";
import type { Project } from "../types/project";

interface DashboardProps {
  readonly workspaces: Workspace[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isFullscreen?: boolean;
  readonly hasNext?: boolean;
  readonly onLoadMore?: () => void;
  readonly onDelete?: (projectId: number) => void;
}

export function Dashboard({
  workspaces,
  isLoading,
  error,
  isFullscreen = false,
  hasNext = false,
  onLoadMore,
  onDelete,
}: DashboardProps) {

  // 공통 스타일
  const containerStyle = isFullscreen
    ? "w-[95vw] h-[82vh] px-5 pt-4 bg-white/60 rounded-3xl"
    : "w-[93vw] h-[88vh] sm:h-[83vh] lg:h-[78vh] px-5 pt-4 bg-white/60 rounded-3xl";

  if (isLoading && workspaces.length === 0) {
    return (
      <div className={`${containerStyle} flex flex-col`}>
        {/* 고정 헤더 */}
        <div className="flex-shrink-0">
          <DashboardTabNav />
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className={`${containerStyle} flex flex-col`}>
        {/* 고정 헤더 */}
        <div className="flex-shrink-0">
          <DashboardTabNav />
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-2">⚠️ 오류가 발생했습니다</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 없을 때
  if (workspaces.length === 0) {
    return (
      <div className={`${containerStyle} flex flex-col`}>
        {/* 고정 헤더 */}
        <div className="flex-shrink-0">
          <DashboardTabNav />
        </div>

        <div className="flex justify-center items-center py-20">
          <p>워크스페이스가 없습니다</p>
        </div>
      </div>
    );
  }

  // Workspace 데이터를 기존 프로젝트 형식으로 변환
  const projects: Project[] = workspaces.map((workspace) => ({
    id: workspace.id.toString(),
    title: workspace.title,
    date: new Date(workspace.createdAt).toLocaleDateString("ko-KR"),
    isPrivate: workspace.visibility === "PRIVATE",
    thumbnail: workspace.thumbnail || undefined,
    collaborators: workspace.profiles.map((profile) => ({
      name: profile,
      image: profile,
    })),
  }));

  return (
    <div className={`${containerStyle} flex flex-col`}>
      {/* 고정 헤더 */}
      <div className="flex-shrink-0">
        <DashboardTabNav />
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <ProjectList
          projects={projects}
          onLoadMore={onLoadMore}
          hasNext={hasNext}
          isLoading={isLoading}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
