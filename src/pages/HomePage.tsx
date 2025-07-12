// HomePage에서 React Query 사용 예시
import React, { useState } from 'react';
import {
  useHelpRequests,
  useHelpOffers,
  useCreateHelpRequest,
  useCreateHelpOffer,
  useReserveHelp,
  useRequestHelp,
  useConfirmHelp,
  useCancelHelpRequest,
  useCompleteHelpRequest,
  useCompleteHelpOffer,
  useDeleteHelpRequest,
  useDeleteHelpOffer,
  useCancelReservation,
} from '../hooks/useParkingData';
import { MESSAGES } from '../utils/messages';
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
  const requestHelp = useRequestHelp();
  const confirmHelp = useConfirmHelp();
  const cancelHelpRequest = useCancelHelpRequest();
  const completeHelpRequest = useCompleteHelpRequest();
  const completeHelpOffer = useCompleteHelpOffer();
  const deleteHelpRequest = useDeleteHelpRequest();
  const deleteHelpOffer = useDeleteHelpOffer();
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

  const handleAccept = async (
    id: string,
    requestData?: { carNumber?: string; userName?: string }
  ) => {
    try {
      await reserveHelp.mutateAsync({ id, requestData });
    } catch (error) {
      console.error('수락 실패:', error);
    }
  };

  const handleRequest = async (id: string) => {
    try {
      await requestHelp.mutateAsync(id);
    } catch (error) {
      console.error('요청 실패:', error);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      // 해당 offer의 차량번호 정보 찾기
      const offer = helpOffers?.find((o: any) => o.id === id);
      const offerData = offer?.requestedByCarNumber
        ? {
            carNumber: offer.requestedByCarNumber,
            userName: offer.requestedBy,
          }
        : undefined;

      await confirmHelp.mutateAsync({ id, offerData });
    } catch (error) {
      console.error('확인 실패:', error);
    }
  };

  const handleMarkCompleteRequest = async (id: string) => {
    try {
      await completeHelpRequest.mutateAsync(id);
    } catch (error) {
      console.error('완료 처리 실패:', error);
    }
  };

  const handleMarkCompleteOffer = async (id: string) => {
    try {
      await completeHelpOffer.mutateAsync(id);
    } catch (error) {
      console.error('완료 처리 실패:', error);
    }
  };

  const handleRemoveRequest = async (id: string) => {
    try {
      await deleteHelpRequest.mutateAsync(id);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handleRemoveOffer = async (id: string) => {
    try {
      await deleteHelpOffer.mutateAsync(id);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handleCancelAcceptance = async (id: string) => {
    try {
      await cancelReservation.mutateAsync(id);
    } catch (error) {
      console.error('수락 취소 실패:', error);
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelHelpRequest.mutateAsync(id);
    } catch (error) {
      console.error('요청 취소 실패:', error);
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

  // Request 카드용 로딩 상태
  const getRequestLoadingState = (id: string) => {
    return {
      isAccepting: reserveHelp.isPending && reserveHelp.variables?.id === id,
      isMarkingComplete:
        completeHelpRequest.isPending && completeHelpRequest.variables === id,
      isRemoving:
        deleteHelpRequest.isPending && deleteHelpRequest.variables === id,
      isCancelingAcceptance:
        cancelReservation.isPending && cancelReservation.variables === id,
    };
  };

  // Offer 카드용 로딩 상태
  const getOfferLoadingState = (id: string) => {
    return {
      isRequesting: requestHelp.isPending && requestHelp.variables === id,
      isConfirming: confirmHelp.isPending && confirmHelp.variables?.id === id,
      isMarkingComplete:
        completeHelpOffer.isPending && completeHelpOffer.variables === id,
      isRemoving: deleteHelpOffer.isPending && deleteHelpOffer.variables === id,
      isCancelingRequest:
        cancelHelpRequest.isPending && cancelHelpRequest.variables === id,
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
            차량 등록 요청하기 ({helpRequests?.length || 0})
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
            차량 등록 도와주기 ({helpOffers?.length || 0})
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 차량 등록 요청하기 탭 */}
        {activeTab === 'request' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🆘</span>
                차량 등록 요청하기
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
                  onAccept={() =>
                    handleAccept(request.id, {
                      carNumber: request.carNumber,
                      userName: request.userName,
                    })
                  }
                  onMarkComplete={() => handleMarkCompleteRequest(request.id)}
                  onRemove={() => handleRemoveRequest(request.id)}
                  onCancelAcceptance={() => handleCancelAcceptance(request.id)}
                  loadingState={getRequestLoadingState(request.id)}
                />
              ))}
              {(!helpRequests || helpRequests.length === 0) && (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-2">🤷‍♂️</div>
                  <p className="text-gray-500">
                    {MESSAGES.HELP_REQUEST.EMPTY_STATE}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 차량 등록 도와주기 탭 */}
        {activeTab === 'offer' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🙋‍♂️</span>
                차량 등록 도와주기
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
                  onRequest={() => handleRequest(offer.id)}
                  onConfirm={() => handleConfirm(offer.id)}
                  onMarkComplete={() => handleMarkCompleteOffer(offer.id)}
                  onRemove={() => handleRemoveOffer(offer.id)}
                  onCancelRequest={() => handleCancelRequest(offer.id)}
                  loadingState={getOfferLoadingState(offer.id)}
                />
              ))}
              {(!helpOffers || helpOffers.length === 0) && (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-2">🤷‍♀️</div>
                  <p className="text-gray-500">
                    {MESSAGES.HELP_OFFER.EMPTY_STATE}
                  </p>
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
