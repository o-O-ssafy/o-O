import { fetchUserInfo, updateUserInfo } from "@/features/auth/api/authApi";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "@/features/auth/types/user";

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const getInitialState = (): UserState => {
  const userStr = localStorage.getItem("user");

  if (userStr) {
    try {
      return {
        user: JSON.parse(userStr),
        loading: false,
        error: null,
      };
    } catch {
      localStorage.removeItem("user");
    }
  }

  return {
    user: null,
    loading: false,
    error: null,
  };
};

/**
 * 유저 정보 조회 청크
 */
export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const user = await fetchUserInfo();
    return user;
  } catch (error: any) {
    console.error("유저 정보 조회 실패:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch user profile"
    );
  }
});

/**
 * 유저 정보 업데이트 비동기 청크
 * createAsync : 비동기 로직(API 요청) 처리할 때 쓰는 함수
 * - 액션 (pending, fulfilled, rejected) 자동 생성 !
 * - try-catch 깔끔하게 감싸고, rejectWithValue 로 에러 리턴 가능
 */
export const updateUserProfile = createAsyncThunk<
  User,
  { nickname: string; profileImage: string },
  { rejectValue: string }
>(
  "user/updateUserProfile", // 액션타입 prefix (ex. users/pending , users/fulfilled, users/rejected 로 자동 생성됨)
  async (
    userData, // 업데이트할 유저 정보
    { rejectWithValue } // 에러 발생 시 단순히 throw 하지 않고, payload 형태로 에러 메시지 보냄
  ) => {
    try {
      // 비동기 처리 부분
      const updatdeUser = await updateUserInfo(userData);
      return updatdeUser;
    } catch (error) {
      console.error("요청 중 예외 발생:", error); // 네트워크/코드 오류 확인
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

/**
 * updateUserProfile 비동기 청크를 Redux Toolkit slice 내부에서 상태(state)로 연결
 * 유저 정보 수정 요청의 상태 (로딩 중, 성공, 실패)를 자동으로 관리해줌 !
 */
const userSlice = createSlice({
  name: "user",
  initialState: getInitialState(),
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem("user");
    },
    setUserId: (state, action) => {
      if (state.user) {
        state.user.id = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // 기존 id 유지하면서 나머지 정보 갱신 (백엔드 /users 응답에 id가 없을 수 있음)
        const existingId = state.user?.id;
        state.user = {
          ...action.payload,
          id: action.payload.id ?? existingId,
        } as User;
        state.loading = false;
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user";
      })
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.loading = false;
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update user";
      });
  },
});

export const { clearUser, setUserId } = userSlice.actions;
export default userSlice.reducer;
