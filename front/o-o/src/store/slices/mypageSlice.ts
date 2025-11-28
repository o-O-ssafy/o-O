import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mypageApi } from "@/features/mypage/api/mypageApi";
import type {
  WorkspaceQueryParams,
  Workspace,
} from "@/features/mypage/types/mypage";

// 초기 상태 타입 정의
interface MypageState {
  workspaces: Workspace[];
  hasNext: boolean;
  nextCursor: number;
  isLoading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: MypageState = {
  workspaces: [],
  hasNext: false,
  nextCursor: 0,
  isLoading: false,
  error: null,
};

// 워크스페이스 목록 조회
export const fetchWorkspaces = createAsyncThunk(
  "mypage/fetchWorkspaces",
  async (params: WorkspaceQueryParams) => {
    return await mypageApi.getMyWorkspace(params);
  }
);

// 더보기 (페이지네이션)
export const loadMoreWorkspaces = createAsyncThunk(
  "mypage/loadMoreWorkspaces",
  async (params: WorkspaceQueryParams) => {
    return await mypageApi.getMyWorkspace(params);
  }
);

const mypageSlice = createSlice({
  name: "mypage",
  initialState,
  reducers: {
    // 워크스페이스 삭제 (로컬 상태만 업데이트)
    removeWorkspace: (state, action: { payload: number }) => {
      state.workspaces = state.workspaces.filter(
        (workspace) => workspace.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWorkspaces - 새로 불러오기 (교체)
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload.workspaces; // 교체
        state.hasNext = action.payload.hasNext;
        state.nextCursor = action.payload.nextCursor;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.error =
          action.error.message || "워크스페이스를 불러오는데 실패했습니다";
        state.isLoading = false;
      })
      // loadMoreWorkspaces - 더보기 (추가)
      .addCase(loadMoreWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMoreWorkspaces.fulfilled, (state, action) => {
        state.workspaces = [...state.workspaces, ...action.payload.workspaces]; // 기존 + 새로운 것
        state.hasNext = action.payload.hasNext;
        state.nextCursor = action.payload.nextCursor;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loadMoreWorkspaces.rejected, (state, action) => {
        state.error = action.error.message || "더 불러오기에 실패했습니다";
        state.isLoading = false;
      });
  },
});

export const { removeWorkspace } = mypageSlice.actions;
export default mypageSlice.reducer;
