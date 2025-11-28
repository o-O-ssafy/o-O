import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { clearAuth } from "@/store/slices/authSlice";
import { clearUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/hooks";

interface ModalHeaderProps {
  readonly isEditing: boolean;
  readonly onEdit: () => void;
  readonly onClose: () => void;
}

export function ModalHeader({ isEditing, onEdit, onClose }: ModalHeaderProps) {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Redux store 초기화
    dispatch(clearAuth());
    dispatch(clearUser());

    // 홈으로 리다이렉트
    globalThis.location.href = "/";
  };

  return (
    <div className="flex justify-between items-center">
      <div className="absolute top-2 sm:top-4 ">
        <button
          onClick={handleLogout}
          className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 hover:bg-gray-100 transition bg-[#F6F6F6] rounded-full border border-[#E5E5E5] shadow-md mr-0.5 sm:mr-1 hover:bg-primary/90 group"
          title="로그아웃"
        >
          <LogoutIcon
            sx={{
              color: "#263A6B",
              fontSize: { xs: 20, sm: 24 },
              ".group:hover &": { color: "white" },
              display: "block",
              width: { xs: 20, sm: 24 },
              height: { xs: 20, sm: 24 },
            }}
          />
        </button>
      </div>
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
        {!isEditing && (
          <button
            onClick={onEdit}
            className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 hover:bg-gray-100 transition bg-[#F6F6F6] rounded-full border border-[#E5E5E5] shadow-md mr-0.5 sm:mr-1 hover:bg-primary/90 group"
            title="수정"
          >
            <EditIcon
              sx={{
                color: "#263A6B",
                fontSize: { xs: 20, sm: 24 },
                ".group:hover &": { color: "white" },
                display: "block",
                width: { xs: 20, sm: 24 },
                height: { xs: 20, sm: 24 },
              }}
            />
          </button>
        )}
        <button
          onClick={onClose}
          className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 hover:bg-gray-100 transition bg-[#F6F6F6] rounded-full border border-[#E5E5E5] shadow-md hover:bg-primary/90 group"
          title="닫기"
        >
          <CloseIcon
            sx={{
              color: "#263A6B",
              fontSize: 24,
              ".group:hover &": { color: "white" },
              display: "block",
              width: { xs: 20, sm: 24 },
              height: { xs: 20, sm: 24 },
            }}
          />
        </button>
      </div>
    </div>
  );
}
