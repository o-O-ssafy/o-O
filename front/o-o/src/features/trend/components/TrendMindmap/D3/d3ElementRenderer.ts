// utils/d3ElementRenderer.ts
import * as d3 from "d3";
import type { Node, Link } from "../../../types/d3mindmapType";
import type { TrendKeywordItem } from "../../../types/trend";
import { getNodeSize } from "./d3NodeGenerator";

export function renderLinks(svg: any, links: Link[]) {
  return svg
    .append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke", "#E5E7EB")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.6);
}

export function renderNodeGroups(svg: any, nodes: Node[]) {
  return svg
    .append("g")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .style("cursor", "pointer");
}

export function renderBlurBackgrounds(node: any) {
  let childIndex = 0;
  node
    .append("circle")
    .attr("r", (d: any) => getNodeSize(d) / 2 + 20)
    .attr("fill", (d: any) => {
      if (d.isParent) return "url(#gradient-parent)";
      if (d.isMoreButton) return "url(#gradient-more)";
      return `url(#gradient-${childIndex++})`;
    })
    .attr("opacity", 0.3)
    .style("filter", "blur(12px)");
}

export function renderMainCircles(
  node: any,
  onNodeClick: (keyword: string) => void,
  onMoreClick: (keywords: TrendKeywordItem[]) => void,
  childKeywords: TrendKeywordItem[],
  setIsMoreButtonClicked: (fn: (prev: boolean) => boolean) => void
) {
  let childIndex = 0;
  return node
    .append("circle")
    .attr("r", (d: any) => getNodeSize(d) / 2)
    .attr("fill", (d: any) => {
      if (d.isParent) return "url(#gradient-parent)";
      if (d.isMoreButton) return "url(#gradient-more)";
      return `url(#gradient-${childIndex++})`;
    })
    .attr("stroke", "none")
    .attr("stroke-width", 0)
    .style("filter", (d: any) => {
      if (d.isParent) return "url(#shadow-parent)";
      if (d.isMoreButton) return "url(#shadow-more)";
      // childIndex는 이미 증가했으므로 -1
      return `url(#shadow-${childIndex - 1})`;
    })
    .on("mouseenter", function (this: SVGCircleElement) {
      d3.select(this)
        .transition()
        .duration(300)
        .attr("r", function (d: any) {
          return (getNodeSize(d) / 2) * 1.1;
        });
    })
    .on("mouseleave", function (this: SVGCircleElement) {
      d3.select(this)
        .transition()
        .duration(300)
        .attr("r", function (d: any) {
          return getNodeSize(d) / 2;
        });
    })
    .on("click", function (event: any, d: any) {
      event.stopPropagation();

      if (d.isMoreButton) {
        setIsMoreButtonClicked((prev) => !prev);
        const remainingKeywords = childKeywords.slice(7);
        onMoreClick(remainingKeywords);
        return;
      }

      if (!d.isParent) {
        onNodeClick(d.label);
      }
    });
}

export function renderText(node: any) {
  node
    .append("text")
    .text((d: any) => d.label)
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em")
    .attr("font-size", (d: any) =>
      d.isParent
        ? "28px"
        : d.isMoreButton
          ? "16px"
          : d.rank === 1
            ? "20px"
            : d.rank === 2
              ? "18px"
              : "16px"
    )
    .attr("font-weight", "bold")
    .attr("fill", "#1F2937")
    .style("pointer-events", "none");
}
