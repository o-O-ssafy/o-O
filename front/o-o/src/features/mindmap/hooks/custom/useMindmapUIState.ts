import { useState, useCallback, useEffect } from "react";
import type { MindmapMode } from "../../types";

/**
 * 마인드맵 UI 상태 관리 훅
 *
 * **주요 기능:**
 * - 편집/분석 모드 전환 관리
 * - 선택된 노드 ID 추적
 * - 음성 채팅 표시 상태 관리
 *
 * **모드 전환 부가 효과:**
 * - analyze 모드 진입 시 selectedNodeId 자동 초기화
 *
 * @returns UI 상태 및 setter 함수들
 */
export function useMindmapUIState() {
  const [mode, setMode] = useState<MindmapMode>("edit");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [voiceChatVisible, setVoiceChatVisible] = useState(false);

  // Auto-clear selectedNodeId when entering analyze mode
  useEffect(() => {
    if (mode === "analyze") {
      setSelectedNodeId(null);
    }
  }, [mode]);

  const handleModeChange = useCallback((nextMode: MindmapMode) => {
    setMode(nextMode);
  }, []);

  return {
    mode,
    selectedNodeId,
    voiceChatVisible,
    handleModeChange,
    setSelectedNodeId,
    setVoiceChatVisible,
  };
}
