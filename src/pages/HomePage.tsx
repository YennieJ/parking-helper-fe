import React from 'react';

// import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import RequestSection from '../components/RequestSection';
// import OfferSection from '../components/OfferSection';
// import AddOfferModal from '../components/AddOfferModal';
import { useRequestHelp } from '../hooks/useRequestHelp';

const HomePage: React.FC = () => {
  // const [showOfferModal, setShowOfferModal] = useState(false);
  // const [activeTab, setActiveTab] = useState<'request' | 'offer'>('request');

  // AuthContext에서 로그인된 사용자 정보 가져오기
  // const { user } = useAuth();

  // 로그인된 사용자 정보를 콘솔에 출력
  // useEffect(() => {
  //   if (user) {
  //     console.log('=== 로그인된 사용자 정보 ===');
  //     console.log('ID:', user.memberId);
  //     console.log('이름:', user.memberName);
  //     console.log('차량ID:', user.carId);
  //     console.log('차량번호:', user.carNumber);
  //     console.log('이메일:', user.email);
  //     console.log('========================');
  //   } else {
  //     console.log('로그인된 사용자가 없습니다.');
  //   }
  // }, [user]);

  // React Query 훅들
  const {
    data: helpRequests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequestHelp('2025-07-12');

  // console.log('helpRequests', helpRequests);

  // const createOffer = useCreateHelpOffer();
  // const confirmHelp = useConfirmHelp();
  // const completeHelpOffer = useCompleteHelpOffer();
  // const deleteHelpOffer = useDeleteHelpOffer();

  // 현재 날짜/시간을 한국 시간으로 포맷팅
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

  // 도움 제안 추가 모달 열기
  // const handleAddOffer = () => {
  //   setShowOfferModal(true);
  // };

  // 도움 제안 생성 처리
  // const handleCreateOffer = async (data: any) => {
  //   try {
  //     await createOffer.mutateAsync(data);
  //     setShowOfferModal(false);
  //   } catch (error) {
  //     console.error('제안 등록 실패:', error);
  //   }
  // };

  // 도움 요청 처리 (미구현)
  // const handleRequest = async (id: string) => {
  //   try {
  //     // TODO: 실제 도움 요청 API 구현 필요
  //     console.log('도움 요청:', id);
  //   } catch (error) {
  //     console.error('요청 실패:', error);
  //   }
  // };

  // 도움 제안 확인 처리
  // const handleConfirm = async (id: string) => {
  //   try {
  //     // 해당 offer의 차량번호 정보 찾기
  //     const offer = helpOffers?.find((o: any) => o.id === id);
  //     const offerData = offer?.requestedByCarNumber
  //       ? {
  //           carNumber: offer.requestedByCarNumber,
  //           userName: offer.requestedBy,
  //         }
  //       : undefined;

  //     await confirmHelp.mutateAsync({ id, offerData });
  //   } catch (error) {
  //     console.error('확인 실패:', error);
  //   }
  // };

  // 도움 제안 완료 처리
  // const handleMarkCompleteOffer = async (id: string) => {
  //   try {
  //     await completeHelpOffer.mutateAsync(id);
  //   } catch (error) {
  //     console.error('완료 처리 실패:', error);
  //   }
  // };

  // 도움 제안 삭제 처리
  // const handleRemoveOffer = async (id: string) => {
  //   try {
  //     await deleteHelpOffer.mutateAsync(id);
  //   } catch (error) {
  //     console.error('삭제 실패:', error);
  //   }
  // };

  // 도움 요청 취소 처리
  // const handleCancelRequest = async (id: string) => {
  //   try {
  //     await cancelHelpRequest.mutateAsync(id);
  //   } catch (error) {
  //     console.error('요청 취소 실패:', error);
  //   }
  // };

  // 로딩 상태 처리
  // if (requestsLoading || offersLoading) {
  if (requestsLoading) {
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
  // if (requestsError || offersError) {
  if (requestsError) {
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

  // Offer 카드용 로딩 상태 반환
  // const getOfferLoadingState = (id: string) => {
  //   return {
  //     isRequesting: false, // TODO: 실제 도움 요청 API 구현 필요
  //     isConfirming: confirmHelp.isPending && confirmHelp.variables?.id === id,
  //     isMarkingComplete:
  //       completeHelpOffer.isPending && completeHelpOffer.variables === id,
  //     isRemoving: deleteHelpOffer.isPending && deleteHelpOffer.variables === id,
  //     isCancelingRequest:
  //       cancelHelpRequest.isPending && cancelHelpRequest.variables === id,
  //   };
  // };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50">
      {/* 헤더 */}
      <Header title={getCurrentDateTime()} icon="📅" />

      {/* 탭 네비게이션 */}
      {/* <div className="px-4 py-3">
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
      </div> */}

      <div className="p-4 md:max-w-[700px] mx-auto">
        {/* 차량 등록 요청하기 탭 */}
        {/* {activeTab === 'request' && ( */}
        <RequestSection
          helpRequests={helpRequests}
          isLoading={requestsLoading}
          error={requestsError}
        />
        {/* )} */}

        {/* 차량 등록 도와주기 탭 */}
        {/* {activeTab === 'offer' && (
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
        )} */}
      </div>

      {/* 모달들 */}

      {/* {showOfferModal && (
        <AddOfferModal
          onClose={() => setShowOfferModal(false)}
          onSubmit={handleCreateOffer}
          isLoading={createOffer.isPending}
        />
      )} */}
    </div>
  );
};

export default HomePage;
