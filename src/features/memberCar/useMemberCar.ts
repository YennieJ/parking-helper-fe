import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postData } from '../../lib/axios';

interface CreateMemberCarData {
  memberId: number;
  carNumber: string;
}

/**
 * 차량이 없을 때 생성하는 쿼리
 */
export const useCreateCarNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberCarData) => postData('/MemberCar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => {
      console.error('도움 요청 생성 실패:', error);
    },
  });
};
