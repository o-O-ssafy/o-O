import { Avatar } from "@/components/ui/avatar";
import Mindmap from "@/shared/assets/images/basic_bg.webp";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CloseIcon from "@mui/icons-material/Close";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import type { Project } from "@/features/mypage/types/project";
import { mypageApi } from "@/features/mypage/api/mypageApi";
import { useState } from "react";

interface ProjectCardProps {
  readonly project: Project;
  readonly onClick?: () => void;
  readonly onDelete?: (projectId: number) => void;
}

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const displayCollaborators = project.collaborators.slice(0, 3);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "삭제 실패",
    description: "프로젝트 삭제에 실패했습니다.",
  });

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/mindmap/${project.id}`, {
        state: { project },
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);
    try {
      await mypageApi.deleteWorkspace(Number(project.id));
      if (onDelete) {
        onDelete(Number(project.id));
      }
    } catch (error: any) {
      console.error("프로젝트 삭제 실패:", error);

      // 권한 오류 체크 (403 Forbidden)
      if (error?.response?.status === 403) {
        setErrorMessage({
          title: "권한 없음",
          description: "워크스페이스 MAINTAINER만 삭제할 수 있습니다.",
        });
      } else {
        setErrorMessage({
          title: "삭제 실패",
          description: "프로젝트 삭제에 실패했습니다.",
        });
      }

      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 삭제 버튼 - hover 시에만 표시 */}
      <button
        onClick={handleDeleteClick}
        className={`absolute -left-2 -top-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full px-1.5 py-1 shadow-lg transition-all duration-300 ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
        aria-label="프로젝트 삭제"
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </button>

      <button
        onClick={handleCardClick}
        className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer relative w-full"
      >
        {/* 오른쪽 상단 아이콘들 */}
        <div className="absolute top-2 right-1 flex gap-2 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-md flex gap-1">
            {/* 좌물쇠 */}
            {project.isPrivate ? (
              <LockOutlineIcon sx={{ fontSize: 20, color: "#263A6B" }} />
            ) : (
              <LockOpenIcon sx={{ fontSize: 20, color: "#263A6B" }} />
            )}
            {/* users */}
            <div className="flex -space-x-2">
              {displayCollaborators.map((user, index) => (
                <Avatar
                  key={`${user.name}-${index}`}
                  className="h-5 w-5 rounded-full bg-[#F6F6F6] border-2 border-[#E5E5E5]"
                >
                  <AvatarImage
                    src={getProfileImageUrl(user.image)}
                    alt={user.name}
                  />
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* 마인드맵 사진 */}
        <div className="relative h-[210px] bg-gray-50 rounded-t-2xl overflow-hidden">
          <img
            src={project.thumbnail || Mindmap}
            alt="mindmap"
            className="w-full h-full object-cover"
          ></img>
        </div>

        {/* 마인드맵 하단 제목/날짜 */}
        <div className="flex justify-between items-center px-4 py-2 border-t-2 border-gray-100">
          <span className="text-sm font-medium text-gray-800">
            {project.title}
          </span>
          <span className="text-xs text-gray-400">{project.date}</span>
        </div>
      </button>

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <>
          {/* 백드롭 */}
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-[99998] cursor-default"
            onClick={handleDeleteCancel}
            aria-label="모달 닫기"
          />

          {/* 모달 */}
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto">
              {/* 헤더 */}
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">
                  프로젝트 삭제
                </h2>
              </div>

              {/* 내용 */}
              <div className="px-6 py-4">
                <p className="text-gray-700">
                  정말로 <span className="font-semibold">"{project.title}"</span> 프로젝트를 삭제하시겠습니까?
                </p>
                <p className="text-sm text-red-500 mt-2">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>

              {/* 버튼 */}
              <div className="px-6 py-4 border-t flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 에러 모달 */}
      {isErrorModalOpen && (
        <>
          {/* 백드롭 */}
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-[99998] cursor-default"
            onClick={handleErrorModalClose}
            aria-label="모달 닫기"
          />

          {/* 모달 */}
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto">
              {/* 헤더 */}
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-red-600">
                  {errorMessage.title}
                </h2>
              </div>

              {/* 내용 */}
              <div className="px-6 py-4">
                <p className="text-gray-700">
                  {errorMessage.description}
                </p>
              </div>

              {/* 버튼 */}
              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  onClick={handleErrorModalClose}
                  className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
