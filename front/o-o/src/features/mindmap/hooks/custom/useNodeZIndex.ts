import { useMemo } from 'react';
import type { FocusedButton } from './useNodeFocus';

type UseNodeZIndexParams = {
  focusedButton: FocusedButton;
  isSelected: boolean;
};

export const useNodeZIndex = ({ focusedButton, isSelected }: UseNodeZIndexParams) => {
  const zIndex = useMemo(() => {
    // - 추천 오버레이 활성화 + 선택됨: 600 (배경 500보다 위, 추천 노드들과 같은 레벨)
    // - 선택됨: 40
    // - 기본: 10
    if (focusedButton === "recommend" && isSelected) return 600;
    if (isSelected) return 40;
    return 10;
  }, [focusedButton, isSelected]);

  return zIndex;
};
