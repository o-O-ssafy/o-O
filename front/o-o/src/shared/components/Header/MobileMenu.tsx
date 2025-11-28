import { NavLink, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { useCallback } from "react";
import popo1 from "@/shared/assets/images/popo1.webp";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import { GoogleLoginButton } from "@/shared/components/GoogleLoginButton";
import { getMindmapPath } from "@/constants/paths";
import { useCreateWorkspaceMutation } from "@/features/workspace/hooks/mutation/useCreateWorkspaceMutation";
import { useToast } from "@/shared/ui/ToastProvider";

interface MobileMenuProps {
  readonly isOpen: boolean;
  readonly isLoggedIn: boolean;
  readonly userProfileImage?: string;
  readonly userName?: string;
  readonly onClose: () => void;
  readonly onProfileClick: () => void;
  readonly getNavLinkClass: (props: NavLinkRenderProps) => string;
}

export function MobileMenu({
  isOpen,
  isLoggedIn,
  userProfileImage,
  userName,
  onClose,
  onProfileClick,
  getNavLinkClass,
}: MobileMenuProps) {
  const navigate = useNavigate();
  const { mutateAsync: createWorkspaceMutation, isPending } =
    useCreateWorkspaceMutation();
  const { showToast } = useToast();

  const handleClickNewProject = useCallback(async () => {
    if (isPending) return;

    try {
      const workspace = await createWorkspaceMutation(undefined);
      onClose();
      navigate(getMindmapPath(workspace.id));
    } catch (error) {
      console.error("Failed to create workspace", error);
      showToast(
        "워크스페이스 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
        "error"
      );
    }
  }, [createWorkspaceMutation, isPending, navigate, showToast, onClose]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 top-[80px] bg-white z-50 font-paperlogy">
      <nav className="flex flex-col py-10 px-10 gap-6 text-lg">
        <NavLink to="/" className={getNavLinkClass} onClick={onClose}>
          🏠 Home
        </NavLink>
        <NavLink to="/trend" className={getNavLinkClass} onClick={onClose}>
          🌎 Trend
        </NavLink>
        {isLoggedIn ? (
          <>
            <button
              type="button"
              className={`text-left font-semibold text-semi-black transition-opacity ${
                isPending ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={handleClickNewProject}
              disabled={isPending}
            >
              ✨ {isPending ? "Creating..." : "New Project"}
            </button>
            <NavLink to="/mypage" className={getNavLinkClass} onClick={onClose}>
              🙋‍♂️ My Page
            </NavLink>
            <button
              onClick={onProfileClick}
              className="pt-6 border-t border-gray-200 flex justify-end"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img
                    src={getProfileImageUrl(userProfileImage) || popo1}
                    alt="profile"
                    className="w-11 h-11 object-cover"
                  />
                </div>
                <span className="text-base font-medium text-primary">
                  {userName}
                </span>
              </div>
            </button>
          </>
        ) : (
          <div className="mt-4 pt-6 border-t border-gray-200 flex justify-end">
            <GoogleLoginButton />
          </div>
        )}
      </nav>
    </div>
  );
}
