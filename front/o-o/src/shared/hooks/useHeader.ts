import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

export function useHeader() {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && globalThis.google) {
      globalThis.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (res) => console.log("로그인 응답:", res),
      });
    }
  }, [isLoggedIn]);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleProfileClick = () => {
    openProfileModal();
    closeMobileMenu();
  };

  return {
    isProfileModalOpen,
    isMobileMenuOpen,
    openProfileModal,
    closeProfileModal,
    toggleMobileMenu,
    closeMobileMenu,
    handleProfileClick,
  };
}
