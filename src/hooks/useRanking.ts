import { useQuery } from '@tanstack/react-query';
import { getData } from '../lib/axios';

// Ranking 타입 정의
export interface RankingItem {
  id: number;
  totalHelpCount: number;
  memberName: string;
}

// Ranking 데이터 가져오기 훅
export const useRanking = () => {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: async (): Promise<RankingItem[]> => {
      return await getData<RankingItem[]>('/api/ranking');
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 대기
  });
};
