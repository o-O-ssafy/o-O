import LockOutlineIcon from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Mindmap from "@/shared/assets/images/mindmap.webp";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  image?: string;
}

interface ProjectCardProps {
  readonly project: {
    id: string;
    title: string;
    date: string;
    isPrivate: boolean;
    collaborators: User[];
  };
}
export function ProjectDetailCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className="mx-12 mt-5 bg-white shadow-md rounded-3xl h-[calc(100vh-180px)] relative">
      {/* 왼쪽 상단 아이콘들 */}
      <div className="absolute top-2 left-4 flex gap-2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-md flex gap-2">
          {/* 좌물쇠 */}
          {project.isPrivate ? (
            <LockOutlineIcon sx={{ fontSize: 30, color: "#263A6B" }} />
          ) : (
            <LockOpenIcon sx={{ fontSize: 30, color: "#263A6B" }} />
          )}
          {/* users */}
          <div className="flex -space-x-2">
            {project.collaborators.map((user) => (
              <Avatar
                key={user.id}
                className="h-7 w-7 rounded-full bg-[#F6F6F6] border-2 border-[#E5E5E5]"
              >
                <AvatarImage src={user.image} alt={user.name} />
              </Avatar>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 상단 닫기 */}
      <div className="absolute top-3 right-4 z-10">
        <button
          onClick={handleClose}
          className="group bg-[#F6F6F6] backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-primary hover:shadow-lg transition-all duration-200"
        >
          <CloseOutlinedIcon
            className="group-hover:text-white transition-colors duration-200"
            sx={{ fontSize: 28, color: "#263A6B" }}
          />
        </button>
      </div>

      {/* 마인드맵 사진 */}
      <div className="relative h-full w-full">
        <img
          src={Mindmap}
          alt="mindmap"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 마인드맵 하단 제목/날짜 */}
      <div
        className="flex justify-between items-center px-6 py-3 border-t-2 border-gray-100 
        bg-white absolute bottom-0 left-0 right-0 rounded-b-3xl"
      >
        <span className=" text-lg font-semibold text-gray-800">
          {project.title}
        </span>
        <span className="text-md text-gray-400">{project.date}</span>
      </div>
    </div>
  );
}
