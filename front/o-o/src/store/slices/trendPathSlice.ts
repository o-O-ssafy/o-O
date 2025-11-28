import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface TrendPathState {
  visitPath: string[];
}

const STORAGE_KEY = "trendVisitPath";

// localStorage에서 초기값 읽기
const loadInitialPath = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("❌ localStorage에서 경로 읽기 실패:", error);
    return [];
  }
};

const initialState: TrendPathState = {
  visitPath: loadInitialPath(),
};

const trendPathSlice = createSlice({
  name: "trendPath",
  initialState,
  reducers: {
    // 새 키워드 추가
    addToPath: (state, action: PayloadAction<string>) => {
      const keyword = action.payload;
      // 이미 존재하는 키워드면 그 이후 경로 제거 (역사 추적)
      const existingIndex = state.visitPath.indexOf(keyword);
      if (existingIndex == -1) {
        state.visitPath.push(keyword);
      } else {
        state.visitPath = state.visitPath.slice(0, existingIndex + 1);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.visitPath));
    },
    // 전체 경로 설정
    setPath: (state, action: PayloadAction<string[]>) => {
      state.visitPath = action.payload;
    },
    // 경로 초기화
    resetPath: (state) => {
      state.visitPath = [];
      localStorage.removeItem(STORAGE_KEY);
    },
    // 부모 노드만 남기고 나머지 삭제
    resetPathExceptParent: (state, action: PayloadAction<string>) => {
      state.visitPath = [action.payload];
    },
  },
});

export const { addToPath, setPath, resetPath, resetPathExceptParent } =
  trendPathSlice.actions;
export default trendPathSlice.reducer;
