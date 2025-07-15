import React, { useState } from 'react';
import HelpRequestCard from './HelpRequestCard';
import { MESSAGES, createMessage } from '../../shared/utils/messages';
import { useAuth } from '../../contexts/AuthContext';
import {
  useDeleteRequestHelp,
  useUpdateRequestHelp,
  type RequestHelp,
} from './useRequestHelp';
import { RequestStatus } from '../../shared/types/requestStatus';
import AddRequestModal from './AddRequestModal';
import { useToast } from '../../shared/components/ui/Toast';

interface RequestSectionProps {
  helpRequests: RequestHelp[] | undefined;
  isLoading: boolean;
  error: any;
}

const RequestSection: React.FC<RequestSectionProps> = ({
  helpRequests,
  isLoading,
  error,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    myHelping: true,
    myRequests: true,
  });
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Mutation 훅들
  const deleteRequestHelp = useDeleteRequestHelp();
  const updateRequestHelp = useUpdateRequestHelp();

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

  // 도움 요청 수락 처리
  const handleAccept = async (id: string) => {
    try {
      await updateRequestHelp.mutateAsync({
        id: Number(id),
        data: {
          helperMemId: user?.memberId || 0,
          status: RequestStatus.REQUEST,
        },
      });

      // 차량번호 복사 메시지 표시
      const request = helpRequests?.find((r) => r.id.toString() === id);
      if (request?.reqCar?.carNumber) {
        const message = createMessage.helpRequest.accepted(
          request.reqCar.carNumber
        );
        showSuccess(message.title, message.message);
      } else {
        showSuccess('수락 완료', MESSAGES.HELP_REQUEST.ACCEPTED);
      }
    } catch (error) {
      showError('수락 실패', MESSAGES.HELP_REQUEST.ACCEPT_FAILED);
    }
  };

  // 도움 요청 삭제 처리
  const handleRemoveRequest = async (id: string) => {
    try {
      await deleteRequestHelp.mutateAsync(Number(id));
      showSuccess('삭제 완료', MESSAGES.HELP_REQUEST.DELETED);
    } catch (error) {
      showError('삭제 실패', MESSAGES.HELP_REQUEST.DELETE_FAILED);
    }
  };

  // 도움 수락 취소 처리
  const handleCancelAcceptance = async (id: string) => {
    try {
      await updateRequestHelp.mutateAsync({
        id: Number(id),
        data: {
          helperMemId: null,
          status: RequestStatus.WAITING,
        },
      });
      showSuccess('취소 완료', MESSAGES.HELP_REQUEST.CANCELLED);
    } catch (error) {
      showError('취소 실패', MESSAGES.HELP_REQUEST.CANCEL_FAILED);
    }
  };

  // 요청들을 사용자 역할에 따라 분류
  const categorizeRequests = () => {
    if (!helpRequests || !user)
      return {
        myHelping: [],
        myRequests: [],
      };

    const myHelping = helpRequests.filter(
      (request) =>
        request.helper?.id === user.memberId &&
        request.status !== RequestStatus.COMPLETED
    );

    const myRequests = helpRequests.filter(
      (request) => request.helpRequester?.id === user.memberId
    );

    return { myHelping, myRequests };
  };

  const { myHelping, myRequests } = categorizeRequests();
  const totalMyRequests = myHelping.length + myRequests.length;

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🆘</span>
          차량 등록 요청하기
        </h2>
        <button
          onClick={handleAddRequest}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          + 추가
        </button>
      </div>

      {/* 내 요청/도움 요청 아코디언 */}
      {totalMyRequests > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 overflow-hidden">
          <button
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                myHelping: !prev.myHelping,
              }))
            }
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 text-sm">📋</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  내 요청/도움 요청 ({totalMyRequests}개)
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  내가 도움을 요청한 것들과 현재 다른 사람을 도와주고 있는
                  것들을 모아서 보여드려요.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {expandedSections.myHelping ? '접기' : '펼치기'}
              </span>
              <span
                className={`transition-transform duration-200 text-gray-400 ${
                  expandedSections.myHelping ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </div>
          </button>

          {expandedSections.myHelping && (
            <div className="border-t border-gray-100 bg-gray-50/30">
              <div className="p-4 space-y-4">
                {/* 내가 도와주는 요청 */}
                {myHelping.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                      내가 도와주는 요청 ({myHelping.length}개)
                    </div>
                    {myHelping.map((request: RequestHelp) => (
                      <HelpRequestCard
                        key={request.id}
                        request={request}
                        onAccept={() => handleAccept(request.id.toString())}
                        onRemove={() =>
                          handleRemoveRequest(request.id.toString())
                        }
                        onCancelAcceptance={() =>
                          handleCancelAcceptance(request.id.toString())
                        }
                      />
                    ))}
                  </div>
                )}

                {/* 내가 요청한 요청 */}
                {myRequests.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                      내 도움 요청 ({myRequests.length}개)
                    </div>
                    {myRequests.map((request: RequestHelp) => (
                      <HelpRequestCard
                        key={request.id}
                        request={request}
                        onAccept={() => handleAccept(request.id.toString())}
                        onRemove={() =>
                          handleRemoveRequest(request.id.toString())
                        }
                        onCancelAcceptance={() =>
                          handleCancelAcceptance(request.id.toString())
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 아코디언이 아닌 모든 요청들 (원래 순서대로) */}
      <div className="space-y-3">
        {helpRequests
          ?.filter(
            (request) =>
              request.helpRequester?.id !== user?.memberId &&
              request.helper?.id !== user?.memberId
          )
          .map((request: RequestHelp) => (
            <HelpRequestCard
              key={request.id}
              request={request}
              onAccept={() => handleAccept(request.id.toString())}
              onRemove={() => handleRemoveRequest(request.id.toString())}
              onCancelAcceptance={() =>
                handleCancelAcceptance(request.id.toString())
              }
            />
          ))}
        {(!helpRequests || helpRequests.length === 0) && (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🤷‍♂️</div>
            <p className="text-gray-500">{MESSAGES.HELP_REQUEST.EMPTY_STATE}</p>
          </div>
        )}
      </div>

      {/* 모달 */}
      {showRequestModal && (
        <AddRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

export default RequestSection;
