/**
 * 도움 요청 상태 정의
 * 주차 도움 요청의 현재 상태를 나타내는 상수들
 */
export const ParkingStatus = {
  WAITING: 'Waiting', // 대기 중
  REQUEST: 'Check', // 도움 받는 중
  COMPLETED: 'Completed', // 완료
} as const;

/**
 * 요청 상태 타입
 * RequestStatus 객체의 값들의 유니온 타입
 */
export type ParkingStatusType =
  (typeof ParkingStatus)[keyof typeof ParkingStatus];
