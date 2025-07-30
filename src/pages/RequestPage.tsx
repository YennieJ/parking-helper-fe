import { useAuth } from '../contexts/AuthContext';
import { useRequestHelp } from '../features/request/useRequestHelp';
import { useState } from 'react';
import { useToast } from '../shared/components/ui/Toast';
import HelpRequestCard from '../features/request/components/HelpRequestCard';
import Header from '../shared/components/layout/Header';
import AddRequestModal from '../features/request/components/AddRequestModal';
import CardContainer from '../shared/components/ui/CardContiner';

const RequestPage = ({}) => {
  const { data: helpRequests, isLoading, error } = useRequestHelp();

  const [showRequestModal, setShowRequestModal] = useState(false);

  const { user } = useAuth();
  const { showError } = useToast();

  // 도움 요청 추가 모달 열기
  const handleAddRequest = () => {
    // 차번호가 없는 경우 토스트로 안내
    if (!user?.carNumber) {
      showError(
        '차량 정보 없음',
        '등록된 차량이 없습니다. 주차 등록 사이트에서 차량을 등록한 후 다시 시도해주세요.'
      );
      return;
    }
    setShowRequestModal(true);
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
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
        title="도움이 필요하세요?"
        icon="🙏"
        rightAction={{
          icon: '도움 요청',
          onClick: handleAddRequest,
          className:
            'bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-3 py-2 rounded-lg',
        }}
      />

      <div className="px-4 py-4 md:max-w-[700px] mx-auto space-y-4">
        {/* 현재 도움 요청 현황 */}
        <CardContainer>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">🆘</span>
              도움이 필요한 분들
            </h2>
          </div>

          {/* 다른 사람들의 요청만 표시 (사용 가능한 요청만) */}
          <div className="space-y-3">
            {helpRequests
              ?.filter(
                (request) =>
                  request.helpRequester.id !== user?.memberId &&
                  request.totalDisCount - request.applyDisCount > 0
              )
              .map((request) => (
                <HelpRequestCard key={request.id} request={request} />
              ))}

            {/* 빈 상태 메시지 */}
            {(() => {
              const availableRequests =
                helpRequests?.filter(
                  (request) =>
                    request.helpRequester.id !== user?.memberId &&
                    request.totalDisCount - request.applyDisCount > 0
                ) || [];

              return availableRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🤷‍♂️</div>
                  <p>현재 도움이 필요한 요청이 없습니다</p>
                </div>
              ) : null;
            })()}
          </div>
        </CardContainer>
      </div>

      {/* 모달 */}
      {showRequestModal && (
        <AddRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

export default RequestPage;
