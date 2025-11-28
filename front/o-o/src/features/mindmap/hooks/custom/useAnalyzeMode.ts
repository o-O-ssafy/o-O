import { useState, useCallback, useMemo, useEffect } from "react";
import type { NodeData, MindmapMode } from "../../types";

/**
 * 분석 모드 상태 및 핸들러 관리 훅
 *
 * **주요 기능:**
 * - 분석 대상 노드 선택/해제 (토글)
 * - 선택 목록 초기화
 * - 분석 실행 (현재는 콘솔 로그, 추후 AI 분석 연동 가능)
 * - 특정 노드를 선택 목록에서 제거
 *
 * **자동 초기화:**
 * - 모드 변경 시 선택 목록 자동 클리어
 *
 * @param nodes - 전체 노드 배열
 * @param mode - 현재 마인드맵 모드
 * @returns 분석 모드 상태 및 핸들러 함수들
 */
export function useAnalyzeMode(nodes: NodeData[], mode: MindmapMode) {
  const [analyzeSelection, setAnalyzeSelection] = useState<string[]>([]);

  // Clear analyze selection when switching modes
  useEffect(() => {
    setAnalyzeSelection([]);
  }, [mode]);

  /**
   * 노드 선택/해제 토글
   */
  const handleAnalyzeNodeToggle = useCallback((nodeId: string) => {
    setAnalyzeSelection((prev) => {
      const newSelection = prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId];
      return newSelection;
    });
  }, []);

  /**
   * 선택 목록 전체 초기화
   */
  const handleAnalyzeClear = useCallback(() => {
    setAnalyzeSelection([]);
  }, []);

  /**
   * 분석 실행
   * - 현재는 콘솔 로그만 출력
   * - TODO: AI 분석 API 연동
   */
  const handleAnalyzeExecute = useCallback(() => {
    if (analyzeSelection.length === 0) return;
    console.log("Analyze nodes:", analyzeSelection);
    // TODO: Integrate with AI analysis service
  }, [analyzeSelection]);

  /**
   * 특정 노드를 선택 목록에서 제거
   */
  const handleAnalyzeRemoveNode = useCallback((nodeId: string) => {
    setAnalyzeSelection((prev) => prev.filter((id) => id !== nodeId));
  }, []);

  /**
   * 선택된 노드의 전체 데이터 (패널 표시용)
   * nodes 배열이 협업 시스템에서 자주 변경되므로, 선택된 노드만 추출하여 안정적인 참조 유지
   */
  const selectedAnalyzeNodes = useMemo(() => {
    // analyzeSelection의 순서를 유지하면서 노드 데이터를 가져옴
    // node.id (MongoDB ObjectId)를 키로 사용
    const nodeMapById = new Map(nodes.map((node) => [node.id, node]));

    console.log("[useAnalyzeMode] 🗺️ Total nodes:", nodes.length);
    console.log("[useAnalyzeMode] 🎯 Selection IDs:", analyzeSelection);
    console.log(
      "[useAnalyzeMode] 🔑 Node IDs in map:",
      Array.from(nodeMapById.keys()).slice(0, 5),
      "..."
    );

    const selectedNodes = analyzeSelection
      .map((id) => {
        const found = nodeMapById.get(id);
        if (!found) {
          console.warn("[useAnalyzeMode] ⚠️ Node NOT found for ID:", id);
        }
        return found;
      })
      .filter((node): node is NodeData => node !== undefined);

    console.log(
      "[useAnalyzeMode] ✅ Selected nodes:",
      selectedNodes.length,
      selectedNodes.map((n) => n.keyword)
    );

    return selectedNodes;
  }, [nodes, analyzeSelection]);

  return {
    analyzeSelection,
    selectedAnalyzeNodes,
    handleAnalyzeNodeToggle,
    handleAnalyzeClear,
    handleAnalyzeExecute,
    handleAnalyzeRemoveNode,
  };
}
