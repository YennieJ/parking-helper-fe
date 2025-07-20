import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putData, deleteData } from '../../lib/axios';
import type { ServiceType } from '../../shared/types/servieType';
import type { ParkingStatusType } from '../../shared/types/parkingStatus';

/**
 * 도움 요청 상세 업데이트 타입 정의
 */
export interface UpdateRequestHelpDetailData {
  detailId: number;
  discountApplyType: ServiceType;
  reqDetailStatus: ParkingStatusType;
  helperMemId: number;
}

/**
 * 도움 요청 상세를 업데이트하는 mutation 훅
 */
export const useUpdateRequestHelpDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRequestHelpDetailData) => {
      const params = new URLSearchParams({
        DisCountApplyType: data.discountApplyType,
        ReqDetailStatus: data.reqDetailStatus,
        HelperMemId: data.helperMemId.toString(),
      });

      return putData(
        `/RequestHelp/ReqHelpDetail/${data.detailId}?${params.toString()}`
      );
    },
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('도움 요청 상세 업데이트 실패:', error);
    },
  });
};

/**
 * 도움 요청 상세를 삭제하는 mutation 훅
 */
export const useDeleteRequestHelpDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (detailId: number) => {
      return deleteData(`/RequestHelp/ReqHelpDetail/${detailId}`);
    },
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['request-help'] });
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('도움 요청 상세 삭제 실패:', error);
    },
  });
};
