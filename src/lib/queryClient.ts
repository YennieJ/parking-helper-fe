import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분간 신선한 데이터로 취급
      refetchOnWindowFocus: false, // 창 포커스 시 자동 갱신 안 함
      refetchInterval: false, // 자동 갱신 안 함
      retry: 2, // 실패 시 2번만 재시도
    },
  },
});
