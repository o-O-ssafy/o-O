import { Avatar } from "@/components/ui/avatar";
import { ProfileEditModal } from "@/features/mypage/components/Profile/ProfileEditModal";
import { GoogleLoginButton } from "@/shared/components/GoogleLoginButton";
import { SearchButton } from "@/shared/components/Search/SearchButton";
import { useHeader } from "@/shared/hooks/useHeader";
import MiniNav from "@/shared/ui/MiniNav";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import { useAppSelector } from "@/store/hooks";
import { AvatarImage } from "@radix-ui/react-avatar";

export function TrendMindmapHeader() {
  const { isProfileModalOpen, openProfileModal, closeProfileModal } =
    useHeader();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.user);

  return (
    <>
      <div className="flex justify-between items-start">
        <MiniNav />
        <div className="flex gap-4 items-center">
          {/* <SearchButton /> */}
          {isLoggedIn && user ? (
            <button
              onClick={openProfileModal}
              className="shadow-md rounded-full bg-white p-1 "
            >
              <Avatar>
                <AvatarImage
                  src={getProfileImageUrl(user.profileImage)}
                  alt="profile-image"
                />
              </Avatar>
            </button>
          ) : (
            <GoogleLoginButton />
          )}
        </div>
      </div>
      {isProfileModalOpen && user && (
        <ProfileEditModal onClose={closeProfileModal} />
      )}
    </>
  );
}
