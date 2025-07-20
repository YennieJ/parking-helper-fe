import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRanking } from '../features/ranking/useRanking';
import { useMyInfo } from '../features/member/useMember';
import { useRequestHelp } from '../features/request/useRequestHelp';
import { useUpdateRequestHelpDetail } from '../features/requestDetail/useRequestHelpDetail';
import { useToast } from '../shared/components/ui/Toast';
import Header from '../shared/components/layout/Header';
import AddRequestModal from '../features/request/AddRequestModal';
import AddOfferModal from '../features/parking/AddOfferModal';
import RankingModal from '../features/ranking/RankingModal';
import { type ServiceType } from '../shared/types/servieType';
import { ParkingStatus } from '../shared/types/parkingStatus';
import { Service } from '../shared/types/servieType';
import { useUpdateOfferHelp } from '../features/offer/useOfferHelp';

// 태스크 타입 enum 정의
const TaskType = {
  ACCEPTED_REQUEST: 'accepted_request',
  APPROVED_OFFER: 'approved_offer',
} as const;

/**
 * 홈페이지 컴포넌트
 */
const HomePage = () => {
  const { user } = useAuth();
  const { data: rankings } = useRanking();
  const { data: myInfo } = useMyInfo();
  const { data: requestHelpData } = useRequestHelp();
  const updateRequestHelpDetail = useUpdateRequestHelpDetail();
  const updateOfferHelp = useUpdateOfferHelp();
  const { showError, showSuccess } = useToast();

  // 배너 애니메이션용 상태
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // 모달 상태
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);

  // 일괄 처리를 위한 상태
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  // 각 태스크의 선택된 할인 타입 상태 (기본값: 카페)
  const [selectedDiscountTypes, setSelectedDiscountTypes] = useState<{
    [key: string]: ServiceType;
  }>({});
  // 즐겨찾기 선택 상태
  // const [selectedFavorites, setSelectedFavorites] = useState<number[]>([]);

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

    // 상위 3개 등수만 선택
    const topRanks = Object.keys(rankGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(0, 3);

    return topRanks.map((rank) => {
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
  }, [bannerCards.length]); // bannerCards.length만 의존성으로 사용

  // 배너 인덱스 초기화 (데이터 변경 시)
  useEffect(() => {
    setCurrentBannerIndex(0);
  }, [bannerCards.length]); // bannerCards.length만 의존성으로 사용

  /**
   * 현재 날짜/시간을 한국 시간으로 포맷팅
   */
  const getCurrentDateTime = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'Asia/Seoul',
    };
    return `오늘 ${now.toLocaleDateString('ko-KR', options)}`;
  };

  // 도움 요청 모달 열기
  const handleRequestClick = () => {
    if (!user?.carNumber) {
      showError(
        '차량 정보 없음',
        '등록된 차량이 없습니다. 주차 등록 사이트에서 차량을 등록한 후 다시 시도해주세요.'
      );
      return;
    }
    setShowRequestModal(true);
  };

  // 도움 제안 모달 열기
  const handleOfferClick = () => {
    setShowOfferModal(true);
  };

  // 실제 데이터 사용 (myInfo가 배열로 오므로 첫 번째 요소 사용)
  const displayMyInfo = Array.isArray(myInfo) ? myInfo[0] : myInfo;

  // 1. 내가 수락한 다른 사람의 요청들 (내가 helper인 경우) - requestHelp에서 가져오기
  const myAcceptedTasks =
    requestHelpData?.flatMap((request) =>
      request.helpDetails
        .filter(
          (detail) =>
            detail.helper?.id === user?.memberId &&
            detail.reqDetailStatus === ParkingStatus.REQUEST
        )
        .map((detail) => ({
          ...request,
          detail,
          id: `request-${request.id}-${detail.id}`,
          type: TaskType.ACCEPTED_REQUEST,
          user: request.helpRequester.helpRequesterName,
          carNumber: request.helpRequester.reqHelpCar.carNumber,
          time: new Date(request.reqDate).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
    ) || [];

  // 2. 내가 승인해서 처리해야 할 제안들
  const myApprovedOffers =
    displayMyInfo?.helpOfferHistory?.flatMap((offer: any) =>
      offer.helpOfferDetail
        .filter(
          (detail: any) =>
            detail.helpRequester &&
            detail.reqDetailStatus === ParkingStatus.REQUEST
        )
        .map((detail: any) => ({
          id: `approved-${offer.id}-${detail.id}`,
          type: TaskType.APPROVED_OFFER,
          user: detail.helpRequester?.helpRequesterName,
          carNumber: detail.helpRequester?.reqHelpCar.carNumber,
          time: detail.discountApplyDate
            ? new Date(detail.discountApplyDate).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '시간 미확인',
          offerId: offer.id,
          detailId: detail.id,
        }))
    ) || [];

  // 모든 처리할 일을 하나로 합치기
  const urgentTasks = [...myAcceptedTasks, ...myApprovedOffers];

  // urgentTasks가 변경될 때 기본값 설정
  useEffect(() => {
    const newDefaultValues: { [key: string]: ServiceType } = {};
    urgentTasks.forEach((task) => {
      if (!selectedDiscountTypes[task.id]) {
        newDefaultValues[task.id] = Service.CAFE;
      }
    });

    if (Object.keys(newDefaultValues).length > 0) {
      setSelectedDiscountTypes((prev) => ({
        ...prev,
        ...newDefaultValues,
      }));
    }
  }, [urgentTasks]);

  // 일괄 처리 관련 함수들
  const acceptedRequests = urgentTasks.filter(
    (task) =>
      task.type === TaskType.ACCEPTED_REQUEST ||
      task.type === TaskType.APPROVED_OFFER
  );

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === acceptedRequests.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(acceptedRequests.map((task) => task.id));
    }
  };

  const handleBatchComplete = async () => {
    // 선택된 태스크들을 타입별로 분리
    const selectedRequestTasks = urgentTasks.filter(
      (task) =>
        selectedTasks.includes(task.id) &&
        task.type === TaskType.ACCEPTED_REQUEST
    );

    const selectedOfferTasks = urgentTasks.filter(
      (task) =>
        selectedTasks.includes(task.id) && task.type === TaskType.APPROVED_OFFER
    );

    const totalTasks = selectedRequestTasks.length + selectedOfferTasks.length;
    if (totalTasks === 0) return;

    try {
      // 모든 mutation을 Promise 배열로 생성
      const requestPromises = selectedRequestTasks.map((task) => {
        const getServiceType =
          selectedDiscountTypes[task.id] === Service.CAFE
            ? Service.CAFE
            : Service.RESTAURANT;

        return updateRequestHelpDetail.mutateAsync({
          detailId: task.detail.id,
          discountApplyType: getServiceType,
          reqDetailStatus: ParkingStatus.COMPLETED,
          helperMemId: user?.memberId || 0,
        });
      });

      const offerPromises = selectedOfferTasks.map((task) => {
        const getServiceType =
          selectedDiscountTypes[task.id] === Service.CAFE
            ? Service.CAFE
            : Service.RESTAURANT;

        return updateOfferHelp.mutateAsync({
          id: task.offerId,
          data: {
            status: ParkingStatus.COMPLETED,
            helpOfferDetail: [
              {
                id: task.detailId,
                status: ParkingStatus.COMPLETED,
                reqMemberId: user?.memberId || 0,
                discountApplyDate: new Date().toISOString(),
                discountApplyType: getServiceType,
                requestDate: new Date().toISOString(),
              },
            ],
          },
        });
      });

      // 모든 Promise를 병렬로 실행
      await Promise.all([...requestPromises, ...offerPromises]);

      // 성공 처리
      showSuccess(
        '일괄 완료 처리',
        `${totalTasks}개의 도움 요청이 성공적으로 처리되었습니다.`
      );
    } catch (error) {
      // 실패 처리
      showError(
        '일괄 완료 실패',
        '일부 도움 요청 처리 중 오류가 발생했습니다.'
      );
    } finally {
      // 선택 초기화
      setSelectedTasks([]);
    }
  };

  const handleBatchCancel = () => {
    // 제안이 포함된 태스크가 있는지 확인
    const hasOfferTasks = selectedTasks.some((taskId) => {
      const task = urgentTasks.find((t) => t.id === taskId);
      return task?.type === TaskType.APPROVED_OFFER;
    });

    if (hasOfferTasks) {
      showError('취소 불가', '나의 제안에 부탁한 요청은 취소할 수 없습니다');
      return;
    }

    // 선택된 태스크들을 찾아서 각각 API 호출
    const selectedTaskObjects = urgentTasks.filter(
      (task) =>
        selectedTasks.includes(task.id) &&
        task.type === TaskType.ACCEPTED_REQUEST
    );

    // 각 태스크에 대해 업데이트 API 호출 (수락 취소)
    selectedTaskObjects.forEach((task) => {
      updateRequestHelpDetail.mutate(
        {
          detailId: task.detail.id,
          discountApplyType: Service.NONE, // 기본값
          reqDetailStatus: ParkingStatus.WAITING, // 수락 취소 = 대기 상태로 변경
          helperMemId: 0, // 헬퍼 ID 제거
        },
        {
          onSuccess: () => {
            showSuccess(
              '일괄 수락 취소',
              `${selectedTaskObjects.length}개의 도움 요청 수락이 취소되었습니다.`
            );
          },
          onError: () => {
            showError(
              '수락 취소 실패',
              '일부 도움 요청 수락 취소 중 오류가 발생했습니다.'
            );
          },
        }
      );
    });

    // 선택 초기화
    setSelectedTasks([]);
  };

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
          <div className="flex items-center gap-4">
            <div className="text-3xl">{banner.emoji}</div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-800">
                  {banner.title}
                </span>
                <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {banner.name}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {banner.count}
            </div>
            <div className="text-sm text-gray-600">건 완료</div>
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
            <div className="flex items-center gap-4">
              <div className="text-3xl">{banner.emoji}</div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-800">
                    {banner.title}
                  </span>
                  <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {banner.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {banner.count}
              </div>
              <div className="text-sm text-gray-600">건 완료</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header title={getCurrentDateTime()} icon="📅" />

      <div className="px-4 py-4 md:max-w-[700px] mx-auto space-y-6">
        {/* 이달의 사원 배너 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                🏆 이달의 사원
              </h2>
              <button
                onClick={() => setShowRankingModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                전체보기
              </button>
            </div>

            {renderBanner()}
          </div>
        </div>

        {/* 지금 처리할 일 */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🔔 지금 처리할 일
            </h2>
          </div>
          {urgentTasks.length > 0 && (
            <div className="border border-gray-100 px-3 bg-gray-50 rounded-lg p-2 mb-2 flex items-center justify-between font-semibold text-base text-gray-500 ">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={
                    selectedTasks.length === urgentTasks.length &&
                    urgentTasks.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <span>전체 선택</span>
              </label>
              <span>
                {selectedTasks.length} / {urgentTasks.length} 선택됨
              </span>
            </div>
          )}

          <div className="space-y-3">
            {urgentTasks.map((task: any) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border-l-4 ${
                  task.type === TaskType.ACCEPTED_REQUEST
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-green-50 border-green-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {(task.type === TaskType.ACCEPTED_REQUEST ||
                      task.type === TaskType.APPROVED_OFFER) && (
                      <label className="flex items-center gap-2 cursor-pointer mt-1">
                        <input
                          id={`checkbox-${task.id}`}
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleTaskSelect(task.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    )}

                    <label htmlFor={`checkbox-${task.id}`} className="flex-1">
                      {/* 이름 */}
                      <div className="font-semibold text-gray-800 mb-1">
                        {task.user}님{' '}
                        <span className="text-sm text-gray-500">
                          {task.type === TaskType.ACCEPTED_REQUEST
                            ? '(내가 도와주기로 한 요청)'
                            : '(나의 제안에 부탁한 요청)'}
                        </span>
                      </div>

                      {/* 차량번호 */}
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-500 px-2 py-1 rounded-full flex items-center gap-1 text-white">
                          <span className="text-red-500">🚗</span>
                          <span className="text-sm font-semibold">
                            {task.carNumber}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* 오른쪽: 시간과 선택 */}
                  <div className="flex flex-col items-end gap-3">
                    {/* 시간 표시 */}
                    <div className="text-sm text-gray-500">{task.time}</div>

                    {/* 카페/식당 선택 버튼들 */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`bg-blue-500 px-3 py-1.5 font-semibold rounded-full flex items-center gap-1transition-colors ${
                          selectedDiscountTypes[task.id] === Service.CAFE
                            ? 'border border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedDiscountTypes((prev) => ({
                            ...prev,
                            [task.id]: Service.CAFE,
                          }));
                        }}
                      >
                        ☕ 카페
                      </button>
                      <button
                        type="button"
                        className={`bg-blue-500 px-3 py-1.5 font-semibold rounded-full flex items-center gap-1 transition-colors ${
                          selectedDiscountTypes[task.id] === Service.RESTAURANT
                            ? 'border border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedDiscountTypes((prev) => ({
                            ...prev,
                            [task.id]: Service.RESTAURANT,
                          }));
                        }}
                      >
                        🍽️ 식당
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {urgentTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">😌</div>
                <div>처리할 일이 없습니다</div>
              </div>
            )}

            {/* 하단 액션 버튼들 */}
            {urgentTasks.length > 0 && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleBatchCancel}
                  disabled={
                    selectedTasks.length === 0 ||
                    updateRequestHelpDetail.isPending || // 업데이트 API 호출 시 대기 상태
                    !selectedTasks.some((taskId) => {
                      const task = urgentTasks.find((t) => t.id === taskId);
                      return task?.type === TaskType.ACCEPTED_REQUEST;
                    })
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {updateRequestHelpDetail.isPending
                    ? '처리 중...'
                    : '선택된 요청 취소'}
                </button>
                <button
                  onClick={handleBatchComplete}
                  disabled={
                    selectedTasks.length === 0 ||
                    updateRequestHelpDetail.isPending ||
                    updateOfferHelp.isPending
                  }
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {updateRequestHelpDetail.isPending ||
                  updateOfferHelp.isPending
                    ? '처리 중...'
                    : '선택된 요청 처리'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            ⚡ 빠른 액션
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <button
              onClick={handleRequestClick}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-blue-200"
            >
              <span className="text-xl">🙏</span>
              도움 요청하기
            </button>
            <button
              onClick={handleOfferClick}
              className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-green-200"
            >
              <span className="text-xl">🤝</span>
              도움 제안하기
            </button>
          </div>

          {/* 주차 사이트 바로가기 */}
          <button
            onClick={() =>
              window.open(
                'http://gidc001.iptime.org:35052/nxpmsc/login',
                '_blank'
              )
            }
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-purple-200"
          >
            <span className="text-xl">🚗</span>
            주차 사이트 바로가기
          </button>

          {/* 즐겨찾기 원클릭 등록 */}
          {/* <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-gray-700 flex items-center gap-2">
                ⭐ 즐겨찾기 원클릭 등록
              </h3>
              {favoriteUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={
                        selectedFavorites.length === favoriteUsers.length &&
                        favoriteUsers.length > 0
                      }
                      onChange={() => {
                        if (selectedFavorites.length === favoriteUsers.length) {
                          setSelectedFavorites([]);
                        } else {
                          setSelectedFavorites(
                            favoriteUsers.map((fav) => fav.id)
                          );
                        }
                      }}
                    />
                    <span>전체 선택</span>
                  </label>
                  <span>
                    {selectedFavorites.length} / {favoriteUsers.length} 선택됨
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {favoriteUsers.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFavorites.includes(fav.id)}
                        onChange={() => {
                          setSelectedFavorites((prev) =>
                            prev.includes(fav.id)
                              ? prev.filter((id) => id !== fav.id)
                              : [...prev, fav.id]
                          );
                        }}
                        className="w-4 h-4 text-yellow-600 rounded"
                      />
                      <span className="text-lg">⭐</span>
                    </label>
                    <div>
                      <div className="font-medium text-gray-800">
                        {fav.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {fav.carNumber}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedFavorites.length > 0 && (
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <button
                  onClick={() => {
                    showSuccess(
                      '즐겨찾기 등록',
                      `${selectedFavorites.length}명의 즐겨찾기가 등록되었습니다.`
                    );
                    setSelectedFavorites([]);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  선택된 {selectedFavorites.length}명 원클릭 등록
                </button>
              </div>
            )}
          </div> */}
        </div>
      </div>

      {/* 모달들 */}
      {showRequestModal && (
        <AddRequestModal onClose={() => setShowRequestModal(false)} />
      )}

      {showOfferModal && (
        <AddOfferModal onClose={() => setShowOfferModal(false)} />
      )}

      {showRankingModal && (
        <RankingModal onClose={() => setShowRankingModal(false)} />
      )}
    </div>
  );
};
export default HomePage;
