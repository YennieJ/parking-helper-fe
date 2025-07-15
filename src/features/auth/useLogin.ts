import { useMutation } from '@tanstack/react-query';
import { postData } from '../../lib/axios';

/**
 * API 응답 타입 - 회원 정보
 */
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

/**
 * 로그인 요청 타입
 */
export interface MemberRequest {
  memberLoginId: string;
}

/**
 * 로그인을 위한 커스텀 훅
 * 회원 정보 조회 및 로그인 처리를 담당
 * @param onSuccess - 로그인 성공 시 호출될 콜백 함수
 */
export const useLogin = (onSuccess?: (userData: any) => void) => {
  return useMutation({
    mutationFn: async (data: MemberRequest): Promise<MemberResponse> => {
      return await postData<MemberResponse>('/api/Login', data);
    },
    onSuccess: (data) => {
      // API 응답을 AuthContext 형식으로 변환
      const userData = {
        memberId: data.id,
        memberLoginId: data.memberLoginId,
        memberName: data.memberName,
        carId: data.cars?.[0]?.id || 0,
        carNumber: data.cars?.[0]?.carNumber || '',
        email: data.email,
      };

      // 콜백 함수 호출
      onSuccess?.(userData);
    },
    onError: (error) => {
      console.error('사용자 정보 조회 실패:', error);
    },
  });
};
