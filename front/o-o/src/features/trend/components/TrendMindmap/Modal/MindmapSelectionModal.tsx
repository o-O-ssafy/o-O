import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { ClickableProjectCard } from "./ClickableProjectCard";
import type { Project } from "@/features/trend/types/types";

interface MindmapSelectionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreateNew: () => void;
  readonly onSelectMindmap: (mindmapId: string) => void;
  readonly projects: Project[];
}

export function MindmapSelectionModal({
  isOpen,
  onClose,
  onCreateNew,
  onSelectMindmap,
  projects,
}: MindmapSelectionModalProps) {
  if (!isOpen) return null;

  console.log("MindmapSelectionModal이 렌더링됩니다!");

  return (
    <>
      {/* 백드롭 */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 z-[99998] cursor-default"
        onClick={onClose}
        aria-label="모달 닫기"
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">
              개인 마인드맵으로 가져갈 마인드맵 선택하기
            </h2>
            <button onClick={onClose} aria-label="닫기">
              <CloseOutlinedIcon
                className="group hover:text-white transition-colors duration-200 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-primary hover:shadow-lg"
                sx={{ fontSize: 36, color: "#263A6B" }}
              />
            </button>
          </div>

          {/* 컨텐츠 - 기존 ProjectCard 재사용 */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 새 문서 생성 카드 */}
              <button
                onClick={onCreateNew}
                className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <span className="text-3xl text-gray-400 group-hover:text-primary transition-colors">
                    +
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                  새 문서부터 기록하기
                </span>
              </button>

              {/* 기존 프로젝트 카드들 - ProjectCard 재사용 */}
              {projects.map((project) => (
                <ClickableProjectCard
                  key={project.id}
                  project={project}
                  onClick={onSelectMindmap}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
