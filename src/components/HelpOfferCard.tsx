import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { MESSAGES, createMessage } from '../utils/messages';
import CompleteConfirmationModal from './CompleteConfirmationModal';

interface HelpOffer {
  id: string;
  userName: string;
  createdAt: string;
  status: 'waiting' | 'requested' | 'confirmed' | 'completed';
  requestedBy?: string;
  requestedById?: string;
  requestedByCarNumber?: string; // 요청자의 차량번호
  isOwner: boolean;
}

interface Props {
  offer: HelpOffer;
  onRequest: () => void;
  onConfirm: () => void;
  onMarkComplete: () => void;
  onRemove: () => void;
  onCancelRequest: () => void;
  loadingState?: {
    isRequesting?: boolean;
    isConfirming?: boolean;
    isMarkingComplete?: boolean;
    isRemoving?: boolean;
    isCancelingRequest?: boolean;
  };
}

const HelpOfferCard: React.FC<Props> = ({
  offer,
  onRequest,
  onConfirm,
  onMarkComplete,
  onRemove,
  onCancelRequest,
  loadingState = {},
}) => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const isRequestedByMe = offer.requestedById === user?.id;
  const canConfirm = offer.status === 'requested' && offer.isOwner; // 작성자만 확인 가능
  const canMarkComplete = offer.status === 'confirmed' && offer.isOwner; // 작성자만 완료 가능
  const canCancelRequest = offer.status === 'requested' && isRequestedByMe; // 요청자만 취소 가능
  const canRemove = offer.status === 'waiting' && offer.isOwner; // 대기중일 때만 작성자가 삭제 가능

  const handleCompleteClick = () => {
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = () => {
    onMarkComplete();
    setShowCompleteModal(false);
  };

  const handleCopyCarNumber = async () => {
    const carNumber = offer.requestedByCarNumber || '';

    try {
      await navigator.clipboard.writeText(carNumber);
      const message = createMessage.carNumber.copied(carNumber);
      showSuccess(message.title, message.message);
    } catch (error) {
      console.error('복사 실패:', error);
      // 클립보드 API가 지원되지 않는 경우 fallback
      const textArea = document.createElement('textarea');
      textArea.value = carNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      const message = createMessage.carNumber.copied(carNumber);
      showSuccess(message.title, message.message);
    }
  };

  const renderButtons = () => {
    if (offer.status === 'completed') {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-green-700 font-medium bg-green-50 px-3 py-2 rounded-xl border border-green-200">
            <span>✅</span>
            완료됨
          </div>
        </div>
      );
    }

    if (offer.status === 'requested') {
      return (
        <div className="space-y-3">
          {/* 요청 정보 표시 - 요청자의 차량번호 포함 */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-700 font-medium">
              📝 {offer.requestedBy}님이 도움 요청
            </div>
            {offer.requestedByCarNumber && (
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-sm text-gray-600">
                    🚗 도움 요청자의 차량번호
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {offer.requestedByCarNumber}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* 요청자에게만 취소 버튼 표시 */}
            {canCancelRequest && (
              <button
                onClick={onCancelRequest}
                disabled={loadingState.isCancelingRequest}
                className="btn-outline text-sm px-3 py-2 flex-1 disabled:opacity-50"
              >
                {loadingState.isCancelingRequest ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-1"></div>
                    취소중...
                  </div>
                ) : (
                  '도움 요청 취소'
                )}
              </button>
            )}

            {/* 작성자에게만 확인 버튼 표시 */}
            {canConfirm && (
              <button
                onClick={onConfirm}
                disabled={loadingState.isConfirming}
                className="btn-primary text-sm px-3 py-2 flex-1 disabled:opacity-50"
              >
                {loadingState.isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    확인중...
                  </div>
                ) : (
                  '확인하기'
                )}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (offer.status === 'confirmed') {
      return (
        <div className="space-y-3">
          {/* 확인된 상태 표시 */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-700 font-medium">
              ✅ {offer.requestedBy}님의 차량 도움 진행 중
            </div>
          </div>

          {/* 작성자에게만 완료 버튼 표시 */}
          {canMarkComplete && (
            <button
              onClick={handleCompleteClick}
              disabled={loadingState.isMarkingComplete}
              className="btn-primary text-sm px-3 py-2 w-full disabled:opacity-50"
            >
              {loadingState.isMarkingComplete ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  완료중...
                </div>
              ) : (
                '완료하기'
              )}
            </button>
          )}
        </div>
      );
    }

    // waiting 상태
    return (
      <div className="flex gap-2">
        {/* 다른 사람만 요청 가능 */}
        {!offer.isOwner && (
          <button
            onClick={onRequest}
            disabled={loadingState.isRequesting}
            className="btn-primary text-sm px-3 py-2 flex-1 disabled:opacity-50"
          >
            {loadingState.isRequesting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                요청중...
              </div>
            ) : (
              '도움 요청하기'
            )}
          </button>
        )}

        {/* 작성자는 대기중일 때만 삭제 가능 */}
        {canRemove && (
          <button
            onClick={onRemove}
            disabled={loadingState.isRemoving}
            className="btn-danger text-sm px-3 py-2 flex-1 disabled:opacity-50"
          >
            {loadingState.isRemoving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                삭제중...
              </div>
            ) : (
              '삭제하기'
            )}
          </button>
        )}
      </div>
    );
  };

  const getStatusColor = () => {
    switch (offer.status) {
      case 'waiting':
        return 'bg-white text-yellow-600 border-yellow-300';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (offer.status) {
      case 'waiting':
        return MESSAGES.STATUS.OFFERING;
      case 'requested':
        return MESSAGES.STATUS.REQUESTED;
      case 'confirmed':
        return MESSAGES.STATUS.IN_PROGRESS;
      case 'completed':
        return MESSAGES.STATUS.COMPLETED;
      default:
        return MESSAGES.STATUS.UNKNOWN;
    }
  };

  return (
    <>
      <div className="card hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">🙋‍♂️</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {offer.userName}님
              </div>
              <div className="text-xs text-gray-500">
                {offer.createdAt} 등록
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusColor()}`}
          >
            {getStatusText()}
          </div>
        </div>

        {renderButtons()}
      </div>

      {/* 완료 확인 모달 */}
      {showCompleteModal && (
        <CompleteConfirmationModal
          onConfirm={handleCompleteConfirm}
          onCancel={() => setShowCompleteModal(false)}
          isLoading={loadingState.isMarkingComplete}
        />
      )}
    </>
  );
};

export default HelpOfferCard;
