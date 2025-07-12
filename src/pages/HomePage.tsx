// HomePage에서 React Query 사용 예시
import React, { useState, useEffect } from 'react';
import {
  useHelpOffers,
  useCreateHelpRequest,
  useCreateHelpOffer,
  useReserveHelp,
  useConfirmHelp,
  useCancelHelpRequest,
  useCompleteHelpRequest,
  useCompleteHelpOffer,
  useDeleteHelpOffer,
  useCancelReservation,
} from '../hooks/useParkingData';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import RequestSection from '../components/RequestSection';
import OfferSection from '../components/OfferSection';
import AddRequestModal from '../components/AddRequestModal';
import AddOfferModal from '../components/AddOfferModal';
import { useRequestHelp, useDeleteRequestHelp } from '../hooks/useRequestHelp';

const HomePage: React.FC = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'offer'>('request');

  // AuthContext에서 로그인된 사용자 정보 가져오기
  const { user } = useAuth();

  // 로그인된 사용자 정보를 콘솔에 출력
  useEffect(() => {
    if (user) {
      console.log('=== 로그인된 사용자 정보 ===');
      console.log('ID:', user.id);
      console.log('사원번호:', user.employeeNumber);
      console.log('이름:', user.name);
      console.log('차량번호:', user.carNumber);
      console.log('이메일:', user.email);
      console.log('========================');
    } else {
      console.log('로그인된 사용자가 없습니다.');
    }
  }, [user]);

  // React Query 훅들
  const {
    data: helpRequests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequestHelp('2025-07-12');

  console.log('helpRequests', helpRequests);

  const {
    data: helpOffers,
    isLoading: offersLoading,
    error: offersError,
  } = useHelpOffers();

  // Mutation 훅들
  const createRequest = useCreateHelpRequest();
  const createOffer = useCreateHelpOffer();
  const reserveHelp = useReserveHelp();
  // requestHelp는 Query 훅이므로 제거 (useRequestHelp는 데이터 조회용)
  const confirmHelp = useConfirmHelp();
  const cancelHelpRequest = useCancelHelpRequest();
  const completeHelpRequest = useCompleteHelpRequest();
  const completeHelpOffer = useCompleteHelpOffer();
  const deleteHelpOffer = useDeleteHelpOffer();
  const cancelReservation = useCancelReservation();

  // 새로운 Request Help mutation 훅들
  const deleteRequestHelp = useDeleteRequestHelp();

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
      // TODO: 실제 도움 요청 API 구현 필요
      console.log('도움 요청:', id);
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
      await deleteRequestHelp.mutateAsync(Number(id));
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
        deleteRequestHelp.isPending &&
        deleteRequestHelp.variables === Number(id),
      isCancelingAcceptance:
        cancelReservation.isPending && cancelReservation.variables === id,
    };
  };

  // Offer 카드용 로딩 상태
  const getOfferLoadingState = (id: string) => {
    return {
      isRequesting: false, // TODO: 실제 도움 요청 API 구현 필요
      isConfirming: confirmHelp.isPending && confirmHelp.variables?.id === id,
      isMarkingComplete:
        completeHelpOffer.isPending && completeHelpOffer.variables === id,
      isRemoving: deleteHelpOffer.isPending && deleteHelpOffer.variables === id,
      isCancelingRequest:
        cancelHelpRequest.isPending && cancelHelpRequest.variables === id,
    };
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50">
      {/* 헤더 */}
      <Header title={getCurrentDateTime()} icon="📅" />

      {/* 탭 네비게이션 */}
      <div className="px-4 py-3">
        <div className="flex space-x-1 bg-gray-200 rounded-xl p-2 mt-1 md:max-w-[700px] mx-auto">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'request'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
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
            차량 등록 도와주기 ({helpOffers?.length || 0})
          </button>
        </div>
      </div>

      <div className="p-4 md:max-w-[700px] mx-auto">
        {/* 차량 등록 요청하기 탭 */}
        {activeTab === 'request' && (
          <RequestSection
            helpRequests={helpRequests || []}
            onAddRequest={handleAddRequest}
            onAccept={handleAccept}
            onMarkComplete={handleMarkCompleteRequest}
            onRemove={handleRemoveRequest}
            onCancelAcceptance={handleCancelAcceptance}
            loadingState={getRequestLoadingState}
            isCreating={createRequest.isPending}
          />
        )}

        {/* 차량 등록 도와주기 탭 */}
        {activeTab === 'offer' && (
          <OfferSection
            helpOffers={helpOffers || []}
            onAddOffer={handleAddOffer}
            onRequest={handleRequest}
            onConfirm={handleConfirm}
            onMarkComplete={handleMarkCompleteOffer}
            onRemove={handleRemoveOffer}
            onCancelRequest={handleCancelRequest}
            loadingState={getOfferLoadingState}
            isCreating={createOffer.isPending}
          />
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
