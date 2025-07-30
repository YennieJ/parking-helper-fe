import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 클라이언트 설정
 * 전역 쿼리 설정과 캐싱 정책을 관리
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분간 신선한 데이터로 취급
      refetchOnWindowFocus: false, // 창 포커스 시 자동 갱신 안 함
      refetchInterval: false, // 자동 갱신 안 함
      retry: (failureCount, error: any) => {
        // 404 에러는 재시도하지 않음 (즐겨찾기 등에서 정상적인 상황)
        if (error?.response?.status === 404) {
          return false;
        }
        // 다른 에러는 2번까지 재시도
        return failureCount < 2;
      },
    },
  },
});
