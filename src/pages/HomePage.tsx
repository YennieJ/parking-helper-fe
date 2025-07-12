// HomePage에서 React Query 사용 예시
import React, { useState } from 'react';
import {
  useHelpRequests,
  useHelpOffers,
  useCreateHelpRequest,
  useCreateHelpOffer,
  useReserveHelp,
  useCompleteHelp,
  useDeleteHelp,
  useCancelReservation,
} from '../hooks/useParkingData';
import HelpRequestCard from '../components/HelpRequestCard';
import HelpOfferCard from '../components/HelpOfferCard';
import AddRequestModal from '../components/AddRequestModal';
import AddOfferModal from '../components/AddOfferModal';

const HomePage: React.FC = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'offer'>('request');

  // React Query 훅들
  const {
    data: helpRequests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useHelpRequests();
  const {
    data: helpOffers,
    isLoading: offersLoading,
    error: offersError,
  } = useHelpOffers();

  // Mutation 훅들
  const createRequest = useCreateHelpRequest();
  const createOffer = useCreateHelpOffer();
  const reserveHelp = useReserveHelp();
  const completeHelp = useCompleteHelp();
  const deleteHelp = useDeleteHelp();
  const cancelReservation = useCancelReservation();

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    };
    return now.toLocaleDateString('ko-KR', options);
  };

  const handleAddRequest = () => {
    setShowRequestModal(true);
  };

  const handleAddOffer = () => {
    setShowOfferModal(true);
  };

  const handleCreateRequest = async (data: any) => {
    try {
      await createRequest.mutateAsync(data);
      setShowRequestModal(false);
    } catch (error) {
      console.error('요청 등록 실패:', error);
    }
  };

  const handleCreateOffer = async (data: any) => {
    try {
      await createOffer.mutateAsync(data);
      setShowOfferModal(false);
    } catch (error) {
      console.error('제안 등록 실패:', error);
    }
  };

  const handleReserve = async (id: string, type: 'request' | 'offer') => {
    try {
      await reserveHelp.mutateAsync({ id, type });
    } catch (error) {
      console.error('예약 실패:', error);
    }
  };

  const handleComplete = async (id: string, type: 'request' | 'offer') => {
    try {
      await completeHelp.mutateAsync({ id, type });
    } catch (error) {
      console.error('완료 처리 실패:', error);
    }
  };

  const handleDelete = async (id: string, type: 'request' | 'offer') => {
    try {
      await deleteHelp.mutateAsync({ id, type });
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handleCancelReservation = async (
    id: string,
    type: 'request' | 'offer'
  ) => {
    try {
      await cancelReservation.mutateAsync({ id, type });
    } catch (error) {
      console.error('예약 취소 실패:', error);
    }
  };

  // 로딩 상태 처리
  if (requestsLoading || offersLoading) {
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
  if (requestsError || offersError) {
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

  // 각 아이템별 로딩 상태를 추적하기 위한 함수들
  const getLoadingState = (id: string, type: 'request' | 'offer') => {
    const variables = { id, type };

    return {
      isReserving:
        reserveHelp.isPending &&
        JSON.stringify(reserveHelp.variables) === JSON.stringify(variables),
      isCompleting:
        completeHelp.isPending &&
        JSON.stringify(completeHelp.variables) === JSON.stringify(variables),
      isDeleting:
        deleteHelp.isPending &&
        JSON.stringify(deleteHelp.variables) === JSON.stringify(variables),
      isCanceling:
        cancelReservation.isPending &&
        JSON.stringify(cancelReservation.variables) ===
          JSON.stringify(variables),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-6 shadow-sm">
        <div className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          {getCurrentDateTime()}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white/60 backdrop-blur-lg border-b border-gray-200/50 px-4 py-3">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'request'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <span className="text-lg">🆘</span>
            도와주세요 ({helpRequests?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('offer')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'offer'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-lg">🙋‍♂️</span>
            도와줄수있어요 ({helpOffers?.length || 0})
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 도와주세요 탭 */}
        {activeTab === 'request' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🆘</span>
                도와주세요
              </h2>
              <button
                onClick={handleAddRequest}
                disabled={createRequest.isPending}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {createRequest.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  '+ 추가'
                )}
              </button>
            </div>
            <div className="space-y-3">
              {helpRequests?.map((request: any) => (
                <HelpRequestCard
                  key={request.id}
                  request={request}
                  onReserve={() => handleReserve(request.id, 'request')}
                  onComplete={() => handleComplete(request.id, 'request')}
                  onDelete={() => handleDelete(request.id, 'request')}
                  onCancelReservation={() =>
                    handleCancelReservation(request.id, 'request')
                  }
                  loadingState={getLoadingState(request.id, 'request')}
                />
              ))}
              {(!helpRequests || helpRequests.length === 0) && (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-2">🤷‍♂️</div>
                  <p className="text-gray-500">등록된 도움 요청이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 도와줄수있어요 탭 */}
        {activeTab === 'offer' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🙋‍♂️</span>
                도와줄수있어요
              </h2>
              <button
                onClick={handleAddOffer}
                disabled={createOffer.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {createOffer.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  '+ 추가'
                )}
              </button>
            </div>
            <div className="space-y-3">
              {helpOffers?.map((offer: any) => (
                <HelpOfferCard
                  key={offer.id}
                  offer={offer}
                  onReserve={() => handleReserve(offer.id, 'offer')}
                  onComplete={() => handleComplete(offer.id, 'offer')}
                  onDelete={() => handleDelete(offer.id, 'offer')}
                  onCancelReservation={() =>
                    handleCancelReservation(offer.id, 'offer')
                  }
                  loadingState={getLoadingState(offer.id, 'offer')}
                />
              ))}
              {(!helpOffers || helpOffers.length === 0) && (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-2">🤷‍♀️</div>
                  <p className="text-gray-500">등록된 도움 제안이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 모달들 */}
      {showRequestModal && (
        <AddRequestModal
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleCreateRequest}
          isLoading={createRequest.isPending}
        />
      )}

      {showOfferModal && (
        <AddOfferModal
          onClose={() => setShowOfferModal(false)}
          onSubmit={handleCreateOffer}
          isLoading={createOffer.isPending}
        />
      )}
    </div>
  );
};

export default HomePage;
