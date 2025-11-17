import { useMemo } from "react";
import type { Transform } from "@/features/mindmap/types";

type UseSpeechBubbleOptions = {
  modelPosition: { x: number; y: number };
  transform: Transform;
  containerSize?: { width: number; height: number };
};

type UseSpeechBubbleReturn = {
  screenPosition: { x: number; y: number };
  clampedPosition: { x: number; y: number };
  isOffScreen: boolean;
  arrowDirection: "left" | "right" | "top" | "bottom" | null;
};

/**
 * Speech bubble positioning hook
 *
 * **Features:**
 * - Transforms model coordinates to screen coordinates using D3 transform
 * - Detects if position is off-screen
 * - Clamps position to viewport edges when off-screen
 * - Calculates directional arrow for off-screen indicators
 */
export function useSpeechBubble({
  modelPosition,
  transform,
  containerSize,
}: UseSpeechBubbleOptions): UseSpeechBubbleReturn {
  // D3 transform: model → screen coordinates
  const screenPosition = useMemo(() => {
    return {
      x: modelPosition.x * transform.k + transform.x,
      y: modelPosition.y * transform.k + transform.y,
    };
  }, [modelPosition, transform]);

  // Off-screen detection and position clamping
  const { clampedPosition, isOffScreen, arrowDirection } = useMemo(() => {
    // If no container size provided, no clamping needed
    if (!containerSize) {
      return {
        clampedPosition: screenPosition,
        isOffScreen: false,
        arrowDirection: null,
      };
    }

    const { x, y } = screenPosition;
    const { width, height } = containerSize;

    // Check if cursor is outside viewport
    const offScreen = {
      left: x < 0,
      right: x > width,
      top: y < 0,
      bottom: y > height,
    };

    const anyOffScreen = Object.values(offScreen).some(Boolean);

    if (!anyOffScreen) {
      return {
        clampedPosition: screenPosition,
        isOffScreen: false,
        arrowDirection: null,
      };
    }

    // Clamp position to screen edges
    let clampedX = x;
    let clampedY = y;
    let direction: "left" | "right" | "top" | "bottom" | null = null;

    if (offScreen.left) {
      clampedX = 20;
      direction = "left";
    } else if (offScreen.right) {
      clampedX = width - 20;
      direction = "right";
    }

    if (offScreen.top) {
      clampedY = 20;
      direction = "top";
    } else if (offScreen.bottom) {
      clampedY = height - 20;
      direction = "bottom";
    }

    return {
      clampedPosition: { x: clampedX, y: clampedY },
      isOffScreen: true,
      arrowDirection: direction,
    };
  }, [screenPosition, containerSize]);

  return {
    screenPosition,
    clampedPosition,
    isOffScreen,
    arrowDirection,
  };
}
