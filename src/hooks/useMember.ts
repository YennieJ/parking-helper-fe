import { useMutation } from '@tanstack/react-query';
import { postData } from '../lib/axios';

// API 응답 타입
export interface MemberResponse {
  Id: number;
  MemberLoginId: string;
  Password: string;
  MemberName: string;
  Email: string;
  CreateDate: string;
  Cars: any[];
  HelpRequests: any[];
  HelpOffers: any[];
  Result: string;
}

// 요청 타입
export interface MemberRequest {
  memberId: string;
}

// memberId로 사용자 정보 조회하는 커스텀 훅
export const useMember = () => {
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

// 사용 예시:
// const memberMutation = useMember();
// const result = await memberMutation.mutateAsync({ memberId: '0034' });
