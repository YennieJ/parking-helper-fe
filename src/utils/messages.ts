// 카테고리별 메시지 관리
export const MESSAGES = {
  // 도움 요청 관련
  HELP_REQUEST: {
    ACCEPTED: '주차 도움이 수락되었습니다!',
    CREATED: '도움 요청이 등록되었습니다!',
    COMPLETED: '도움 요청이 완료되었습니다!',
    CANCELLED: '도움 요청 수락이 취소되었습니다!',
    DELETED: '도움 요청이 삭제되었습니다!',
    ACCEPT_FAILED: '도움 요청 수락에 실패했습니다.',
    CREATE_FAILED: '도움 요청 등록에 실패했습니다.',
    COMPLETE_FAILED: '도움 요청 완료 처리에 실패했습니다.',
    CANCEL_FAILED: '도움 요청 취소에 실패했습니다.',
    DELETE_FAILED: '도움 요청 삭제에 실패했습니다.',
    EMPTY_STATE: '등록된 도움 요청이 없습니다.',
    BUTTON_ACCEPT: '도움 요청 수락하기',
    BUTTON_CANCEL: '도움 수락 취소하기',
  },

  // 도움 제안 관련
  HELP_OFFER: {
    ACCEPTED: '도움 제안을 수락했습니다!',
    CONFIRMED: '도움 요청을 확인했습니다!',
    CREATED: '도움 제안이 등록되었습니다!',
    COMPLETED: '도움 제안이 완료되었습니다!',
    CANCELLED: '도움 제안 수락이 취소되었습니다!',
    DELETED: '도움 제안이 삭제되었습니다!',
    ACCEPT_FAILED: '도움 제안 수락에 실패했습니다.',
    CONFIRM_FAILED: '도움 요청 확인에 실패했습니다.',
    CREATE_FAILED: '도움 제안 등록에 실패했습니다.',
    COMPLETE_FAILED: '도움 제안 완료 처리에 실패했습니다.',
    CANCEL_FAILED: '도움 제안 취소에 실패했습니다.',
    DELETE_FAILED: '도움 제안 삭제에 실패했습니다.',
    EMPTY_STATE: '등록된 도움 제안이 없습니다.',
    PROVIDER_WILL_CONTACT: '제안자가 곧 연락드릴 예정입니다.',
    BUTTON_ACCEPT: '수락하기',
    BUTTON_CANCEL: '수락 취소',
  },

  // 차량번호/클립보드 관련
  CAR_NUMBER: {
    COPIED: '차량번호가 복사되었습니다!',
    COPY_FAILED: '차량번호 복사에 실패했습니다.',
    AUTO_COPY_FAILED: '(자동 복사 실패)',
    COPY_WITH_NUMBER: (carNumber: string) =>
      `차량번호 ${carNumber}가 클립보드에 복사되었습니다.`,
    SHOW_WITH_COPY_FAILED: (carNumber: string) =>
      `차량번호는 ${carNumber}입니다. (자동 복사 실패)`,
  },

  // 인증 관련
  AUTH: {
    LOGIN_SUCCESS: '로그인되었습니다!',
    LOGIN_FAILED: '로그인에 실패했습니다.',
    LOGOUT_SUCCESS: '로그아웃되었습니다!',
    INVALID_EMPLOYEE_NUMBER: '사원번호가 올바르지 않습니다.',
    EMPLOYEE_NUMBER_REQUIRED: '사원번호를 입력해주세요.',
    LOGIN_ERROR: '로그인 중 오류가 발생했습니다.',
  },

  // 네트워크/시스템 관련
  SYSTEM: {
    LOADING: '데이터를 불러오는 중...',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    SERVER_ERROR: '서버 오류가 발생했습니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
    DATA_LOAD_FAILED: '데이터 로딩에 실패했습니다.',
    CONNECTION_FAILED: '서버와 연결할 수 없습니다.',
    REFRESH_PROMPT: '새로고침 버튼을 눌러주세요.',
  },

  // 상태 관련
  STATUS: {
    WAITING: '도움 기다리는 중',
    HELPING: '도움 받은 중',
    OFFERING: '도움 제안 중',
    REQUESTED: '도움 요청 확인 중',
    IN_PROGRESS: '도움 진행 중',
    COMPLETED: '도움 완료',

    UNKNOWN: '알 수 없음',
  },
} as const;

// 메시지 생성 유틸리티 함수들
export const createMessage = {
  // 도움 요청 관련
  helpRequest: {
    accepted: (carNumber: string) => ({
      title: MESSAGES.HELP_REQUEST.ACCEPTED,
      message: MESSAGES.CAR_NUMBER.COPY_WITH_NUMBER(carNumber),
    }),

    acceptedCopyFailed: (carNumber: string) => ({
      title: MESSAGES.HELP_REQUEST.ACCEPTED,
      message: MESSAGES.CAR_NUMBER.SHOW_WITH_COPY_FAILED(carNumber),
    }),

    acceptFailed: (error?: string) => ({
      title: MESSAGES.HELP_REQUEST.ACCEPT_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),
  },

  // 도움 제안 관련
  helpOffer: {
    accepted: () => ({
      title: MESSAGES.HELP_OFFER.ACCEPTED,
      message: MESSAGES.HELP_OFFER.PROVIDER_WILL_CONTACT,
    }),

    confirmed: (carNumber: string) => ({
      title: MESSAGES.HELP_OFFER.CONFIRMED,
      message: MESSAGES.CAR_NUMBER.COPY_WITH_NUMBER(carNumber),
    }),

    confirmedCopyFailed: (carNumber: string) => ({
      title: MESSAGES.HELP_OFFER.CONFIRMED,
      message: MESSAGES.CAR_NUMBER.SHOW_WITH_COPY_FAILED(carNumber),
    }),

    acceptFailed: (error?: string) => ({
      title: MESSAGES.HELP_OFFER.ACCEPT_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),

    confirmFailed: (error?: string) => ({
      title: MESSAGES.HELP_OFFER.CONFIRM_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),
  },

  // 차량번호 관련
  carNumber: {
    copied: (carNumber: string) => ({
      title: MESSAGES.CAR_NUMBER.COPIED,
      message: carNumber,
    }),

    copyFailed: (error?: string) => ({
      title: MESSAGES.CAR_NUMBER.COPY_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),
  },

  // 공통 에러
  error: {
    create: (type: 'request' | 'offer', error?: string) => ({
      title:
        type === 'request'
          ? MESSAGES.HELP_REQUEST.CREATE_FAILED
          : MESSAGES.HELP_OFFER.CREATE_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),

    complete: (type: 'request' | 'offer', error?: string) => ({
      title:
        type === 'request'
          ? MESSAGES.HELP_REQUEST.COMPLETE_FAILED
          : MESSAGES.HELP_OFFER.COMPLETE_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),

    cancel: (type: 'request' | 'offer', error?: string) => ({
      title:
        type === 'request'
          ? MESSAGES.HELP_REQUEST.CANCEL_FAILED
          : MESSAGES.HELP_OFFER.CANCEL_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),

    delete: (type: 'request' | 'offer', error?: string) => ({
      title:
        type === 'request'
          ? MESSAGES.HELP_REQUEST.DELETE_FAILED
          : MESSAGES.HELP_OFFER.DELETE_FAILED,
      message: error || MESSAGES.SYSTEM.UNKNOWN_ERROR,
    }),
  },
};
