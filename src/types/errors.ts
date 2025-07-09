// src/types/errors.ts
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ParkingApiError extends Error {
  response?: {
    status: number;
    data: {
      code: string;
      message: string;
      details?: any;
    };
  };
}

// 에러 코드 정의
export const ERROR_CODES = {
  // 예약 관련 에러
  ALREADY_RESERVED: 'ALREADY_RESERVED',
  CANNOT_RESERVE_OWN: 'CANNOT_RESERVE_OWN',
  CANNOT_DELETE_RESERVED: 'CANNOT_DELETE_RESERVED',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // 네트워크 에러
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // 서버 에러
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// 에러 메시지 정의
export const ERROR_MESSAGES = {
  [ERROR_CODES.ALREADY_RESERVED]: '이미 다른 사람이 예약했습니다.',
  [ERROR_CODES.CANNOT_RESERVE_OWN]: '본인이 등록한 것은 예약할 수 없습니다.',
  [ERROR_CODES.CANNOT_DELETE_RESERVED]: '예약된 제안은 삭제할 수 없습니다.',
  [ERROR_CODES.NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
  [ERROR_CODES.UNAUTHORIZED]: '권한이 없습니다.',
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
  [ERROR_CODES.TIMEOUT]: '요청 시간이 초과되었습니다.',
  [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다.',
} as const;
