import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getData, postData, putData, deleteData } from '../../lib/axios';
import type { ParkingStatusType } from '../../shared/types/parkingStatus';
import type { ServiceType } from '../../shared/types/servieType';

/**
 * 도움 제안 생성 요청 타입 정의
 */
export interface CreateOfferHelpData {
  helpReqMemId: number;
  totalDisCount: number;
}

/**
 * 도움 제안 응답 타입 정의
 */
export interface OfferHelpResponse {
  id: number;
  helper: {
    id: number;
    name: string;
    email: string;
    slackId: string | null;
  };
  status: ParkingStatusType;
  helperServiceDate: string;
  discountTotalCount: number;
  discountApplyCount: number;
  helpOfferDetail: [
    {
      id: number;
      helpRequester: null;
      reqDetailStatus: ParkingStatusType;
      discountApplyDate: string;
      discountApplyType: string;
      requestDate: string;
    }
  ];
  slackThreadTs: string | null;
}

export interface UpdateOfferHelpData {
  status: ParkingStatusType;
  helpOfferDetail: {
    id: number;
    status: ParkingStatusType;
    reqMemberId: number;
    discountApplyDate: string;
    discountApplyType: ServiceType;
    requestDate: string;
  }[];
}

/**
 * 도움 제안 목록을 조회하는 훅
 */
export const useOfferHelp = () => {
  return useQuery({
    queryKey: ['offer-help'],
    queryFn: async (): Promise<OfferHelpResponse[]> => {
      return await getData<OfferHelpResponse[]>('/HelpOffer');
    },
    // staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    // gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 대기
  });
};

/**
 * 도움 제안을 생성하는 mutation 훅
 */
export const useCreateOfferHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferHelpData): Promise<OfferHelpResponse> =>
      postData<OfferHelpResponse>('/HelpOffer', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-help'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('도움 제안 생성 실패:', error);
    },
  });
};

/**
 * 도움 제안을 업데이트하는 mutation 훅
 */
export const useUpdateOfferHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOfferHelpData }) =>
      putData(`/HelpOffer/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-help'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('도움 요청 업데이트 실패:', error);
    },
  });
};

/**
 * 도움 제안 디테일을 삭제하는 mutation 훅
 */
export const useDeleteOfferHelp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (helpOfferDetailId: number) =>
      deleteData(`/HelpOffer/HelpOfferDetail/${helpOfferDetailId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-help'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('도움 제안 디테일 삭제 실패:', error);
    },
  });
};
