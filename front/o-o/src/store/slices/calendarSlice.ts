import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mypageApi } from "@/features/mypage/api/mypageApi";
import type {
  ActiveDaysQueryParams,
  KeywordQueryParams,
} from "@/features/mypage/types/mypage";

// 초기 상태 타입 정의
interface CalendarState {
  activeDays: {
    dates: string[];
    isLoading: boolean;
    error: string | null;
  };
  keywords: {
    list: string[];
    isLoading: boolean;
    error: string | null;
  };
}

// 초기 상태
const initialState: CalendarState = {
  activeDays: {
    dates: [],
    isLoading: false,
    error: null,
  },
  keywords: {
    list: [],
    isLoading: false,
    error: null,
  },
};

// 월별 활성 날짜 조회
export const fetchActiveDays = createAsyncThunk(
  "calendar/fetchActiveDays",
  async (params: ActiveDaysQueryParams) => {
    return await mypageApi.getMyActivityMonthlyWorkspace(params);
  }
);

// 특정 날짜의 키워드 조회
export const fetchKeywords = createAsyncThunk(
  "calendar/fetchKeywords",
  async (params: KeywordQueryParams) => {
    return await mypageApi.getMyActivityDailyWorkspace(params);
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    // 필요시 키워드 초기화 등의 액션 추가 가능
    clearKeywords: (state) => {
      state.keywords.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 활성 날짜 조회
      .addCase(fetchActiveDays.pending, (state) => {
        state.activeDays.isLoading = true;
        state.activeDays.error = null;
      })
      .addCase(fetchActiveDays.fulfilled, (state, action) => {
        state.activeDays.dates = action.payload.dates;
        state.activeDays.isLoading = false;
        state.activeDays.error = null;
      })
      .addCase(fetchActiveDays.rejected, (state, action) => {
        state.activeDays.error =
          action.error.message || "활성 날짜를 불러오는데 실패했습니다";
        state.activeDays.isLoading = false;
      })

      // 키워드 조회
      .addCase(fetchKeywords.pending, (state) => {
        state.keywords.isLoading = true;
        state.keywords.error = null;
      })
      .addCase(fetchKeywords.fulfilled, (state, action) => {
        state.keywords.list = action.payload.keywords;
        state.keywords.isLoading = false;
        state.keywords.error = null;
      })
      .addCase(fetchKeywords.rejected, (state, action) => {
        state.keywords.error =
          action.error.message || "키워드를 불러오는데 실패했습니다";
        state.keywords.isLoading = false;
      });
  },
});

export const { clearKeywords } = calendarSlice.actions;
export default calendarSlice.reducer;
