/**
 * 주차 데이터 관련 커스텀 훅들
 * 주차 도움 요청/제안의 CRUD 작업을 처리하는 훅들을 모아둔 파일
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockParkingApi } from '../../shared/utils/mockData';
import { parkingApi } from './parkingApi';
import { env } from '../../config/env';
import { useToast } from '../../shared/components/ui/Toast';
import { ERROR_CODES, ERROR_MESSAGES } from '../../shared/types/errors';
import { createMessage } from '../../shared/utils/messages';
import type { ParkingApiError } from '../../shared/types/errors';

/**
 * 환경에 따라 API 클라이언트 선택
 * 개발 환경에서는 목 데이터, 프로덕션에서는 실제 API 사용
 */
const apiClient = env.IS_DEVELOPMENT ? mockParkingApi : parkingApi;

/**
 * 에러 처리 헬퍼 함수
 * API 에러를 사용자 친화적인 메시지로 변환
 * @param error - API 에러 객체
 * @returns 에러 제목과 메시지
 */
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

/**
 * 차량번호 복사 유틸리티 함수
 * 클립보드 API를 사용하여 차량번호를 복사
 * @param carNumber - 복사할 차량번호
 * @returns 복사 성공 여부
 */
const copyCarNumber = async (carNumber: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(carNumber);
    return true;
  } catch (error) {
    // 클립보드 API가 지원되지 않는 경우 fallback
    try {
      const textArea = document.createElement('textarea');
      textArea.value = carNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
};

/**
 * 도움 요청 목록을 가져오는 훅
 */
export const useHelpRequests = () => {
  return useQuery({
    queryKey: ['helpRequests'],
    queryFn: apiClient.getHelpRequests,
  });
};

/**
 * 도움 제안 목록을 가져오는 훅
 */
export const useHelpOffers = () => {
  return useQuery({
    queryKey: ['helpOffers'],
    queryFn: apiClient.getHelpOffers,
  });
};

/**
 * 내 페이지 데이터를 가져오는 훅
 */
export const useMyData = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: apiClient.getMyData,
  });
};

/**
 * 이달의 사원 데이터를 가져오는 훅
 */
export const useEmployeeOfMonth = () => {
  return useQuery({
    queryKey: ['employeeOfMonth'],
    queryFn: apiClient.getEmployeeOfMonth,
  });
};

/**
 * 새 도움 요청을 등록하는 훅
 */
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

/**
 * 새 도움 제안을 등록하는 훅
 */
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

// 도움 요청하기 수락 (기존 로직)
export const useReserveHelp = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showWarning } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      requestData,
    }: {
      id: string;
      requestData?: { carNumber?: string; userName?: string };
    }) => {
      const result = await apiClient.reserveHelp(id);

      // 차량번호가 있으면 복사 시도
      if (requestData?.carNumber) {
        const copySuccess = await copyCarNumber(requestData.carNumber);
        return {
          result,
          copySuccess,
          carNumber: requestData.carNumber,
        };
      }

      return {
        result,
        copySuccess: false,
        carNumber: undefined,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });

      // 메시지 처리
      if (data.carNumber) {
        if (data.copySuccess) {
          const successMessage = createMessage.helpRequest.accepted(
            data.carNumber
          );
          showSuccess(successMessage.title, successMessage.message);
        } else {
          const failMessage = createMessage.helpRequest.acceptedCopyFailed(
            data.carNumber
          );
          showSuccess(failMessage.title, failMessage.message);
        }
      } else {
        showSuccess('수락 완료', '주차 도움이 수락되었습니다.');
      }

      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    onError: (error: ParkingApiError) => {
      const errorCode = error.response?.data?.code;

      // 특별 처리: 이미 예약된 경우
      if (errorCode === ERROR_CODES.ALREADY_RESERVED) {
        showWarning(
          '예약 실패',
          '이미 다른 사람이 예약했습니다. 새로고침 후 다시 시도해주세요.'
        );
        queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
        return;
      }

      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 도움 제안에 요청하기
export const useRequestHelp = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.requestHelp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      showSuccess('요청 완료', '도움을 요청했습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 도움 요청 확인하기
export const useConfirmHelp = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      offerData,
    }: {
      id: string;
      offerData?: { carNumber?: string; userName?: string };
    }) => {
      const result = await apiClient.confirmHelp(id);

      // 차량번호가 있으면 복사 시도
      if (offerData?.carNumber) {
        const copySuccess = await copyCarNumber(offerData.carNumber);
        return {
          result,
          copySuccess,
          carNumber: offerData.carNumber,
        };
      }

      return {
        result,
        copySuccess: false,
        carNumber: undefined,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });

      if (data.carNumber) {
        if (data.copySuccess) {
          const message = createMessage.helpOffer.confirmed(data.carNumber);
          showSuccess(message.title, message.message);
        } else {
          const message = createMessage.helpOffer.confirmedCopyFailed(
            data.carNumber
          );
          showSuccess(message.title, message.message);
        }
      } else {
        showSuccess('확인 완료', '도움 요청을 확인했습니다.');
      }

      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 도움 요청 취소하기
export const useCancelHelpRequest = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.cancelHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      showSuccess('취소 완료', '도움 요청을 취소했습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 도움 요청하기 수락 취소 (기존 로직)
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      showSuccess('예약 취소 완료', '예약이 취소되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

// 완료하기 (분리)
export const useCompleteHelpRequest = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.completeHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myData'] });
      queryClient.invalidateQueries({ queryKey: ['employeeOfMonth'] });

      showSuccess('완료 처리', '주차 도움이 완료되었습니다! 감사합니다. 🎉');

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

export const useCompleteHelpOffer = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.completeHelpOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myData'] });
      queryClient.invalidateQueries({ queryKey: ['employeeOfMonth'] });

      showSuccess('완료 처리', '주차 도움이 완료되었습니다! 감사합니다. 🎉');

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

// 삭제하기 (분리)
export const useDeleteHelpRequest = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.deleteHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpRequests'] });
      showSuccess('삭제 완료', '게시물이 삭제되었습니다.');
    },
    onError: (error: ParkingApiError) => {
      const { title, message } = getErrorMessage(error);
      showError(title, message);
    },
  });
};

export const useDeleteHelpOffer = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: apiClient.deleteHelpOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpOffers'] });
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
