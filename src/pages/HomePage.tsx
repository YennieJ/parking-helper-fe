import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../shared/components/ui/Toast';
import Header from '../shared/components/layout/Header';
import AddRequestModal from '../features/request/components/AddRequestModal';
import RankingModal from '../features/ranking/components/RankingModal';
import AddOfferModal from '../features/offer/components/AddOfferModal';
import RankingBanner from '../features/ranking/components/RankingBanner';
import CardContainer from '../shared/components/ui/CardContiner';
import FavoriteCompleteModal from '../features/favorites/components/FavoriteCompleteModal';
import { UrgentTasksCard } from '../shared/components/ui/UrgentTasksCard';

/**
 * 홈페이지 컴포넌트
 */
const HomePage = () => {
  const { user } = useAuth();
  const { showError } = useToast();

  // 모달 상태
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showFavoriteCompleteModal, setShowFavoriteCompleteModal] =
    useState(false);

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

  // 즐겨찾기 도움 완료 모달 열기
  const handleFavoriteCompleteClick = () => {
    setShowFavoriteCompleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header title={getCurrentDateTime()} icon="📅" />

      <div className="px-4 py-4 md:max-w-[700px] mx-auto space-y-6">
        {/* 이달의 사원 배너 */}
        <RankingBanner onViewAll={() => setShowRankingModal(true)} />

        {/* 지금 처리할 일 */}
        <UrgentTasksCard user={user} />
        {/* 빠른 액션 */}
        <CardContainer>
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
          <div className="grid grid-cols-2 gap-4 mb-3">
            <button
              onClick={handleFavoriteCompleteClick}
              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-yellow-200"
            >
              <span className="text-xl">⭐</span>
              즐겨찾기 도움 완료
            </button>
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
          </div>
        </CardContainer>
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

      {showFavoriteCompleteModal && (
        <FavoriteCompleteModal
          onClose={() => setShowFavoriteCompleteModal(false)}
        />
      )}
    </div>
  );
};
export default HomePage;
