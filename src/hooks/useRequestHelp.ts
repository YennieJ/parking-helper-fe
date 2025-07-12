import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getData, deleteData } from '../lib/axios';

// 도움 요청 타입
export interface RequestHelp {
  id: number;
  helpReqMemId: number;
  reqCarId: number | null;
  status: number;
  helperMemId: number | null;
  carNumber: string;
  reqDate: string;
  helpDate: string | null;
  confirmDate: string | null;
  helpRequester: any | null;
  helper: any | null;
  reqCar: any | null;
}

// 도움 요청 목록 조회 훅
export const useRequestHelp = (FromReqDate?: string) => {
  return useQuery({
    queryKey: ['request-help', FromReqDate],
    queryFn: async (): Promise<RequestHelp[]> => {
      const params = FromReqDate ? { FromReqDate } : {};
      return await getData<RequestHelp[]>(
        '/api/ParkingHelper/RequestHelp',
        params
      );
    },
    // staleTime: 30 * 1000, // 30초
    // refetchInterval: 10 * 1000, // 10초마다 자동 갱신
  });
};

// 도움 요청 삭제 mutation 훅
export const useDeleteRequestHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deleteData(`/api/ParkingHelper/RequestHelp/${id}`),
    onSuccess: () => {
      // 삭제 성공 시 도움 요청 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
    },
    onError: (error) => {
      console.error('도움 요청 삭제 실패:', error);
    },
  });
};
