import { useState } from 'react';
import { createMessage } from '../utils/messages';

/**
 * 에러 정보 인터페이스
 */
export interface ErrorInfo {
  title: string;
  message: string;
  type:
    | 'network'
    | 'server'
    | 'notFound'
    | 'unauthorized'
    | 'forbidden'
    | 'badRequest'
    | 'internalServer'
    | 'serviceUnavailable'
    | 'timeout'
    | 'validation'
    | 'permission'
    | 'data'
    | 'general';
}

/**
 * 에러 처리를 위한 커스텀 훅
 * HTTP 상태 코드별로 적절한 에러 메시지를 생성하고 관리
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<string>('');

  /**
   * 에러를 처리하고 적절한 에러 정보를 반환
   * @param error - 처리할 에러 객체
   * @returns ErrorInfo - 에러 정보 객체
   */
  const handleError = (error: any): ErrorInfo => {
    const status = error?.response?.status;
    // 서버 에러 메시지는 사용하지 않고 우리가 정한 메시지만 사용
    const errorMessage = undefined;

    // HTTP 상태 코드별 에러 처리
    switch (status) {
      case 400:
        const badRequestError = createMessage.error.badRequest(errorMessage);
        setError(badRequestError.message);
        return {
          ...badRequestError,
          type: 'badRequest' as const,
        };

      case 401:
        const unauthorizedError =
          createMessage.error.unauthorized(errorMessage);
        setError(unauthorizedError.message);
        return {
          ...unauthorizedError,
          type: 'unauthorized' as const,
        };

      case 403:
        const forbiddenError = createMessage.error.forbidden(errorMessage);
        setError(forbiddenError.message);
        return {
          ...forbiddenError,
          type: 'forbidden' as const,
        };

      case 404:
        const notFoundError = createMessage.error.notFound(errorMessage);
        setError(notFoundError.message);
        return {
          ...notFoundError,
          type: 'notFound' as const,
        };

      case 500:
        const internalServerError =
          createMessage.error.internalServer(errorMessage);
        setError(internalServerError.message);
        return {
          ...internalServerError,
          type: 'internalServer' as const,
        };

      case 503:
        const serviceUnavailableError =
          createMessage.error.serviceUnavailable(errorMessage);
        setError(serviceUnavailableError.message);
        return {
          ...serviceUnavailableError,
          type: 'serviceUnavailable' as const,
        };

      default:
        // 네트워크 에러 또는 기타 에러
        if (!error?.response) {
          const networkError = createMessage.error.network(errorMessage);
          setError(networkError.message);
          return {
            ...networkError,
            type: 'network' as const,
          };
        } else {
          const generalError = createMessage.error.general(errorMessage);
          setError(generalError.message);
          return {
            ...generalError,
            type: 'general' as const,
          };
        }
    }
  };

  /**
   * 에러 상태를 초기화
   */
  const clearError = () => {
    setError('');
  };

  return {
    error,
    handleError,
    clearError,
  };
};
