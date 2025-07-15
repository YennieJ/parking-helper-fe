import { useState } from 'react';
import { createMessage } from '../utils/messages';

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

export const useErrorHandler = () => {
  const [error, setError] = useState<string>('');

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

  const clearError = () => {
    setError('');
  };

  return {
    error,
    handleError,
    clearError,
  };
};
