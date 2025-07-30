import { useAuth } from '../contexts/AuthContext';

import { useState } from 'react';
import HelpOfferCard from '../features/offer/components/HelpOfferCard';
import AddOfferModal from '../features/offer/components/AddOfferModal';
import Header from '../shared/components/layout/Header';
import { useOfferHelp } from '../features/offer/useOfferHelp';
import CardContainer from '../shared/components/ui/CardContiner';

const OfferPage = ({}) => {
  const { data: helpOffers, isLoading, error } = useOfferHelp();
  const [showOfferModal, setShowOfferModal] = useState(false);

  const { user } = useAuth();

  // 도움 제안 추가 모달 열기
  const handleAddOffer = () => {
    setShowOfferModal(true);
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          데이터 로딩 실패
        </h2>
        <p className="text-gray-600 mb-4">서버와 연결할 수 없습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="도움을 주시겠어요?"
        icon="🤝"
        rightAction={{
          icon: '도움 제안',
          onClick: handleAddOffer,
          className:
            'bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-3 py-2 rounded-lg',
        }}
      />

      <div className="px-4 py-4 md:max-w-[700px] mx-auto space-y-4">
        {/* 현재 도움 제안 현황 */}
        <CardContainer>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl"> 😇🪽</span>
              도움을 주실 수 있는 분들
            </h2>
          </div>

          {/* 다른 사람들의 제안만 표시 (사용 가능한 제안만) */}
          <div className="space-y-3">
            {helpOffers
              ?.filter(
                (offer) =>
                  offer.helper?.id !== user?.memberId &&
                  offer.discountTotalCount - offer.discountApplyCount > 0
              )
              .map((offer) => (
                <HelpOfferCard key={offer.id} offer={offer} />
              ))}

            {/* 빈 상태 메시지 */}
            {(() => {
              const availableOffers =
                helpOffers?.filter(
                  (offer) =>
                    offer.helper?.id !== user?.memberId &&
                    offer.discountTotalCount - offer.discountApplyCount > 0
                ) || [];

              return availableOffers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🤷‍♂️</div>
                  <p>현재 도움을 줄 수 있는 제안이 없습니다</p>
                </div>
              ) : null;
            })()}
          </div>
        </CardContainer>
      </div>

      {/* 모달 */}
      {showOfferModal && (
        <AddOfferModal onClose={() => setShowOfferModal(false)} />
      )}
    </div>
  );
};

export default OfferPage;
