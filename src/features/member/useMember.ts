import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 회원 정보 업데이트 데이터 인터페이스
 */
interface UpdateMemberData {
  carNumber: string;
}

/**
 * 회원 정보 업데이트 파라미터 인터페이스
 */
interface UpdateMemberParams {
  id: string;
  data: UpdateMemberData;
}

/**
 * 회원 정보 업데이트를 위한 커스텀 훅
 * 차량 번호 변경 시 API 호출과 AuthContext 업데이트를 처리
 */
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateMemberParams) => {
      const response = await apiClient.put(`/api/Member/${id}`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['members'] });

      // AuthContext의 차량 번호 업데이트
      updateUser({
        carNumber: variables.data.carNumber,
      });
    },
    onError: (error) => {
      console.error('회원 정보 업데이트 실패:', error);
    },
  });
};
