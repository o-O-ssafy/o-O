/**
 * Shared speech bubble styling constants
 *
 * Used by ChatInputBubble and ChatBubblesOverlay to ensure consistent appearance
 */

export const BUBBLE_STYLES = {
  // Frame
  borderRadius: 12,
  padding: "8px 12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  minWidth: 200,
  maxWidth: 250,

  // Tail (triangle pointer)
  tailSize: 6,
  tailBottom: -6,
  tailLeftPercent: "10%",

  // Typography
  fontSize: 14,
  lineHeight: "1.4",

  // Positioning
  anchorTransform: "translate(-10%, calc(-100% - 14px))",
  offScreenTransform: "translate(-50%, -50%)",
} as const;

/**
 * Creates speech bubble tail style (triangle pointing down)
 */
export function createBubbleTailStyle(
  color: string,
  leftPosition: string = BUBBLE_STYLES.tailLeftPercent
) {
  return {
    position: "absolute" as const,
    bottom: BUBBLE_STYLES.tailBottom,
    left: leftPosition,
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: `${BUBBLE_STYLES.tailSize}px solid transparent`,
    borderRight: `${BUBBLE_STYLES.tailSize}px solid transparent`,
    borderTop: `${BUBBLE_STYLES.tailSize}px solid ${color}`,
  };
}

/**
 * Creates directional arrow style for off-screen indicators
 */
export function createDirectionalArrowStyle(
  direction: "left" | "right" | "top" | "bottom",
  color: string
) {
  const baseStyle = {
    position: "absolute" as const,
    width: 0,
    height: 0,
  };

  const arrowSize = 8;
  const triangleSize = 6;

  switch (direction) {
    case "left":
      return {
        ...baseStyle,
        left: -arrowSize,
        top: "50%",
        transform: "translateY(-50%)",
        borderTop: `${triangleSize}px solid transparent`,
        borderBottom: `${triangleSize}px solid transparent`,
        borderRight: `${arrowSize}px solid ${color}`,
      };
    case "right":
      return {
        ...baseStyle,
        right: -arrowSize,
        top: "50%",
        transform: "translateY(-50%)",
        borderTop: `${triangleSize}px solid transparent`,
        borderBottom: `${triangleSize}px solid transparent`,
        borderLeft: `${arrowSize}px solid ${color}`,
      };
    case "top":
      return {
        ...baseStyle,
        top: -arrowSize,
        left: "50%",
        transform: "translateX(-50%)",
        borderLeft: `${triangleSize}px solid transparent`,
        borderRight: `${triangleSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid ${color}`,
      };
    case "bottom":
      return {
        ...baseStyle,
        bottom: -arrowSize,
        left: "50%",
        transform: "translateX(-50%)",
        borderLeft: `${triangleSize}px solid transparent`,
        borderRight: `${triangleSize}px solid transparent`,
        borderTop: `${arrowSize}px solid ${color}`,
      };
  }
}
