// components/Header/Header.tsx
import { Link } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import logo from "@/shared/assets/images/logo.webp";

import { ProfileEditModal } from "@/features/mypage/components/Profile/ProfileEditModal";
import { useHeader } from "@/shared/hooks/useHeader";
import { Navigation } from "@/shared/components/Header/Navigation";
import { UserProfile } from "@/shared/components/Header/UserProfile";
import { MobileMenu } from "@/shared/components/Header/MobileMenu";
import { GoogleLoginButton } from "@/shared/components/GoogleLoginButton";
import { useAppSelector } from "@/store/hooks";
import { getProfileImageUrl } from "../utils/imageMapper";

const getNavLinkClass = ({ isActive }: NavLinkRenderProps) =>
  ` ${isActive ? "text-primary font-bold" : "text-semi-black font-semibold"}`;

export function Header() {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.user);

  const {
    isProfileModalOpen,
    isMobileMenuOpen,
    openProfileModal,
    closeProfileModal,
    toggleMobileMenu,
    closeMobileMenu,
    handleProfileClick,
  } = useHeader();

  return (
    <>
      <header
        className="
          flex items-center justify-between font-paperlogy 
          px-4 sm:px-8 lg:px-10
          py-3 sm:py-6 lg:pb-10 lg:pt-6"
      >
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/">
            <img
              src={logo}
              alt="o-O"
              className="w-16 h-6 sm:w-24 sm:h-8 lg:w-[108px] lg:h-10"
            />
          </Link>
          <Navigation
            isLoggedIn={isLoggedIn}
            getNavLinkClass={getNavLinkClass}
          />
        </div>

        <div className="hidden md:flex">
          {isLoggedIn && user ? (
            <UserProfile
              userName={user.nickname}
              profileImage={getProfileImageUrl(user.profileImage)}
              onClick={openProfileModal}
            />
          ) : (
            <GoogleLoginButton />
          )}
        </div>

        <button onClick={toggleMobileMenu} className="md:hidden p-2">
          {isMobileMenuOpen ? (
            <CloseIcon sx={{ fontSize: 28, color: "#263A6B" }} />
          ) : (
            <MenuIcon sx={{ fontSize: 28, color: "#263A6B" }} />
          )}
        </button>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        isLoggedIn={isLoggedIn}
        userProfileImage={user?.profileImage}
        userName={user?.nickname}
        onClose={closeMobileMenu}
        onProfileClick={handleProfileClick}
        getNavLinkClass={getNavLinkClass}
      />

      {isProfileModalOpen && user && (
        <ProfileEditModal onClose={closeProfileModal} />
      )}
    </>
  );
}
