import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getData, postData } from '../../lib/axios';
import type { ParkingStatusType } from '../../shared/types/parkingStatus';
import type { ServiceType } from '../../shared/types/servieType';

/**
 * 도움 요청 타입 정의
 */
export interface RequestHelp {
  id: number;
  reqDate: string;
  helpRequester: {
    id: number;
    helpRequesterName: string;
    requesterEmail: string;
    slackId: string;
    reqHelpCar: {
      id: number;
      carNumber: string;
    };
  };
  status: ParkingStatusType;
  updateSlackThreadTs: string | null;
  totalDisCount: number;
  applyDisCount: number;
  helpDetails: Array<{
    id: number;
    reqDetailStatus: ParkingStatusType;
    discountApplyType: ServiceType;
    discountApplyDate: string | null;
    insertDate: string;
    helper: {
      id: number;
      helperName: string;
    } | null;
    slackThreadTs: string | null;
  }>;
}

/**
 * 도움 요청 생성 타입 정의
 */
export interface CreateRequestHelpData {
  helpReqMemId: number;
  totalDisCount: number;
}

/**
 * 도움 요청 목록을 조회하는 훅
 */
export const useRequestHelp = () => {
  return useQuery({
    queryKey: ['request-help'],
    queryFn: async (): Promise<RequestHelp[]> => {
      return await getData<RequestHelp[]>('/RequestHelp');
    },
    // staleTime: 30 * 1000, // 30초
    // refetchInterval: 10 * 1000, // 10초마다 자동 갱신
  });
};

/**
 * 도움 요청을 생성하는 mutation 훅
 */
export const useCreateRequestHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestHelpData) => postData('/RequestHelp', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('도움 요청 생성 실패:', error);
    },
  });
};
