import { QueryClient } from "@tanstack/react-query";

// react-query의 전역 설정 파일
// 전체 앱에서 어떻게 동작할지 기본 옵션을 정하는 전역 설정 !!

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 fresh ( 데이터가 얼마동안 유효하다고 판단되는지 )
      gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 ( fresh가 만료되더라도 캐시에서 보관하는 시간 )
      retry: 1, // 싪패 시 재시도 횟수
      refetchOnWindowFocus: false, // 탭 전환 시 자동 refresh 끄기 ( 자동 새로고침 방지 설정 )
    },
    mutations: {
      retry: 0,
    },
  },
});
