import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.webp";
import { useLocation } from "react-router-dom";
import { ProjectDetailCard } from "../components/ProjectCard/ProjectDetailCard";

export function ProjectDetailPage() {
  const location = useLocation();

  const project = location.state?.project;

  if (!project) {
    return (
      <div>
        <h2>프로젝트 정보를 찾을 수 없습니다.</h2>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="-mb-4">
        <Header />
      </div>
      <ProjectDetailCard project={project} />
    </div>
  );
}
