import { useMutation } from '@tanstack/react-query';
import { postData } from '../lib/axios';

// API 응답 타입
export interface MemberResponse {
  id: number;
  memberLoginId: string;
  memberName: string;
  email: string;
  createDate: string;
  cars: Array<{
    id: number;
    carNumber: string;
    memberId: number;
    createDate: string;
    updateDate: string;
  }>;
  helpRequests: any[];
  helpOffers: any[];
}

// 요청 타입
export interface MemberRequest {
  memberLoginId: string;
}

// 로그인 훅
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: MemberRequest): Promise<MemberResponse> => {
      return await postData<MemberResponse>('/api/Login', data);
    },
    onSuccess: (data) => {
      console.log('사용자 정보 조회 성공:', data);
    },
    onError: (error) => {
      console.error('사용자 정보 조회 실패:', error);
    },
  });
};
