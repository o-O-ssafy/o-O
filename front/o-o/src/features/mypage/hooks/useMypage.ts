import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // Redux 타입 훅
import {
  fetchWorkspaces,
  loadMoreWorkspaces,
  removeWorkspace,
} from "@/store/slices/mypageSlice";
import type {
  ActiveDaysQueryParams,
  KeywordQueryParams,
  WorkspaceQueryParams,
} from "@/features/mypage/types/mypage";
import {
  DEFAULT_DATE_PARAMS,
  DEFAULT_MONTH_PARAMS,
  DEFAULT_WORKSPACE_PARAMS,
} from "@/features/mypage/types/mypage";
import { fetchActiveDays, fetchKeywords } from "@/store/slices/calendarSlice";

interface UseMypageReturn {
  // 워크스페이스 관련
  workspaces: any[];
  hasNext: boolean;
  nextCursor: number;
  isLoading: boolean;
  error: string | null;
  fetchWorkspacesList: (params?: WorkspaceQueryParams) => void;
  loadMore: () => void;
  deleteWorkspace: (workspaceId: number) => void;

  // 달력 활성 날짜 관련
  activeDates: string[];
  activeDaysLoading: boolean;
  activeDaysError: string | null;
  fetchActiveDaysList: (params?: ActiveDaysQueryParams) => void;

  // 달력 키워드 관련
  keywords: string[];
  keywordsLoading: boolean;
  keywordsError: string | null;
  fetchKeywordsList: (params?: KeywordQueryParams) => void;
}

export const useMypage = (): UseMypageReturn => {
  const dispatch = useAppDispatch();

  // Redux store에서 상태 가져오기
  const { workspaces, hasNext, nextCursor, isLoading, error } = useAppSelector(
    (state) => state.mypage
  );

  // 달력 상태
  const { activeDays, keywords } = useAppSelector((state) => state.calendar);

  // 워크스페이스 목록 조회
  const fetchWorkspacesList = useCallback(
    (params: WorkspaceQueryParams = DEFAULT_WORKSPACE_PARAMS) => {
      dispatch(fetchWorkspaces(params));
    },
    [dispatch]
  );

  // 페이지네이션 - 더보기
  const loadMore = useCallback(() => {
    if (!hasNext || isLoading) return;

    const nextParams: WorkspaceQueryParams = {
      category: DEFAULT_WORKSPACE_PARAMS.category,
      cursor: nextCursor,
    };

    dispatch(loadMoreWorkspaces(nextParams));
  }, [dispatch, hasNext, isLoading, nextCursor]);

  // 월별 활성 날짜 조회
  const fetchActiveDaysList = useCallback(
    (params: ActiveDaysQueryParams = DEFAULT_MONTH_PARAMS) => {
      const action = dispatch(fetchActiveDays(params));
      return action;
    },
    [dispatch]
  );

  // 특정 날짜의 키워드 조회
  const fetchKeywordsList = useCallback(
    (params: KeywordQueryParams = DEFAULT_DATE_PARAMS) => {
      dispatch(fetchKeywords(params));
    },
    [dispatch]
  );

  // 워크스페이스 삭제 (로컬 상태에서만 제거)
  const deleteWorkspace = useCallback(
    (workspaceId: number) => {
      dispatch(removeWorkspace(workspaceId));
    },
    [dispatch]
  );

  return {
    // 워크스페이스
    workspaces,
    hasNext,
    nextCursor,
    isLoading,
    error,
    fetchWorkspacesList,
    loadMore,
    deleteWorkspace,

    // 활성 날짜
    activeDates: activeDays?.dates || [],
    activeDaysLoading: activeDays.isLoading,
    activeDaysError: activeDays.error,
    fetchActiveDaysList,

    // 키워드
    keywords: keywords?.list || [],
    keywordsLoading: keywords.isLoading,
    keywordsError: keywords.error,
    fetchKeywordsList,
  };
};
