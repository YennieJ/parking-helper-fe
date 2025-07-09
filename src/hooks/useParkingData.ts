// src/hooks/useParkingData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockParkingApi } from '../utils/mockData';
import { parkingApi } from '../api/parkingApi';
import { env } from '../config/env';
import { useToast } from '../components/Toast';
import { ERROR_CODES, ERROR_MESSAGES } from '../types/errors';
import type { ParkingApiError } from '../types/errors';

// 환경에 따라 API 클라이언트 선택
const apiClient = env.IS_DEVELOPMENT ? mockParkingApi : parkingApi;

// 에러 처리 헬퍼 함수
const getErrorMessage = (
  error: ParkingApiError
): { title: string; message: string } => {
  const errorCode = error.response?.data?.code;
  const errorMessage = error.response?.data?.message;

  if (errorCode && ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES]) {
    return {
      title: '작업 실패',
      message: ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES],
    };
  }

  // 네트워크 에러
  if (!error.response) {
    return {
      title: '연결 실패',
      message: '네트워크 연결을 확인해주세요.',
    };
  }

  // 기본 에러 메시지
  return {
    title: '오류 발생',
    message: errorMessage || '알 수 없는 오류가 발생했습니다.',
  };
};

// 도와주세요 요청들 가져오기
export const useHelpRequests = () => {
  return useQuery({
    queryKey: ['helpRequests'],
    queryFn: apiClient.getHelpRequests,
  });
};

// 도와줄수있어요 제안들 가져오기
export const useHelpOffers = () => {
  return useQuery({
    queryKey: ['helpOffers'],
    queryFn: apiClient.getHelpOffers,
  });
};

// 내 페이지 데이터 가져오기
export const useMyData = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: apiClient.getMyData,
  });
};

// 이달의 사원 데이터 가져오기
export const useEmployeeOfMonth = () => {
  return useQuery({
    queryKey: ['employeeOfMonth'],
    queryFn: apiClient.getEmployeeOfMonth,
  });
};

// 새 요청 등록
export const useCreateHelpRequest = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.createHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      showSuccess('요청 등록 완료', '주차 도움 요청이 등록되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 새 제안 등록
export const useCreateHelpOffer = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.createHelpOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      showSuccess('제안 등록 완료', '주차 도움 제안이 등록되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 예약하기
export const useReserveHelp = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showWarning } = useToast();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'request' | 'offer' }) =>
      apiClient.reserveHelp(id, type),
    onSuccess: (_, variables) => {
      // 해당 타입의 데이터만 새로고침
      if (variables.type === 'request') {
        queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      }
      showSuccess('예약 완료', '주차 도움이 예약되었습니다.');

      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    onError: (error: ParkingApiError, variables) => {
      const errorCode = error.response?.data?.code;

      // 특별 처리: 이미 예약된 경우
      if (errorCode === ERROR_CODES.ALREADY_RESERVED) {
        showWarning(
          '예약 실패',
          '이미 다른 사람이 예약했습니다. 새로고침 후 다시 시도해주세요.'
        );

        // 데이터 자동 새로고침
        if (variables.type === 'request') {
          queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
        } else {
          queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
        }
        return;
      }

      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 예약 취소하기
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'request' | 'offer' }) =>
      apiClient.cancelReservation(id, type),
    onSuccess: (_, variables) => {
      if (variables.type === 'request') {
        queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      }
      showSuccess('예약 취소 완료', '예약이 취소되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 완료하기
export const useCompleteHelp = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'request' | 'offer' }) =>
      apiClient.completeHelp(id, type),
    onSuccess: (_, variables) => {
      // 관련 데이터들 새로고침
      if (variables.type === 'request') {
        queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      }
      queryClient.invalidateQueries({ queryKey: ['myData'] });
      queryClient.invalidateQueries({ queryKey: ['employeeOfMonth'] });

      showSuccess(
        '완료 처리',
        '주차 도움이 완료되었습니다! 고생하셨습니다. 🎉'
      );

      // 성공 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 삭제하기
export const useDeleteHelp = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'request' | 'offer' }) =>
      apiClient.deleteHelp(id, type),
    onSuccess: (_, variables) => {
      if (variables.type === 'request') {
        queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      }
      showSuccess('삭제 완료', '게시물이 삭제되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 개인정보 수정
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.updateProfile,
    onSuccess: () => {
      // 관련 데이터들 새로고침
      queryClient.invalidateQueries({ queryKey: ['myData'] });
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      showSuccess('프로필 수정 완료', '개인정보가 업데이트되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 수동 새로고침 훅
export const useRefreshData = () => {
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();

  return async () => {
    try {
      // 모든 데이터 강제 새로고침
      await queryClient.invalidateQueries();
      showSuccess('새로고침 완료', '최신 데이터로 업데이트되었습니다.');
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };
};
