import { ProjectCard } from "@/features/mypage/components/ProjectCard/ProjectCard";
import type { Project } from "@/features/trend/types/types";

interface ClickableProjectCardProps {
  readonly project: Project;
  readonly onClick: (id: string) => void;
}

export function ClickableProjectCard({
  project,
  onClick,
}: ClickableProjectCardProps) {
  const handleClick = () => {
    onClick(project.id);
  };

  return <ProjectCard project={project} onClick={handleClick} />;
}
