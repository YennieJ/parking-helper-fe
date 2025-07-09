import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CompleteConfirmationModal from './CompleteConfirmationModal';

interface HelpOffer {
  id: string;
  userName: string;
  createdAt: string;
  status: 'waiting' | 'reserved' | 'completed';
  reservedBy?: string;
  reservedById?: string;
  reservedByCarNumber?: string; // 예약자의 차량번호
  isOwner: boolean;
}

interface Props {
  offer: HelpOffer;
  onReserve: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onCancelReservation: () => void;
  loadingState?: {
    isReserving?: boolean;
    isCompleting?: boolean;
    isDeleting?: boolean;
    isCanceling?: boolean;
  };
}

const HelpOfferCard: React.FC<Props> = ({
  offer,
  onReserve,
  onComplete,
  onDelete,
  onCancelReservation,
  loadingState = {},
}) => {
  const { user } = useAuth();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const isReservedByMe = offer.reservedById === user?.id;
  const canComplete = offer.status === 'reserved' && offer.isOwner; // 작성자(A)만 완료 가능
  const canCancelReservation = offer.status === 'reserved' && isReservedByMe; // 예약자(B)만 취소 가능
  const canDelete = offer.status === 'waiting' && offer.isOwner; // 대기중일 때만 작성자가 삭제 가능

  const handleCompleteClick = () => {
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = () => {
    onComplete();
    setShowCompleteModal(false);
  };

  const renderButtons = () => {
    if (offer.status === 'completed') {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-xl">
            <span>✅</span>
            완료됨
          </div>
        </div>
      );
    }

    if (offer.status === 'reserved') {
      return (
        <div className="space-y-3">
          {/* 예약 정보 표시 - 예약자의 차량번호 포함 */}
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
            <div className="text-sm text-blue-800 font-medium">
              📝 {offer.reservedBy}님이 예약
            </div>
            {offer.reservedByCarNumber && (
              <div className="text-sm text-blue-600 mt-1">
                🚗 {offer.reservedByCarNumber}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* 예약자(B)에게만 취소 버튼 표시 */}
            {canCancelReservation && (
              <button
                onClick={onCancelReservation}
                disabled={loadingState.isCanceling}
                className="btn-outline text-sm px-3 py-2 flex-1 disabled:opacity-50"
              >
                {loadingState.isCanceling ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-1"></div>
                    취소중...
                  </div>
                ) : (
                  '예약 취소'
                )}
              </button>
            )}

            {/* 작성자(A)에게만 완료 버튼 표시 */}
            {canComplete && (
              <button
                onClick={handleCompleteClick}
                disabled={loadingState.isCompleting}
                className="btn-primary text-sm px-3 py-2 flex-1 disabled:opacity-50"
              >
                {loadingState.isCompleting ? (
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
        </div>
      );
    }

    // waiting 상태
    return (
      <div className="flex gap-2">
        {/* 다른 사람만 예약 가능 */}
        {!offer.isOwner && (
          <button
            onClick={onReserve}
            disabled={loadingState.isReserving}
            className="btn-primary text-sm px-3 py-2 flex-1 disabled:opacity-50"
          >
            {loadingState.isReserving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                예약중...
              </div>
            ) : (
              '예약하기'
            )}
          </button>
        )}

        {/* 작성자는 대기중일 때만 삭제 가능 */}
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={loadingState.isDeleting}
            className="btn-danger text-sm px-3 py-2 flex-1 disabled:opacity-50"
          >
            {loadingState.isDeleting ? (
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (offer.status) {
      case 'waiting':
        return '대기중';
      case 'reserved':
        return '예약됨';
      case 'completed':
        return '완료';
      default:
        return '알 수 없음';
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
          type="offer"
          onConfirm={handleCompleteConfirm}
          onCancel={() => setShowCompleteModal(false)}
          isLoading={loadingState.isCompleting}
        />
      )}
    </>
  );
};

export default HelpOfferCard;
