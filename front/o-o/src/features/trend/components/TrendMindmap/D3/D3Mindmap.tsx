// D3Mindmap.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { D3MindmapProps } from "../../../types/d3mindmapType";
import { useFullscreen } from "@/shared/hooks/useFullscreen";
import { createShadowFilters, createGradients } from "./d3ShadowGradient";
import { createNodeData, createLinkData } from "./d3NodeGenerator";
import {
  setupSimulation,
  setupTickHandler,
  setupEndHandler,
} from "./d3SimulationRenderer";
import {
  renderLinks,
  renderNodeGroups,
  renderBlurBackgrounds,
  renderMainCircles,
  renderText,
} from "./d3ElementRenderer";

export function D3Mindmap({
  parentKeyword,
  childKeywords,
  onMoreClick,
  onNodeClick,
}: Readonly<D3MindmapProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const onMoreClickRef = useRef(onMoreClick);
  const onNodeClickRef = useRef(onNodeClick);

  const isFullscreen = useFullscreen();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isMoreButtonClicked, setIsMoreButtonClicked] = useState(false);

  useEffect(() => {
    onMoreClickRef.current = onMoreClick;
  }, [onMoreClick]);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  const displayKeywords = useMemo(() => {
    return childKeywords.slice(0, 7);
  }, [childKeywords.map((k) => k.keyword).join(",")]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg
      .selectAll("g > circle:last-of-type")
      .filter((d: any) => d.isMoreButton)
      .attr("stroke", isMoreButtonClicked ? "#6B7280" : "none")
      .attr("stroke-width", isMoreButtonClicked ? 3 : 0);
  }, [isMoreButtonClicked]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const svg = d3.select(svgRef.current);
    const width = containerSize.width;
    const height = containerSize.height;

    svg.selectAll("*").remove();

    // 스케일 팩터 계산
    let scaleFactor: number;
    if (isFullscreen) {
      const baseWidth = 1920;
      const baseHeight = 1080;
      const widthScale = width / baseWidth;
      const heightScale = height / baseHeight;
      scaleFactor = Math.max(widthScale, heightScale, 1.5);
    } else {
      scaleFactor = 1;
    }

    // 자식 개수에 따라 거리 조정 (자식이 적을수록 더 멀리)
    const baseLinkDistance = 320 * scaleFactor;
    const linkDistance =
      childKeywords.length <= 2 ? baseLinkDistance * 1.5 : baseLinkDistance;
    const chargeStrength = -700 * scaleFactor;
    const collisionRadius = 50 * scaleFactor;

    // 노드 및 링크 생성
    const nodes = createNodeData(
      parentKeyword,
      displayKeywords,
      width,
      height,
      scaleFactor,
      childKeywords.length
    );
    const links = createLinkData(parentKeyword, displayKeywords);

    // 필터 및 그라데이션 생성
    const defs = svg.append("defs");
    createShadowFilters(defs, displayKeywords);
    createGradients(defs, displayKeywords);

    // 시뮬레이션 설정
    const simulation = setupSimulation(nodes, links, {
      width,
      height,
      linkDistance,
      chargeStrength,
      collisionRadius,
    });

    // 요소 렌더링
    const link = renderLinks(svg, links);
    const node = renderNodeGroups(svg, nodes);
    renderBlurBackgrounds(node);
    renderMainCircles(
      node,
      onNodeClickRef.current,
      onMoreClickRef.current,
      childKeywords,
      setIsMoreButtonClicked
    );
    renderText(node);

    // 이벤트 핸들러 설정
    const tickHandler = setupTickHandler(nodes, link, node, width, height);
    const endHandler = setupEndHandler(nodes);

    simulation.on("tick", tickHandler).on("end", endHandler);

    return () => {
      simulation.stop();
    };
  }, [
    parentKeyword,
    displayKeywords,
    containerSize,
    isFullscreen,
    childKeywords,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "#F9FAFB" }}
      />
    </div>
  );
}
