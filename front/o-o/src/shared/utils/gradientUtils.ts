/**
 * Utility functions for creating gradient effects
 */
import { COLOR_THEMES } from "@/features/mindmap/styles/colorThemes";

/**
 * Converts hex color to RGB values
 * @param hex - Hex color code (e.g., "#FFD0EA" or "FFD0EA")
 * @returns Object with r, g, b values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Creates a radial gradient CSS string from a hex color
 * Gradient stops for compact, defined appearance:
 * - 0%: Full opacity center (100%)
 * - 25%: Still strong (75%)
 * - 50%: Gentle fade (40%)
 * - 70%: Fully transparent (0%) - compact edge
 *
 * @param hexColor - Hex color code (e.g., "#FFD0EA" or "FFD0EA")
 * @returns CSS radial-gradient string
 *
 * @example
 * createRadialGradient("#FFD0EA")
 * // Returns: "radial-gradient(circle at center, rgba(255, 208, 234, 1) 0%, rgba(255, 208, 234, 0.75) 25%, rgba(255, 208, 234, 0.4) 50%, rgba(255, 208, 234, 0) 70%)"
 */
export function createRadialGradient(hexColor: string): string {
  const { r, g, b } = hexToRgb(hexColor);

  return `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${r}, ${g}, ${b}, 0.75) 25%, rgba(${r}, ${g}, ${b}, 0.4) 50%, rgba(${r}, ${g}, ${b}, 0) 70%)`;
}

/**
 * Gets node color based on rank
 * @param rank - Node rank (1-7+)
 * @param isParent - Whether the node is a parent node
 * @returns Hex color code
 */
export const getNodeColorByRank = (
  rank?: number,
  isParent?: boolean
): string => {
  // Pastel 테마 사용 (기본값)
  const colors = COLOR_THEMES.Pastel;

  if (isParent) return colors[0];

  return colors[(rank || 1) - 1] || colors[0];
};

/**
 * Creates an SVG radial gradient with customizable opacity stops
 * @param defs - D3 selection of SVG defs element
 * @param id - Unique ID for the gradient
 * @param baseColor - Base hex color for the gradient
 * @param opacities - Optional opacity values for inner, middle, and outer stops
 * @returns D3 selection of the created gradient
 *
 * @example
 * const defs = svg.append("defs");
 * createSVGRadialGradient(defs, "gradient-1", "#BFDBFE");
 */
export const createSVGRadialGradient = (
  defs: any, // d3.Selection<SVGDefsElement, unknown, null, undefined>
  id: string,
  baseColor: string,
  opacities: { inner: number; middle: number; outer: number } = {
    inner: 0.8,
    middle: 0.6,
    outer: 0.3,
  }
) => {
  const gradient = defs.append("radialGradient").attr("id", id);

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", baseColor)
    .attr("stop-opacity", opacities.inner);

  gradient
    .append("stop")
    .attr("offset", "70%")
    .attr("stop-color", baseColor)
    .attr("stop-opacity", opacities.middle);

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", baseColor)
    .attr("stop-opacity", opacities.outer);

  return gradient;
};
