import { useRef, useState, useEffect, useReducer } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import type { Core, EventObject } from "cytoscape";
import { cn } from "@/lib/utils";
import type { CytoscapeCanvasProps } from "../types";
import { cytoscapeStylesheet, cytoscapeLayout, cytoscapeConfig } from "../styles/mindmapStyles";
import { useEdges, useGraphSync, useDragSync } from "../hooks/cytoscape/useGraphSync";
import { useCytoscapeEvents, useCytoscapeInit } from "../hooks/cytoscape/useCytoscapeEvents";
import { usePanLimit } from "../hooks/cytoscape/usePanLimit";
import OverlayLayer from "./OverlayLayer";

/**
 * Cytoscape 캔버스 크기를 제한하는 상수
 */

const PAN_LIMIT = 300;


/**
 * CytoscapeCanvas
 * - Cytoscape 그래프 렌더링 (투명 노드, 드래그/줌/팬 기능)
 * - HTML overlay로 노드 UI 렌더링
 */
export default function CytoscapeCanvas({
  nodes,
  className,
  mode,
  analyzeSelection,
  selectedNodeId,
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

  const cyRef = useRef<Core | null>(null);
  const [cyReady, setCyReady] = useState(false);       // cy 
  const [, forceOverlayUpdate] = useReducer((value: number) => value + 1, 0);   // pan/zoom 
  const initializingRef = useRef(false);              // 초기화 진행 중 플래그
  const hasInitialFocusedRef = useRef(false);         // 초기 포커스 완료 플래그

  // 엣지 계산
  const edges = useEdges(nodes);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyRef.current && !cyRef.current.destroyed()) {
        try {
          cyRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Cytoscape:", e);
        }
      }
      cyRef.current = null;
      setCyReady(false);
    };
  }, []);

  // cy가 준비된 이후에만 초기화/동기화/이벤트 등록
  useCytoscapeInit(cyRef.current, cytoscapeStylesheet, cytoscapeConfig, cyReady);
  useGraphSync(cyRef.current, nodes, edges, mode, cyReady);
  useDragSync(cyRef.current, forceOverlayUpdate, cyReady);
  usePanLimit(cyRef.current, PAN_LIMIT, cyReady);
  useCytoscapeEvents(cyRef.current, {
    onNodeSelect,
    onNodeUnselect,
    onBackgroundClick: onNodeUnselect,
    enableToggle: true,
    selectedNodeId,
  }, cyReady && mode === "edit");

  // 분석 모드 전용 노드 클릭 토글
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady || mode !== "analyze") return;

    const handleTap = (event: EventObject) => {
      if (event.target && typeof event.target.id === "function") {
        const nodeId = event.target.id();
        if (nodeId) {
          onAnalyzeNodeToggle(nodeId);
        }
      }
    };

    cy.on("tap", "node", handleTap);

    return () => {
      cy.off("tap", "node", handleTap);
    };
  }, [cyReady, mode, onAnalyzeNodeToggle]);

  // 모드 전환 시 Cytoscape 선택 상태 초기화 (React 상태와 동기화)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;

    // Cytoscape 내부 선택 상태를 모두 해제
    const selectedNodes = cy.nodes(":selected");
    if (selectedNodes.length > 0) {
      selectedNodes.unselect();
    }
  }, [cyReady, mode]);

  // 초기 로드 시 첫 노드에 포커스 및 즉시 렌더링 (한 번만 실행)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady || nodes.length === 0 || hasInitialFocusedRef.current) return;

    // useGraphSync가 노드를 추가한 후 실행되도록 약간 지연
    const timer = setTimeout(() => {
      // 첫 노드(가장 오래된 노드)에 포커스
      const firstNode = cy.getElementById(nodes[0].id);
      if (firstNode && !firstNode.empty()) {
        cy.center(firstNode);
        cy.zoom(1); // 적절한 줌 레벨 설정
        hasInitialFocusedRef.current = true;
      }

      // 즉시 오버레이 렌더링 트리거
      forceOverlayUpdate();
    }, 50);

    return () => clearTimeout(timer);
  }, [cyReady, nodes, forceOverlayUpdate]);

  // Ensure overlay re-renders right after nodes/edges update is applied to cy
  // This runs after useGraphSync's effect (same commit order), so cy has new elements
  useEffect(() => {
    if (!cyReady || !cyRef.current) return;
    const raf = requestAnimationFrame(() => {
      forceOverlayUpdate();
    });
    return () => cancelAnimationFrame(raf);
  }, [cyReady, nodes, edges, forceOverlayUpdate]);

  // Sync overlay when Cytoscape emits structural/data changes outside React render
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;

    let raf: number | null = null;
    const schedule: (event: EventObject) => void = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        forceOverlayUpdate();
        raf = null;
      });
    };

    const events = ["add", "remove", "data", "position"] as const;
    for (const evt of events) {
      cy.on(evt, schedule);
    }

    return () => {
      for (const evt of events) {
        cy.off(evt, schedule);
      }
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    };
  }, [cyReady, forceOverlayUpdate]);

  // 드래그 완료 시 위치 저장 (최적화: 드래그된 노드만 업데이트)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;

    const handleDragFree = (event: EventObject) => {
      // 드래그된 노드만 가져오기 (전체 노드 대신)
      if (event.target && typeof event.target.id === "function") {
        const draggedNode = event.target;
        const id = draggedNode.id();
        const pos = draggedNode.position();

        // 단일 노드만 업데이트 (성능 최적화)
        if (onBatchNodePositionChange) {
          onBatchNodePositionChange([{ id, x: pos.x, y: pos.y }]);
        }
      }

      // 오버레이 업데이트
      forceOverlayUpdate();
    };

    cy.on("dragfree", "node", handleDragFree);

    return () => {
      cy.off("dragfree", "node", handleDragFree);
    };
  }, [cyReady, onBatchNodePositionChange, forceOverlayUpdate]);

  // pan/zoom → rAF 스로틀로 오버레이 위치 갱신
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;
    let raf = 0;
    let lastUpdate = 0;
    const THROTTLE_MS = 16; // ~60fps 상한

    const ping = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const now = performance.now();
        if (now - lastUpdate < THROTTLE_MS) return;
        forceOverlayUpdate();
        lastUpdate = now;
      });
    };

    // render 이벤트 제거: 60+ 업데이트/초 → <10 업데이트/초로 성능 개선
    cy.on("pan zoom", ping);
    window.addEventListener("resize", ping);
    return () => {
      cy.off("pan zoom", ping);
      window.removeEventListener("resize", ping);
      cancelAnimationFrame(raf);
    };
  }, [cyReady, forceOverlayUpdate]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <CytoscapeComponent
        elements={[]} // diff는 훅에서
        stylesheet={cytoscapeStylesheet}
        layout={cytoscapeLayout}
        cy={(instance) => {
          // 중복 초기화 방지
          if (cyRef.current || initializingRef.current) return;
          initializingRef.current = true;

          cyRef.current = instance;

          // 최초 1회: 기본 제스처 온
          instance.userPanningEnabled(true);
          instance.userZoomingEnabled(true);
          instance.panningEnabled(true);
          instance.zoomingEnabled(true);
          instance.boxSelectionEnabled(false);

          // renderer 옵션 주입(react-cytoscapejs prop로 안 먹는 것들)
          try {
            // @ts-expect-error - Cytoscape 내부 API 접근
            const r = instance.renderer();
            // 휠 줌 민감도
            r.options.wheelSensitivity = cytoscapeConfig.wheelSensitivity ?? 0.2;
            // 뷰포트 최적화
            r.options.hideEdgesOnViewport = cytoscapeConfig.hideEdgesOnViewport ?? false;
            r.options.hideLabelsOnViewport = cytoscapeConfig.hideLabelsOnViewport ?? true;
            r.options.textureOnViewport = cytoscapeConfig.textureOnViewport ?? true;
            // 성능 관련 반영 후 스타일 업데이트
            instance.style().update();
          } catch (e) {
            console.error("Error setting up Cytoscape renderer:", e);
          }

          setCyReady(true); // 훅들 동작 시작
          initializingRef.current = false;

          // 부모 컴포넌트에 cy 인스턴스 전달
          if (onCyReady) {
            onCyReady(instance);
          }
        }}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0"
      />

      {/* HTML Overlay - OverlayLayer 컴포넌트로 통합 */}
      <OverlayLayer
        cy={cyReady ? cyRef.current : null}
        nodes={nodes}
        mode={mode}
        analyzeSelection={analyzeSelection}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        onNodeUnselect={onNodeUnselect}
        onApplyTheme={onApplyTheme}
        onDeleteNode={onDeleteNode}
        onEditNode={onEditNode}
        onCreateChildNode={onCreateChildNode}
        onBatchNodePositionChange={onBatchNodePositionChange}
        detachedSelectionMap={detachedSelectionMap}
        onKeepChildrenDelete={onKeepChildrenDelete}
        onConnectDetachedSelection={onConnectDetachedSelection}
        onDismissDetachedSelection={onDismissDetachedSelection}
      />
    </div>
  );
}
