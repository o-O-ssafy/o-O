import { useEffect, useRef } from "react";
import type { Project } from "../../types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  readonly projects: Project[];
  readonly onLoadMore?: () => void;
  readonly hasNext?: boolean;
  readonly isLoading?: boolean;
  readonly onDelete?: (projectId: number) => void;
}

export function ProjectList({
  projects,
  onLoadMore,
  hasNext = false,
  isLoading = false,
  onDelete,
}: ProjectListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasNext || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 타겟이 화면에 보이면 loadMore 실행
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1, // 10%만 보여도 트리거
        rootMargin: "100px", // 100px 전에 미리 로드
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [onLoadMore, hasNext, isLoading]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        프로젝트가 없습니다.
      </div>
    );
  }

  return (
    <div className="h-[95%] overflow-y-auto scrollbar-hide p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onDelete={onDelete} />
        ))}
      </div>

      {/* 감지 타겟 - 리스트 마지막에 배치 */}
      {hasNext && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          {isLoading && (
            <div className="flex flex-col items-center gap-2">
              {/* <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">더 불러오는 중...</p> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
