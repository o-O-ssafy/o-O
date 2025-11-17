import { setRedirectPath } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";

export function GoogleLoginButton() {
  const dispatch = useDispatch();

  const handleLogin = () => {
    // 현재 경로 저장
    const currentPath = globalThis.location.pathname;
    dispatch(setRedirectPath(currentPath));
    localStorage.setItem("redirectPath", currentPath);

    globalThis.location.href = `${import.meta.env.VITE_LOGIN_API_URL}`;
  };

  return (
    <button
      onClick={handleLogin}
      className="px-3 py-3 bg-white rounded-full hover:bg-gray-50 flex items-center gap-3 shadow-md transition-colors"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-6 h-6"
      />
    </button>
  );
}
