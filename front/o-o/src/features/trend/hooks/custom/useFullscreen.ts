import { useEffect, useState } from "react";

const FULLSCREEN_THRESHOLD = 50;

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      const heightDiff = Math.abs(window.innerHeight - window.screen.height);
      const widthDiff = Math.abs(window.innerWidth - window.screen.width);

      setIsFullscreen(
        heightDiff < FULLSCREEN_THRESHOLD && widthDiff < FULLSCREEN_THRESHOLD
      );
    };

    checkFullscreen();
    window.addEventListener("resize", checkFullscreen);

    return () => window.removeEventListener("resize", checkFullscreen);
  }, []);

  return isFullscreen;
}
