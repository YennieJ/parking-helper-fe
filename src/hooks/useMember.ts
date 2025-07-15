import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

interface UpdateMemberData {
  carNumber: string;
}

interface UpdateMemberParams {
  id: string;
  data: UpdateMemberData;
}

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
