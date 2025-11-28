/**
 * D3 Mindmap Gradient & Shadow Utilities
 * - SVG 그라데이션 생성 (트렌드 마인드맵 방식)
 * - SVG 그림자 필터 생성
 */

import * as d3 from "d3";
import type { NodeData } from "../types";

/**
 * SVG defs에 radial gradient를 생성합니다
 * @param defs - D3 selection of SVG defs element
 * @param id - Gradient ID
 * @param baseColor - 기본 색상 (hex)
 * @param opacities - 투명도 설정
 */
export function createNodeGradient(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  baseColor: string,
  opacities: { inner: number; middle: number; outer: number } = {
    inner: 0.9,
    middle: 0.4,
    outer: 0,
  }
): void {
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
}

/**
 * SVG defs에 shadow filter를 생성합니다
 * @param defs - D3 selection of SVG defs element
 * @param id - Filter ID
 * @param color - 그림자 색상 (hex)
 */
export function createNodeShadow(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  color: string = "#000000"
): void {
  const filter = defs
    .append("filter")
    .attr("id", id)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  // Gaussian blur
  filter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 4);

  // Offset
  filter
    .append("feOffset")
    .attr("dx", 0)
    .attr("dy", 3)
    .attr("result", "offsetblur");

  // Color matrix for tinting shadow
  const colorMatrix = filter
    .append("feComponentTransfer")
    .attr("in", "offsetblur")
    .attr("result", "shadow");

  // Simple dark shadow (can be customized per color)
  colorMatrix.append("feFuncA").attr("type", "linear").attr("slope", 0.3);

  // Merge with source
  const merge = filter.append("feMerge");
  merge.append("feMergeNode").attr("in", "shadow");
  merge.append("feMergeNode").attr("in", "SourceGraphic");
}

/**
 * 모든 노드에 대한 그라데이션을 생성합니다
 * @param defs - D3 selection of SVG defs element
 * @param nodes - 노드 배열
 */
export function createAllGradients(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  nodes: NodeData[]
): void {
  // 각 노드마다 고유한 그라데이션 생성
  nodes.forEach((node) => {
    createNodeGradient(defs, `gradient-${node.id}`, node.color, {
      inner: 0.9,
      middle: 0.4,
      outer: 0,
    });

    createNodeShadow(defs, `shadow-${node.id}`, node.color);
  });
}

/**
 * 기존 그라데이션과 새도우를 모두 제거합니다
 * @param defs - D3 selection of SVG defs element
 */
export function clearAllGradients(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>
): void {
  defs.selectAll("radialGradient").remove();
  defs.selectAll("filter").remove();
}

/**
 * 노드 그라데이션 ID를 반환합니다
 * @param nodeId - 노드 ID
 * @returns 그라데이션 URL
 */
export function getGradientUrl(nodeId: string): string {
  return `url(#gradient-${nodeId})`;
}

/**
 * 노드 그림자 ID를 반환합니다
 * @param nodeId - 노드 ID
 * @returns 그림자 필터 URL
 */
export function getShadowUrl(nodeId: string): string {
  return `url(#shadow-${nodeId})`;
}
