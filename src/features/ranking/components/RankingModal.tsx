import React, { useEffect } from 'react';
import { useRanking } from '../useRanking';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  onClose: () => void;
}

const RankingModal: React.FC<Props> = ({ onClose }) => {
  const { data: rankings, isLoading } = useRanking();
  const queryClient = useQueryClient();

  // 모달이 열릴 때 랭킹 데이터 새로 불러오기
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['ranking'] });
  }, [queryClient]);

  // 랭킹 데이터 처리 (공동 등수 포함)
  const processedRankings = React.useMemo(() => {
    if (!rankings || rankings.length === 0) return [];

    return rankings
      .map((ranking) => {
        // 자신보다 높은 점수를 가진 사람 수 + 1 = 실제 등수
        const higherScoreCount = rankings.filter(
          (r) => r.totalHelpCount > ranking.totalHelpCount
        ).length;
        const actualRank = higherScoreCount + 1;

        // 같은 점수를 가진 사람이 있는지 확인
        const sameScoreCount = rankings.filter(
          (r) => r.totalHelpCount === ranking.totalHelpCount
        ).length;
        const hasTie = sameScoreCount > 1;

        return {
          ...ranking,
          actualRank,
          hasTie,
          displayRank: hasTie ? `공동 ${actualRank}등` : `${actualRank}등`,
        };
      })
      .sort((a, b) => a.actualRank - b.actualRank);
  }, [rankings]);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-900">이달의 사원</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-gray-500 text-lg">×</span>
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">랭킹을 불러오는 중...</p>
            </div>
          ) : processedRankings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🤷‍♂️</div>
              <p className="text-gray-500">랭킹 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {processedRankings.map((ranking, index) => (
                <div
                  key={ranking.id || index}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    ranking.actualRank <= 3
                      ? 'bg-gradient-to-r shadow-md' +
                        (ranking.actualRank === 1
                          ? ' from-yellow-50 to-yellow-100 border-yellow-200'
                          : ranking.actualRank === 2
                          ? ' from-gray-50 to-gray-100 border-gray-200'
                          : ' from-orange-50 to-orange-100 border-orange-200')
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-3">
                      {/* 등수 이모지 */}
                      <div className="text-2xl leading-none">
                        {getRankEmoji(ranking.actualRank)}
                      </div>
                      {/* 사용자 정보 */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-gray-900 text-base leading-none">
                          {ranking.memberName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRankBadgeColor(
                            ranking.actualRank
                          )}`}
                          style={{ verticalAlign: 'middle' }}
                        >
                          {ranking.displayRank}
                        </span>
                      </div>
                    </div>
                    {/* 점수 */}
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-600 leading-none">
                        {ranking.totalHelpCount}
                      </span>
                      <span className="text-xs text-gray-500 leading-none">
                        건
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-center text-sm text-gray-600">
            🎉 함께 만드는 따뜻한 주차 문화 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankingModal;
