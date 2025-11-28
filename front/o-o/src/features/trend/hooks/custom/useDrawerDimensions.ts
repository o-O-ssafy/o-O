import { useFullscreen } from "@/shared/hooks/useFullscreen";

interface DrawerDimensions {
  drawerHeight: string;
  buttonBottom: string;
}

export function useDrawerDimensions(isOpen: boolean): DrawerDimensions {
  const isFullscreen = useFullscreen();

  const drawerHeight = isFullscreen
    ? "h-[12vh] sm:h-[10vh] md:h-[14vh]"
    : "h-[18vh] sm:h-[18vh] md:h-[18vh]";

  const getButtonBottom = (): string => {
    if (!isOpen) {
      return "bottom-4";
    }

    if (isFullscreen) {
      return "bottom-[calc(12vh+1rem)] sm:bottom-[calc(10vh+1rem)] md:bottom-[calc(14vh+1rem)]";
    }

    return "bottom-[calc(25vh+1rem)] sm:bottom-[calc(20vh+1rem)] md:bottom-[calc(18vh+1rem)]";
  };

  return {
    drawerHeight,
    buttonBottom: getButtonBottom(),
  };
}
