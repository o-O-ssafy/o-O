import popo1 from "@/shared/assets/images/popo1.webp";
import popo2 from "@/shared/assets/images/popo2.webp";
import popo3 from "@/shared/assets/images/popo3.webp";
import popo4 from "@/shared/assets/images/popo4.webp";

export const profileImageMap: Record<string, string> = {
  popo1,
  popo2,
  popo3,
  popo4,
};

export const getProfileImageUrl = (imageName: string | undefined): string => {
  if (!imageName) {
    return popo1;
  }

  return profileImageMap[imageName] || popo1;
};
