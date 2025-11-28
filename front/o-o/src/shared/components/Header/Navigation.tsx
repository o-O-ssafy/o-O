// components/Header/Navigation.tsx
import { useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { getMindmapPath } from "@/constants/paths";
import { useCreateWorkspaceMutation } from "@/features/workspace/hooks/mutation/useCreateWorkspaceMutation";
import { useToast } from "@/shared/ui/ToastProvider";

interface NavigationProps {
  readonly isLoggedIn: boolean;
  readonly getNavLinkClass: (props: NavLinkRenderProps) => string;
}

export function Navigation({ isLoggedIn, getNavLinkClass }: NavigationProps) {
  const navigate = useNavigate();
  const { mutateAsync: createWorkspaceMutation, isPending } =
    useCreateWorkspaceMutation();
  const { showToast } = useToast();

  const handleClickNewProject = useCallback(async () => {
    if (isPending) return;

    try {
      const workspace = await createWorkspaceMutation(undefined);
      navigate(getMindmapPath(workspace.id));
    } catch (error) {
      console.error("Failed to create workspace", error);
      showToast(
        "워크스페이스 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
        "error"
      );
    }
  }, [createWorkspaceMutation, isPending, navigate, showToast]);

  return (
    <nav className="hidden md:flex items-baseline gap-3 lg:gap-6 text-sm lg:text-base">
      <NavLink to="/" className={getNavLinkClass}>
        Home
      </NavLink>
      <NavLink to="/trend" className={getNavLinkClass}>
        Trend
      </NavLink>
      {isLoggedIn && (
        <>
          <button
            type="button"
            className={`font-semibold text-semi-black transition-opacity ${
              isPending ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={handleClickNewProject}
            disabled={isPending}
          >
            {isPending ? "Creating..." : "New Project"}
          </button>
          <NavLink to="/mypage" className={getNavLinkClass}>
            My Page
          </NavLink>
        </>
      )}
    </nav>
  );
}
