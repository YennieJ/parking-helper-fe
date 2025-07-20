import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getData } from '../../lib/axios';
import apiClient from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 회원 상세 정보 응답 타입
 */
export interface MemberDetail {
  id: number;
  memberLoginId: string;
  name: string;
  email: string;
  slackId: string | null;
  cars: Array<{
    id: number;
    memberId: number;
    carNumber: string;
  }>;
  requestHelpHistory: Array<{
    id: number;
    reqDate: string;
    helpRequester: {
      id: number;
      helpRequesterName: string;
      requesterEmail: string;
      slackId: string | null;
      reqHelpCar: {
        id: number;
        carNumber: string;
      };
    };
    status: string;
    updateSlackThreadTs: string | null;
    totalDisCount: number;
    applyDisCount: number;
    helpDetails: Array<{
      id: number;
      reqDetailStatus: string;
      discountApplyType: string;
      discountApplyDate: string | null;
      insertDate: string;
      helper: {
        id: number;
        name: string;
        email: string;
        slackId: string | null;
      } | null;
      slackThreadTs: string | null;
    }>;
  }>;
  helpOfferHistory: Array<{
    id: number;
    helper: {
      id: number;
      name: string;
      email: string;
      slackId: string | null;
    };
    status: string;
    helperServiceDate: string | null;
    discountTotalCount: number;
    discountApplyCount: number;
    helpOfferDetail: Array<{
      id: number;
      helpRequester: {
        id: number;
        helpRequesterName: string;
        requesterEmail: string;
        slackId: string | null;
        reqHelpCar: {
          id: number;
          carNumber: string;
        };
      } | null;
      reqDetailStatus: string;
      discountApplyDate: string | null;
      discountApplyType: string;
      requestDate: string | null;
    }>;
    slackThreadTs: string | null;
  }>;
}

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
 * 회원 목록 조회 파라미터 인터페이스
 */
interface MemberQueryParams {
  memberLoginId?: string;
  memberName?: string;
  carNumber?: string;
  Status?: string;
}

/**
 * 회원 목록을 조회하는 커스텀 훅
 * 4개 파라미터로 필터링하여 회원 정보를 가져옴
 * @param params - 조회 파라미터 객체
 */
export const useMembers = (params?: MemberQueryParams) => {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async (): Promise<MemberDetail[]> => {
      return await getData<MemberDetail[]>('/Member/Members', params);
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 대기
  });
};

/**
 * 특정 회원의 상세 정보를 조회하는 커스텀 훅
 * 요청/제안 히스토리를 포함한 전체 회원 정보를 가져옴
 * @param memberId - 조회할 회원 ID
 */
export const useMember = (memberId: number | string) => {
  return useQuery({
    queryKey: ['member', memberId],
    queryFn: async (): Promise<MemberDetail> => {
      return await getData<MemberDetail>(`/Member/${memberId}`);
    },
    enabled: !!memberId, // memberId가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 대기
  });
};

/**
 * 내 정보를 조회하는 커스텀 훅 (편의성 제공)
 * 내 사원번호로 조회하여 상세 정보를 가져옴
 */
export const useMyInfo = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-info', user?.memberLoginId],
    queryFn: async (): Promise<MemberDetail | null> => {
      if (!user?.memberLoginId) return null;

      const members = await getData<MemberDetail[]>('/Member/Members', {
        memberLoginId: user.memberLoginId,
      });

      return members.length > 0 ? members[0] : null;
    },
    enabled: !!user?.memberLoginId, // 사원번호가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 대기
  });
};

/**
 * 회원 정보 업데이트를 위한 커스텀 훅
 * 차량 번호 변경 시 API 호출과 AuthContext 업데이트를 처리
 */
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateMemberParams) => {
      const response = await apiClient.put(`/Member/${id}`, data);
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
