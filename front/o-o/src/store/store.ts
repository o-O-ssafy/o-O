import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import mypageReducer from "./slices/mypageSlice";
import calendarReducer from "./slices/calendarSlice";
import trendReducer from "./slices/trendSlice";
import trendPathReducer from "./slices/trendPathSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    mypage: mypageReducer,
    calendar: calendarReducer,
    trend: trendReducer,
    trendPath: trendPathReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
