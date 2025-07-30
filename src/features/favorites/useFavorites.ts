import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getData, putData } from '../../lib/axios';

// 타입 정의
export interface FavoriteMember {
  favoriteMemberId: number;
  favoriteMemberName: string;
  carNumber: string;
}

export interface FavoriteMemberPutRequest {
  favoriteMemberIds: number[];
}

export interface FavoriteMemberPutResponse {
  result: string;
  message: string;
  addedCount: number;
  deletedCount: number;
  addedFavorites: {
    favoriteMemberId: number;
    favoriteMemberName: string;
    carNumber: string;
  }[];
}

// React Query 훅들
export const useFavoriteMembers = (memberId: number) => {
  return useQuery({
    queryKey: ['favoriteMembers', memberId],
    queryFn: () =>
      getData<FavoriteMember[]>(`/FavoriteMember?MemberId=${memberId}`),
    enabled: !!memberId, // memberId가 있을 때만 실행
    retry: (failureCount, error: any) => {
      // 404 에러는 재시도하지 않음
      if (error?.response?.status === 404) return false;
      // 다른 에러는 3번까지 재시도
      return failureCount < 3;
    },
  });
};

export const useUpdateFavoriteMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: number;
      data: FavoriteMemberPutRequest;
    }) =>
      putData<FavoriteMemberPutResponse>(`/FavoriteMember/${memberId}`, data),
    onSuccess: (_data, variables) => {
      // 성공 시 즐겨찾기 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['favoriteMembers', variables.memberId],
      });
    },
    onError: (error) => {
      console.error('즐겨찾기 업데이트 실패:', error);
    },
  });
};
