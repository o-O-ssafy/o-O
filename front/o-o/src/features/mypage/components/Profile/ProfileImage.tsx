import { useEffect, useState } from "react";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";

interface ProfileImageProps {
  readonly currentImage?: string;
  readonly isEditing: boolean;
  readonly onImageChange?: (image: string) => void;
}

export function ProfileImage({
  currentImage,
  isEditing,
  onImageChange,
}: ProfileImageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const handleSelectImage = (image: string) => {
    // 같은 아바타를 다시 클릭하면 원래 이미지로 복원
    if (selectedImage === image) {
      setSelectedImage(originalImage);
      onImageChange?.(originalImage || "");
    } else {
      setSelectedImage(image);
      onImageChange?.(image);
    }
  };

  useEffect(() => {
    if (isEditing) {
      // 편집 모드 시작 시 현재 이미지를 원본으로 저장
      if (!originalImage) {
        setOriginalImage(currentImage || null);
      }
      setSelectedImage(currentImage || null);
    } else {
      // 편집 모드가 아니면 상태 초기화
      setOriginalImage(null);
      setSelectedImage(currentImage || null);
    }
  }, [currentImage, isEditing, originalImage]);

  const avatarOptions = ["popo4", "popo3", "popo2", "popo1"];

  // 반응형 radius 계산
  const getRadius = () => {
    if (globalThis.window !== undefined) {
      return window.innerWidth < 640 ? 80 : 90; // 모바일: 60, 데스크톱: 85
    }
    return 85;
  };

  const [radius, setRadius] = useState(getRadius());

  useEffect(() => {
    const handleResize = () => setRadius(getRadius());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {isEditing && (
        <div className="absolute inset-0 flex items-center justify-center pl-4">
          {avatarOptions.map((avatar, index) => {
            const angle = 110 + (index / avatarOptions.length) * 180;
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);
            const isSelected = selectedImage === avatar;

            return (
              <button
                key={avatar}
                onClick={() => handleSelectImage(avatar)}
                className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full border p-1 sm:p-1.5 transition overflow-hidden ${
                  isSelected ? "bg-primary " : "bg-[#F6F6F6] border-[#E5E5E5]"
                } hover:bg-primary/80`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                <img
                  src={getProfileImageUrl(avatar)}
                  alt={`avatar-${index}`}
                  className="object-cover rounded-full w-full h-full"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-full bg-[#F6F6F6] border-[#E5E5E5] border sm:p-2 p-1 z-10">
        <img
          src={getProfileImageUrl(currentImage || "")}
          alt="profile"
          className="object-cover rounded-full"
          style={{
            width: "clamp(80px, 6vw, 160px)",
            height: "clamp(80px, 6vw, 160px)",
          }}
        />
      </div>
    </div>
  );
}
