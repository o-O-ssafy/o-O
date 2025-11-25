import { useCallback, useMemo } from "react";
import { COLOR_THEMES, type ColorThemeName } from "../styles/colorThemes";
import { mapWorkspaceThemeToColorTheme, type WorkspaceTheme } from "@/services/dto/workspace.dto";

/**
 * 마인드맵 노드 색상 관리 hook
 * - 워크스페이스 테마에서 랜덤 색상 선택 기능 제공
 * - 백엔드에서 받은 WorkspaceTheme을 ColorThemeName으로 변환
 * - 모든 노드 생성 시 일관된 색상 선택 로직 사용
 */
export function useColorTheme(workspaceTheme: WorkspaceTheme) {
  /**
   * 백엔드 테마를 프론트엔드 ColorThemeName으로 변환
   */
  const themeName = useMemo<ColorThemeName>(() => {
    return mapWorkspaceThemeToColorTheme(workspaceTheme) as ColorThemeName;
  }, [workspaceTheme]);

  /**
   * 현재 테마에서 랜덤 색상 선택
   */
  const getRandomThemeColor = useCallback(() => {
    const colors = COLOR_THEMES[themeName];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }, [themeName]);

  return {
    themeName,
    getRandomThemeColor,
  };
}
