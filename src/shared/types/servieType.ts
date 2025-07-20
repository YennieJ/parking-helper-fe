/**
 * 할인 적용 타입
 */
export const Service = {
  CAFE: 'Cafe',
  RESTAURANT: 'Restaurant',
  NONE: 'None',
} as const;

export type ServiceType = (typeof Service)[keyof typeof Service];
