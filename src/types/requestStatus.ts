// 도움 요청 상태
export const RequestStatus = {
  WAITING: 0, // 대기 중
  RESERVED: 1, // 도움 받는 중
  COMPLETED: 2, // 완료
} as const;

export type RequestStatusType =
  (typeof RequestStatus)[keyof typeof RequestStatus];

// 상태에 따른 텍스트 반환 함수
export const getRequestStatusText = (status: RequestStatusType): string => {
  switch (status) {
    case RequestStatus.WAITING:
      return '도움 기다리는 중';
    case RequestStatus.RESERVED:
      return '도움 받는 중';
    case RequestStatus.COMPLETED:
      return '완료';
    default:
      return '알 수 없음';
  }
};

// 상태에 따른 색상 반환 함수
export const getRequestStatusColor = (status: RequestStatusType): string => {
  switch (status) {
    case RequestStatus.WAITING:
      return 'bg-white text-yellow-600 border-yellow-300';
    case RequestStatus.RESERVED:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case RequestStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
