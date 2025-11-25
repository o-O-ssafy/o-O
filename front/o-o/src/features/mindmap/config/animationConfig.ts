/**
 * Animation Configuration
 * - Centralized animation settings for D3.js graph rendering
 * - Supports accessibility (prefers-reduced-motion)
 */

/**
 * Detect if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Animation durations
 * - Returns 0ms if user prefers reduced motion
 * - Otherwise returns the specified duration
 */
export const getDuration = (defaultDuration: number): number => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

/**
 * Node Creation Animation Config
 */
export const nodeCreationAnimation = {
  duration: 400, // ms
  easing: "ease-out-cubic" as const,
  initialStyle: {
    opacity: 0,
    width: 128, // 160 * 0.8
    height: 128,
  },
  targetStyle: {
    opacity: 1,
    width: 160,
    height: 160,
  },
};

/**
 * Node Deletion Animation Config
 */
export const nodeDeletionAnimation = {
  duration: 300, // ms
  easing: "ease-in-cubic" as const,
  targetStyle: {
    opacity: 0,
    width: 0,
    height: 0,
  },
};

/**
 * Selection Pulse Animation Config
 */
export const selectionPulseAnimation = {
  duration: 300, // ms
  easing: "ease-out-quad" as const,
  keyframes: [
    { width: 160, height: 160 }, // start
    { width: 180, height: 180 }, // expand
    { width: 160, height: 160 }, // return
  ],
};

/**
 * Get animation config with accessibility support
 */
export const getAnimationConfig = () => {
  const reduced = prefersReducedMotion();

  return {
    nodeCreation: {
      ...nodeCreationAnimation,
      duration: reduced ? 0 : nodeCreationAnimation.duration,
    },
    nodeDeletion: {
      ...nodeDeletionAnimation,
      duration: reduced ? 0 : nodeDeletionAnimation.duration,
    },
    selectionPulse: {
      ...selectionPulseAnimation,
      duration: reduced ? 0 : selectionPulseAnimation.duration,
    },
  };
};
