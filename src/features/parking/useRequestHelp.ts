import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getData, deleteData, putData, postData } from '../../lib/axios';

/**
 * 도움 요청 타입 정의
 */
export interface RequestHelp {
  id: number;
  reqDate: string;
  helpDate: string | null;
  helpRequester: {
    id: number;
    helpRequesterName: string;
  } | null;
  helper: {
    id: number;
    helperName: string;
  } | null;
  reqCar: any | null;
  status?: 'Waiting' | 'Check' | 'Completed';
}

/**
 * 도움 요청 업데이트 타입 정의
 */
export interface UpdateRequestHelpData {
  helperMemId?: number | null;
  status: 'Waiting' | 'Check' | 'Completed';
}

/**
 * 도움 요청 생성 타입 정의
 */
export interface CreateRequestHelpData {
  helpReqMemId: number;
  carId: number;
}

/**
 * 도움 요청 목록을 조회하는 훅
 * @param FromReqDate - 조회 시작 날짜 (선택사항)
 */
export const useRequestHelp = (FromReqDate?: string) => {
  return useQuery({
    queryKey: ['request-help', FromReqDate],
    queryFn: async (): Promise<RequestHelp[]> => {
      const params = FromReqDate ? { FromReqDate } : {};
      return await getData<RequestHelp[]>('/api/RequestHelp', params);
    },
    // staleTime: 30 * 1000, // 30초
    // refetchInterval: 10 * 1000, // 10초마다 자동 갱신
  });
};

/**
 * 도움 요청을 삭제하는 mutation 훅
 */
export const useDeleteRequestHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteData(`/api/RequestHelp/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
    },
    onError: (error) => {
      console.error('도움 요청 삭제 실패:', error);
    },
  });
};

/**
 * 도움 요청을 업데이트하는 mutation 훅
 */
export const useUpdateRequestHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRequestHelpData }) =>
      putData(`/api/RequestHelp/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
    },
    onError: (error) => {
      console.error('도움 요청 업데이트 실패:', error);
    },
  });
};

/**
 * 도움 요청을 생성하는 mutation 훅
 */
export const useCreateRequestHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestHelpData) =>
      postData('/api/RequestHelp', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
    },
    onError: (error) => {
      console.error('도움 요청 생성 실패:', error);
    },
  });
};
