import { useState, useMemo, useEffect } from 'react';
import { useRanking } from '../useRanking';
import CardContainer from '../../../shared/components/ui/CardContiner';

interface Props {
  onViewAll?: () => void;
}

export default function RankingBanner({ onViewAll }: Props) {
  const { data: rankings } = useRanking();

  // 배너 애니메이션용 상태
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // 배너 데이터 - 공동 등수 처리
  const bannerCards = useMemo(() => {
    if (!rankings || rankings.length === 0) return [];

    // 점수별로 실제 등수 계산
    const rankingsWithRank = rankings.map((ranking) => {
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
    });

    // 등수별로 그룹핑해서 공동 등수는 하나의 카드로 표시
    const rankGroups: { [rank: number]: typeof rankingsWithRank } = {};
    rankingsWithRank.forEach((ranking) => {
      if (!rankGroups[ranking.actualRank]) {
        rankGroups[ranking.actualRank] = [];
      }
      rankGroups[ranking.actualRank].push(ranking);
    });

    // 상위 3개 등수만 선택 (공동 등수 포함해서 최대 3개)
    const topRanks = Object.keys(rankGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(0, 3);

    // 3등까지만 보여주기 위해 필터링
    const filteredRanks = topRanks.filter((rank) => rank <= 3);

    return filteredRanks.map((rank) => {
      const group = rankGroups[rank];
      const isGroupTie = group.length > 1;

      return {
        id: `rank-${rank}`,
        title: isGroupTie ? `공동 ${rank}등` : `${rank}등`,
        name: isGroupTie
          ? group.map((r) => r.memberName).join(' & ') // 여러 이름 연결
          : group[0].memberName,
        count: group[0].totalHelpCount,
        bgColor:
          rank === 1
            ? 'from-yellow-100 to-yellow-200'
            : rank === 2
            ? 'from-gray-100 to-gray-200'
            : 'from-orange-100 to-orange-200',
        emoji: rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉',
      };
    });
  }, [rankings]);

  // 배너 자동 슬라이드 - 실제 다른 등수가 2개 이상일 때만 실행
  useEffect(() => {
    if (bannerCards.length <= 1) return;

    // 모든 카드가 같은 등수(공동)인지 확인
    const allSameRank = bannerCards.every(
      (card) => card.title === bannerCards[0].title
    );

    // 공동 등수만 있으면 슬라이드 안 함
    if (allSameRank) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerCards.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [bannerCards.length]);

  // 배너 인덱스 초기화 (데이터 변경 시)
  useEffect(() => {
    setCurrentBannerIndex(0);
  }, [bannerCards.length]);

  /**
   * 배너 렌더링 함수
   */
  const renderBanner = () => {
    // 데이터가 없는 경우
    if (bannerCards.length === 0) {
      return (
        <div className="h-20 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
          <div className="text-center">
            <span className="text-2xl mb-1 block">🏆</span>
            <span className="text-gray-500 text-sm">
              이달의 사원 데이터가 없습니다
            </span>
          </div>
        </div>
      );
    }

    // 1개만 있는 경우 - 정적 표시
    if (bannerCards.length === 1) {
      const banner = bannerCards[0];
      return (
        <div
          className={`h-20 bg-gradient-to-r ${banner.bgColor} border-2 border-yellow-300 p-4 rounded-lg flex items-center justify-between`}
        >
          <div className="flex items-center">
            <div className="text-3xl">{banner.emoji}</div>
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-800 leading-none">
                {banner.title}
              </span>
              <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
                {banner.name}
              </span>
            </div>
          </div>
          <div className="text-right flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-600 leading-none">
              {banner.count}
            </span>
            <span className="text-sm text-gray-600 leading-none">건</span>
          </div>
        </div>
      );
    }

    // 2개 이상인 경우 - 슬라이드 애니메이션
    return (
      <div className="relative h-20 rounded-lg overflow-hidden">
        {bannerCards.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 bg-gradient-to-r ${
              banner.bgColor
            } h-full flex items-center justify-between border-2 ${
              index === 0
                ? 'border-yellow-300'
                : index === 1
                ? 'border-gray-300'
                : 'border-orange-300'
            } p-4 rounded-lg transition-all duration-500 ease-in-out ${
              index === currentBannerIndex
                ? 'opacity-100 translate-y-0'
                : index ===
                  (currentBannerIndex - 1 + bannerCards.length) %
                    bannerCards.length
                ? 'opacity-0 -translate-y-full'
                : 'opacity-0 translate-y-full'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{banner.emoji}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-800 leading-none">
                  {banner.title}
                </span>
                <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
                  {banner.name}
                </span>
              </div>
            </div>
            <div className="text-right flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600 leading-none">
                {banner.count}
              </span>
              <span className="text-sm text-gray-600 leading-none">건</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CardContainer>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">🏆 이달의 사원</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            전체보기
          </button>
        )}
      </div>

      {renderBanner()}
    </CardContainer>
  );
}
