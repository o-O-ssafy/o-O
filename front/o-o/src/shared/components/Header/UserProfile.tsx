import popo1 from "@/shared/assets/images/popo1.webp";
interface UserProfileProps {
  readonly userName: string;
  readonly profileImage?: string;
  readonly onClick: () => void;
}

export function UserProfile({
  userName,
  profileImage,
  onClick,
}: UserProfileProps) {
  return (
    <button onClick={onClick}>
      <div className="flex items-center gap-2 lg:gap-4 px-2 py-1 lg:px-4 lg:py-2">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white flex items-center justify-center shadow-md">
          <img
            src={profileImage || popo1}
            alt="profile"
            className="w-9 h-9 lg:w-11 lg:h-11 object-cover rounded-full"
          />
        </div>
        <span className="text-sm lg:text-base font-medium text-primary truncate">
          {userName.length > 10 ? `${userName.slice(0, 10)}…` : userName}
        </span>
      </div>
    </button>
  );
}
