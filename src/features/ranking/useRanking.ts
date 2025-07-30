import { useQuery } from '@tanstack/react-query';
import { getData } from '../../lib/axios';

/**
 * 랭킹 아이템 인터페이스
 */
export interface RankingItem {
  id: number;
  totalHelpCount: number;
  memberName: string;
}

/**
 * 랭킹 데이터를 가져오는 커스텀 훅
 * 이달의 사원 랭킹 정보를 조회하고 캐싱
 */
export const useRanking = () => {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: async (): Promise<RankingItem[]> => {
      return await getData<RankingItem[]>('/ranking');
    },
    // staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    // gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 대기
  });
};
