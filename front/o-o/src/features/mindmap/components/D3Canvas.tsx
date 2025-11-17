import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { cn } from "@/lib/utils";
import type { CytoscapeCanvasProps, NodeData } from "../types";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_CENTER_X,
  CANVAS_CENTER_Y,
  createStraightPath,
  findParentNode,
} from "../utils/d3Utils";
import {
  createAllGradients,
  clearAllGradients,
} from "../utils/d3GradientUtils";
import NodeOverlay from "./overlays/NodeOverlay";

/**
 * D3Canvas
 * - D3 기반 SVG 마인드맵 캔버스
 * - 고정 크기 SVG (10000x10000px)
 * - 부모 노드 중앙 배치
 * - SVG 그라데이션 렌더링
 */
export default function D3Canvas({
  nodes,
  className,
  mode,
  analyzeSelection,
  selectedNodeId,
  isReadOnly = false,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  onDeleteNode,
  onEditNode,
  onBatchNodePositionChange,
  onCyReady,
  onCreateChildNode,
  onAnalyzeNodeToggle,
  detachedSelectionMap,
  onKeepChildrenDelete,
  onConnectDetachedSelection,
  onDismissDetachedSelection,
}: CytoscapeCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const [d3Ready, setD3Ready] = useState(false);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const mouseMoveHandlersRef = useRef<Set<Function>>(new Set());

  // 엣지 생성
  const edges = React.useMemo(() => {
    // nodeId -> id 매핑 생성
    const nodeIdToIdMap = new Map<number, string>();
    for (const node of nodes) {
      const nodeIdValue = (node as any).nodeId;
      if (nodeIdValue !== undefined) {
        nodeIdToIdMap.set(Number(nodeIdValue), node.id);
      }
    }

    return nodes
      .filter((node) => node.parentId && node.parentId !== "0")
      .map((node) => {
        // parentId를 실제 노드 id로 변환
        let sourceId: string;
        const parentIdNum = Number(node.parentId);

        if (!isNaN(parentIdNum) && nodeIdToIdMap.has(parentIdNum)) {
          // parentId가 숫자이고 매핑이 있으면 변환
          sourceId = nodeIdToIdMap.get(parentIdNum)!;
        } else {
          // 그 외에는 그대로 사용
          sourceId = String(node.parentId);
        }

        return {
          id: `${sourceId}-${node.id}`,
          source: sourceId,
          target: node.id,
        };
      });
  }, [nodes]);

  // 부모 노드 위치 확인 (이동은 하지 않음 - 뷰포트로 해결)
  useEffect(() => {
    if (nodes.length === 0) return;
    findParentNode(nodes);
  }, [nodes.length]);

  // SVG 초기화
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // 기존 내용 제거
    svg.selectAll("*").remove();

    // Defs 생성
    const defs = svg.append("defs");

    // 점박이 패턴 생성
    const dotPattern = defs
      .append("pattern")
      .attr("id", "dot-pattern")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("patternUnits", "userSpaceOnUse");

    dotPattern
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 1.5)
      .attr("fill", "#D1D5DB")
      .attr("opacity", 0.5);

    // 모든 노드에 대한 그라데이션 생성
    createAllGradients(defs, nodes);

    // 배경 사각형 (점박이 패턴)
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#dot-pattern)");

    // 그룹 생성 (줌/팬 적용될 컨테이너)
    const g = svg.append("g").attr("class", "viewport");

    // 엣지 그룹
    g.append("g").attr("class", "edges");

    // 노드 그룹
    g.append("g").attr("class", "nodes");

    setD3Ready(true);

    // onCyReady 호출 (Cytoscape API 호환용 mock 객체 + D3 transform 정보)
    if (onCyReady) {
      const mockCy = {
        pan: () => ({ x: transformRef.current.x, y: transformRef.current.y }),
        zoom: () => transformRef.current.k,
        container: () => containerRef.current,
        destroyed: () => false,

        // 이벤트 리스너 등록
        on: (event: string, handler: Function) => {
          if (event === "mousemove") {
            mouseMoveHandlersRef.current.add(handler);
          }
          return mockCy;
        },

        // 이벤트 리스너 제거
        off: (event: string, handler?: Function) => {
          if (event === "mousemove") {
            if (handler) {
              mouseMoveHandlersRef.current.delete(handler);
            } else {
              mouseMoveHandlersRef.current.clear();
            }
          }
          return mockCy;
        },

        // getElementById (노드 선택용)
        getElementById: (id: string) => {
          const node = nodes.find((n) => n.id === id);
          if (!node) return { empty: () => true };

          return {
            empty: () => false,
            position: () => ({ x: node.x, y: node.y }),
          };
        },

        // center (뷰포트 중심 이동)
        center: (element?: any) => {
          // D3에서는 zoom transform으로 처리
          return mockCy;
        },

        // D3 관련 정보 제공
        _d3Transform: transformRef,
        _d3Container: containerRef,
      };

      onCyReady(mockCy as any);
    }

    return () => {
      clearAllGradients(defs);
    };
  }, [onCyReady, nodes.length]); // nodes.length로 노드 추가/삭제 감지

  // 줌/팬 동작 설정
  useEffect(() => {
    if (!svgRef.current || !d3Ready) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>("g.viewport");

    // 뷰포트 크기 가져오기
    const container = containerRef.current;
    if (!container) return;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 1.5]) // 최소 0.3배(축소), 최대 1.5배(확대)
      .extent([
        [0, 0],
        [viewportWidth, viewportHeight],
      ]) // 뷰포트 크기
      .translateExtent([
        [-CANVAS_WIDTH * 0.5, -CANVAS_HEIGHT * 0.5], // 캔버스 왼쪽 위 모서리
        [CANVAS_WIDTH * 1.5, CANVAS_HEIGHT * 1.5], // 캔버스 오른쪽 아래 모서리
      ])
      .filter((event) => {
        // 노드 클릭 이벤트는 zoom에서 제외
        const target = event.target as HTMLElement;
        if (target.closest("[data-node-id]")) {
          return false;
        }
        // 마우스 왼쪽 버튼 드래그와 휠 이벤트만 허용
        return !event.button || event.type === "wheel";
      })
      .on("start", () => {
        if (svgRef.current) {
          svgRef.current.style.cursor = "grabbing";
        }
      })
      .on("zoom", (event) => {
        const newTransform = event.transform;

        g.attr("transform", newTransform.toString());

        // transform 업데이트
        const transformData = {
          x: newTransform.x,
          y: newTransform.y,
          k: newTransform.k,
        };
        transformRef.current = transformData;
        setTransform(transformData);
      })
      .on("end", () => {
        if (svgRef.current) {
          svgRef.current.style.cursor = "grab";
        }
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // 브라우저 기본 줌 차단 (트랙패드 핀치 포함)
    const preventBrowserZoom = (e: WheelEvent) => {
      // Ctrl/Cmd + 휠 또는 트랙패드 핀치 감지
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const svgElement = svgRef.current;
    svgElement.addEventListener("wheel", preventBrowserZoom, {
      passive: false,
    });

    return () => {
      svg.on(".zoom", null);
      svgElement.removeEventListener("wheel", preventBrowserZoom);
    };
  }, [d3Ready]);

  // 초기 뷰포트 설정 - 부모 노드를 화면 중앙에 배치
  const hasInitializedViewportRef = useRef(false);
  useEffect(() => {
    if (!svgRef.current || !d3Ready || !zoomBehaviorRef.current) {
      return;
    }
    if (hasInitializedViewportRef.current) {
      return;
    }
    if (nodes.length === 0) {
      return;
    }
    if (!containerRef.current) {
      return;
    }

    const parentNode = findParentNode(nodes);
    if (!parentNode) return;

    // 약간 지연 후 실행 (DOM 렌더링 대기)
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container || !svgRef.current || !zoomBehaviorRef.current) return;

      const centerX = container.clientWidth / 2;
      const centerY = container.clientHeight / 2;

      // 부모 노드의 실제 위치 사용 (어디에 있든 상관없이 화면 중앙에 배치)
      const parentX = parentNode.x;
      const parentY = parentNode.y;

      const svg = d3.select(svgRef.current);
      const zoom = zoomBehaviorRef.current;

      // 부모 노드가 화면 중앙에 오도록 transform 계산
      const initialTransform = d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(1)
        .translate(-parentX, -parentY);

      svg.call(zoom.transform, initialTransform);
      hasInitializedViewportRef.current = true;
    }, 150);

    return () => clearTimeout(timer);
  }, [d3Ready, nodes.length]);

  // 엣지 렌더링 - D3 렌더링 비활성화 (React 오버레이에서만 렌더링)
  // Edge는 React 오버레이(라인 600번대)에서 직선으로 렌더링됨

  // 노드 렌더링 - SVG 원 비활성화 (NodeOverlay만 사용)
  useEffect(() => {
    if (!svgRef.current || !d3Ready) return;

    // SVG 노드는 렌더링하지 않음 - NodeOverlay(HTML)만 사용
    // const svg = d3.select(svgRef.current);
    // const nodesGroup = svg.select<SVGGElement>("g.nodes");
    // const defs = svg.select<SVGDefsElement>("defs");

    // // 그라데이션 업데이트
    // clearAllGradients(defs);
    // createAllGradients(defs, nodes);

    // // 노드 그룹 데이터 바인딩
    // const nodeGroups = nodesGroup
    //   .selectAll<SVGGElement, NodeData>("g.node")
    //   .data(nodes, (d) => d.id);

    // // Enter
    // const nodeEnter = nodeGroups
    //   .enter()
    //   .append("g")
    //   .attr("class", "node")
    //   .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    // // 블러 배경 원
    // nodeEnter
    //   .append("circle")
    //   .attr("class", "blur-bg")
    //   .attr("r", NODE_RADIUS + 20)
    //   .attr("fill", (d) => getGradientUrl(d.id))
    //   .attr("opacity", 0.3)
    //   .style("filter", "blur(12px)");

    // // 메인 원
    // nodeEnter
    //   .append("circle")
    //   .attr("class", "main-circle")
    //   .attr("r", NODE_RADIUS)
    //   .attr("fill", (d) => getGradientUrl(d.id))
    //   .attr("stroke", "none")
    //   .style("filter", (d) => getShadowUrl(d.id))
    //   .style("cursor", mode === "edit" ? "move" : "pointer")
    //   .on("click", function (event, d) {
    //     event.stopPropagation();
    //     if (mode === "edit") {
    //       if (selectedNodeId === d.id) {
    //         onNodeUnselect();
    //       } else {
    //         onNodeSelect(d.id);
    //       }
    //     } else {
    //       // analyze mode
    //       onAnalyzeNodeToggle(d.id);
    //     }
    //   });

    // // Update
    // const nodeUpdate = nodeGroups.merge(nodeEnter);

    // nodeUpdate.attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    // nodeUpdate.select("circle.blur-bg").attr("fill", (d) => getGradientUrl(d.id));

    // nodeUpdate
    //   .select("circle.main-circle")
    //   .attr("fill", (d) => getGradientUrl(d.id))
    //   .style("filter", (d) => getShadowUrl(d.id))
    //   .style("cursor", mode === "edit" ? "move" : "pointer");

    // // Exit
    // nodeGroups.exit().remove();

    // // 드래그 동작 설정 (편집 모드에서만)
    // if (mode === "edit") {
    //   const drag = d3
    //     .drag<SVGGElement, NodeData>()
    //     .subject(function (event, d) {
    //       return d;
    //     })
    //     .on("start", function (event, d) {
    //       d3.select(this).raise();
    //     })
    //     .on("drag", function (event, d) {
    //       // 노드 위치 업데이트
    //       d.x = event.x;
    //       d.y = event.y;

    //       // 노드 그룹 이동
    //       d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);

    //       // 연결된 엣지 업데이트
    //       const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    //       svg
    //         .selectAll<SVGPathElement, typeof edges[0]>("path.edge")
    //         .attr("d", (edge) => {
    //           const source = nodeMap.get(edge.source);
    //           const target = nodeMap.get(edge.target);
    //           if (!source || !target) return "";
    //           return createBezierPath(source, target);
    //         });
    //     })
    //     .on("end", function (event, d) {
    //       // 드래그 완료 시 위치 저장
    //       if (onBatchNodePositionChange) {
    //         onBatchNodePositionChange([{ id: d.id, x: d.x, y: d.y }]);
    //       }
    //     });

    //   nodeUpdate.call(drag);
    // } else {
    //   // 분석 모드에서는 드래그 비활성화
    //   nodeUpdate.on(".drag", null);
    // }
  }, [
    d3Ready,
    nodes,
    mode,
    selectedNodeId,
    onNodeSelect,
    onNodeUnselect,
    onAnalyzeNodeToggle,
    onBatchNodePositionChange,
    edges,
  ]);

  // 배경 클릭 시 선택 해제 + 좌표 로그
  useEffect(() => {
    if (!svgRef.current || !d3Ready) return;

    const svg = d3.select(svgRef.current);

    const handleBackgroundClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // 노드를 클릭한 경우가 아니면 선택 해제
      if (!target.closest("[data-node-id]")) {
        // 스크린 좌표
        const rect = svgRef.current!.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        // 모델 좌표로 변환
        onNodeUnselect();
      }
    };

    svg.on("click", handleBackgroundClick);

    return () => {
      svg.on("click", null);
    };
  }, [d3Ready, onNodeUnselect]);

  // mousemove 이벤트 처리 (협업 커서용)
  useEffect(() => {
    if (!svgRef.current || !d3Ready) return;

    const svg = svgRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseMoveHandlersRef.current.size === 0) return;

      const rect = svg.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // 스크린 좌표를 모델 좌표로 변환
      const t = transformRef.current;
      const modelX = (screenX - t.x) / t.k;
      const modelY = (screenY - t.y) / t.k;

      // Cytoscape event 형식으로 변환
      const mockEvent = {
        position: { x: modelX, y: modelY },
        target: null,
        originalEvent: e,
      };

      // 모든 등록된 핸들러 호출
      mouseMoveHandlersRef.current.forEach((handler) => {
        handler(mockEvent);
      });
    };

    svg.addEventListener("mousemove", handleMouseMove);

    return () => {
      svg.removeEventListener("mousemove", handleMouseMove);
    };
  }, [d3Ready]);

  // 오버레이 렌더링용 뷰포트 좌표 계산
  const getNodeScreenPosition = useCallback(
    (node: NodeData) => {
      // x, y가 null이면 화면 밖으로 (또는 기본 위치)
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      return {
        x: x * transform.k + transform.x,
        y: y * transform.k + transform.y,
      };
    },
    [transform]
  );

  // 브라우저 줌 차단 (컨테이너 전체)
  useEffect(() => {
    if (!containerRef.current) return;

    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const container = containerRef.current;
    container.addEventListener("wheel", preventZoom, { passive: false });

    return () => {
      container.removeEventListener("wheel", preventZoom);
    };
  }, []);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      ref={containerRef}
    >
      {/* SVG 캔버스 - 배경색만 (엣지는 위에서 렌더링) */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: "#F9FAFB",
          touchAction: "none",
          cursor: "grab",
          zIndex: 0,
        }}
      />

      {/* 🔥 엣지 레이어 - NodeOverlay 뒤에 렌더링 (pointer-events none) */}
      {d3Ready && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
          >
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source);
              const target = nodes.find((n) => n.id === edge.target);

              if (
                !source ||
                !target ||
                source.x == null ||
                source.y == null ||
                target.x == null ||
                target.y == null
              ) {
                return null;
              }

              const path = createStraightPath(source, target);

              return (
                <path
                  key={edge.id}
                  d={path}
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                  opacity={0.6}
                />
              );
            })}
          </g>
        </svg>
      )}

      {/* HTML 오버레이 (노드 UI) - pointer-events는 none (자식에서 개별 설정) */}
      {d3Ready && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {nodes.map((node) => {
            const hasChildren = nodes.some((n) => n.parentId === node.id);
            const isSelected = selectedNodeId === node.id;
            const isAnalyzeSelected = analyzeSelection.includes(node.id);
            const screenPos = getNodeScreenPosition(node);

            return (
              <NodeOverlay
                key={node.id}
                node={node}
                x={screenPos.x}
                y={screenPos.y}
                zoom={transform.k}
                hasChildren={hasChildren}
                isSelected={isSelected}
                mode={mode}
                isAnalyzeSelected={isAnalyzeSelected}
                isReadOnly={isReadOnly}
                onSelect={() => {
                  if (mode === "analyze") {
                    // 분석 모드: onAnalyzeNodeToggle 호출
                    onAnalyzeNodeToggle(node.id);
                  } else {
                    // 편집 모드: 선택 토글
                    if (selectedNodeId === node.id) {
                      onNodeUnselect();
                    } else {
                      onNodeSelect(node.id);
                    }
                  }
                }}
                onDeselect={onNodeUnselect}
                onApplyTheme={onApplyTheme}
                onDeleteNode={onDeleteNode}
                onEditNode={onEditNode}
                onBatchNodePositionChange={onBatchNodePositionChange}
                onCreateChildNode={onCreateChildNode}
                detachedSelection={detachedSelectionMap?.[node.id]}
                onKeepChildrenDelete={onKeepChildrenDelete}
                onConnectDetachedSelection={onConnectDetachedSelection}
                onDismissDetachedSelection={onDismissDetachedSelection}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
