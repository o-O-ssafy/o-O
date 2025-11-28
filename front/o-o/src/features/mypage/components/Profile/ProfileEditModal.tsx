import { useState } from "react";
import { ProfileImage } from "./ProfileImage";
import { ProfileForm } from "./ProfileForm";
import { ModalHeader } from "./ModalHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserProfile } from "@/store/slices/userSlice";

interface ProfileEditModalProps {
  readonly onClose: () => void;
}

export function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || "popo1"
  );

  if (!user) return null;

  const handleSave = async () => {
    try {
      await dispatch(
        updateUserProfile({
          nickname,
          profileImage,
        })
      ).unwrap();

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setNickname(user.nickname || "");
    setProfileImage(user.profileImage || "");
    setIsEditing(false);
  };

  const handleImageChange = (newImage: string) => {
    setProfileImage(newImage);
  };

  return (
    <div>
      <div
        className="fixed inset-0 bg-[#B8B8B8]/60 z-50 backdrop-blur-[2px]"
        role="none"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-lg shadow-lg px-4 py-8 w-full max-w-md relative">
          <ModalHeader
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onClose={onClose}
          />

          <div className="flex gap-10 py-3 px-6 items-center">
            <ProfileImage
              currentImage={profileImage}
              isEditing={isEditing}
              onImageChange={handleImageChange}
            />
            <ProfileForm
              name={nickname}
              email={user.email}
              isEditing={isEditing}
              onNameChange={setNickname}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
