import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CompleteConfirmationModal from './CompleteConfirmationModal';

interface HelpRequest {
  id: string;
  userName: string;
  carNumber: string;
  createdAt: string;
  status: 'waiting' | 'reserved' | 'completed';
  reservedBy?: string;
  reservedById?: string;
  isOwner: boolean;
}

interface Props {
  request: HelpRequest;
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

const HelpRequestCard: React.FC<Props> = ({
  request,
  onReserve,
  onComplete,
  onDelete,
  onCancelReservation,
  loadingState = {},
}) => {
  const { user } = useAuth();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const isReservedByMe = request.reservedById === user?.id;
  const canComplete = request.status === 'reserved' && isReservedByMe;
  const canCancelReservation = request.status === 'reserved' && isReservedByMe;

  const handleCompleteClick = () => {
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = () => {
    onComplete();
    setShowCompleteModal(false);
  };

  const renderButtons = () => {
    if (request.status === 'completed') {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-xl">
            <span>✅</span>
            완료됨
          </div>
        </div>
      );
    }

    if (request.status === 'reserved') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-xl">
              📝 {request.reservedBy}님이 예약
            </span>
          </div>

          <div className="flex gap-2">
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
        {!request.isOwner && (
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

        {request.isOwner && (
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
    switch (request.status) {
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
    switch (request.status) {
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
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">🆘</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {request.userName}
              </div>
              <div className="text-primary-600 font-medium text-sm">
                {request.carNumber}
              </div>
              <div className="text-xs text-gray-500">
                {request.createdAt} 등록
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
          type="request"
          requesterName={request.userName}
          carNumber={request.carNumber}
          onConfirm={handleCompleteConfirm}
          onCancel={() => setShowCompleteModal(false)}
          isLoading={loadingState.isCompleting}
        />
      )}
    </>
  );
};

export default HelpRequestCard;
