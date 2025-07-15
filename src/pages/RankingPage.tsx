import React from 'react';
import Header from '../components/Header';
import { useRanking } from '../hooks/useRanking';

const RankingPage: React.FC = () => {
  const { data: rankings, isLoading, error } = useRanking();

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            데이터 로딩 실패
          </h2>
          <p className="text-gray-600 mb-4">
            서버와 연결할 수 없습니다.
            <br />
            새로고침 버튼을 눌러주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '👤';
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50">
      {/* 헤더 */}
      <Header
        title={`${getCurrentMonth()} 이달의 직원`}
        icon="🏆"
        subtitle="주차 도움을 가장 많이 완료한 직원들입니다"
      />

      <div className="p-4 space-y-4  md:max-w-[700px] mx-auto">
        {/* 데이터가 없는 경우 */}
        {!rankings || rankings.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-5">
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🌟</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                아직 랭킹 데이터가 없어요
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                이번 달에 주차 도움을 완료한 직원이 없습니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            {rankings?.map((ranking, index) => (
              <div
                key={ranking.id}
                className={`card border-2 ${getRankBg(index + 1)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getRankIcon(index + 1)}</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-800">
                          {index + 1}위
                        </span>
                        <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {ranking.memberName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {ranking.totalHelpCount}
                    </div>
                    <div className="text-sm text-gray-600">건 완료</div>
                  </div>
                </div>

                {/* 1위만 특별 효과 */}
                {ranking.id === 1 && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900">
                        🎉 이달의 최고 주차 도움 완료자 🎉
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* 격려 메시지 - 항상 표시 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="text-center">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              함께 만드는 더 나은 주차 환경
            </h3>
            <p className="text-sm text-blue-700">
              서로 도우며 더 편리한 주차 문화를 만들어가요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
