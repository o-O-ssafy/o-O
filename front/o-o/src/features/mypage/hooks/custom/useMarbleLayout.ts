import { useEffect, useState } from "react";
import * as d3 from "d3";
import type { SimulationNodeDatum } from "d3";

interface MarbleNode extends SimulationNodeDatum {
  id: number;
  text: string;
  radius: number;
  x?: number;
  y?: number;
}

export function useMarbleLayout(
  keywords: string[],
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [nodes, setNodes] = useState<MarbleNode[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 컨테이너 크기 변경 감지
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(el);
    return () => resizeObserver.unobserve(el);
  }, [containerRef.current]);

  useEffect(() => {
    if (
      keywords.length === 0 ||
      dimensions.width === 0 ||
      dimensions.height === 0
    ) {
      setNodes([]);
      return;
    }

    // 10개 초과 시 랜덤으로 10개만 선택
    const displayKeywords =
      keywords.length > 10
        ? keywords
            .map((keyword) => ({ keyword, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .slice(0, 10)
            .map(({ keyword }) => keyword)
        : keywords;

    const { width, height } = dimensions;

    // 전체 면적과 구슬 개수를 고려한 현실적인 크기 계산
    const totalArea = width * height;

    // 구슬들이 차지할 수 있는 최대 면적 (겹치지 않게)
    // 패킹 효율을 고려하여 전체 면적의 50-60%만 사용
    const packingEfficiency = 0.55;
    const availableArea = totalArea * packingEfficiency;
    const areaPerMarble = availableArea / displayKeywords.length;

    // 평균 반지름 계산 (원의 면적 = π * r²)
    const avgRadius = Math.sqrt(areaPerMarble / Math.PI);

    // 구슬 크기 범위 설정 - 평균 반지름 기준으로
    // 최소 크기는 텍스트가 보일 정도로, 최대 크기는 평균의 1.5배 정도로
    const minRadius = Math.max(40, avgRadius * 0.6);
    const maxRadius = Math.min(120, avgRadius * 1.4);

    console.log("Layout calculation:", {
      containerSize: `${width}x${height}`,
      totalKeywords: keywords.length,
      displayKeywords: displayKeywords.length,
      avgRadius,
      minRadius,
      maxRadius,
    });

    // 구슬마다 다른 크기 부여
    const initialNodes: MarbleNode[] = displayKeywords.map((text, i) => {
      // 크기 분포: 작은(30%), 중간(50%), 큰(20%)
      const random = Math.random();
      let sizeMultiplier;

      if (random < 0.3) {
        // 작은 구슬
        sizeMultiplier = 0.6 + Math.random() * 0.3;
      } else if (random < 0.8) {
        // 중간 구슬
        sizeMultiplier = 0.9 + Math.random() * 0.3;
      } else {
        // 큰 구슬
        sizeMultiplier = 1.2 + Math.random() * 0.3;
      }

      const radius = avgRadius * sizeMultiplier;

      return {
        id: i,
        text,
        radius: Math.min(maxRadius, Math.max(minRadius, radius)),
        x: width * 0.3 + Math.random() * width * 0.4,
        y: height * 0.3 + Math.random() * height * 0.4,
      };
    });

    // 경계선 안에 머무르게 하는 force
    function boundaryForce(nodes: MarbleNode[]) {
      for (const d of nodes) {
        const r = d.radius;
        const padding = 15;
        if (d.x! < r + padding) d.x = r + padding;
        if (d.x! > width - r - padding) d.x = width - r - padding;
        if (d.y! < r + padding) d.y = r + padding;
        if (d.y! > height - r - padding) d.y = height - r - padding;
      }
    }

    // 구슬 개수에 따라 힘의 강도 조정
    const chargeStrength = -Math.max(80, avgRadius * 4);
    const collisionPadding = Math.max(8, avgRadius * 0.2);

    const simulation = d3
      .forceSimulation<MarbleNode>(initialNodes)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.04))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force(
        "collision",
        d3
          .forceCollide<MarbleNode>()
          .radius((d) => d.radius + collisionPadding)
          .strength(1)
          .iterations(3)
      )
      .on("tick", () => boundaryForce(initialNodes))
      .stop();

    // 충분히 안정화될 때까지 시뮬레이션 실행
    for (let i = 0; i < 800; i++) {
      simulation.tick();
      boundaryForce(initialNodes);
    }

    setNodes([...initialNodes]);
  }, [keywords, dimensions.width, dimensions.height]);

  return nodes;
}
