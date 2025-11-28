import { useState, useEffect } from "react";

/**
 * 전체화면 상태를 감지하는 커스텀 훅
 * @returns {boolean} isFullscreen - 현재 전체화면 여부
 */
export function useFullscreen(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      // HTML5 fullscreen API 방식
      const isFull =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      // F11 방식 (window 크기로 판별)
      const heightDiff = Math.abs(window.innerHeight - window.screen.height);
      const widthDiff = Math.abs(window.innerWidth - window.screen.width);
      const isF11Full = heightDiff < 50 && widthDiff < 50;

      // 최종 결과
      const fullscreenNow = !!isFull || isF11Full;
      setIsFullscreen(fullscreenNow);
      console.log("전체화면 감지:", fullscreenNow);
    };

    // 이벤트 등록
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);
    window.addEventListener("resize", checkFullscreen);

    // 초기 확인
    checkFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
      window.removeEventListener("resize", checkFullscreen);
    };
  }, []);

  return isFullscreen;
}
