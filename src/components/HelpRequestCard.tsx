import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  RequestStatus,
  getRequestStatusText,
  getRequestStatusColor,
} from '../types/requestStatus';
import type { RequestStatusType } from '../types/requestStatus';
import CompleteConfirmationModal from './CompleteConfirmationModal';
import type { RequestHelp } from '../hooks/useRequestHelp';
import { formatToKoreanTime } from '../utils/formatToKoreanTime';

interface Props {
  request: RequestHelp;
  onAccept: () => void;
  onMarkComplete: () => void;
  onRemove: () => void;
  onCancelAcceptance: () => void;
}

const HelpRequestCard: React.FC<Props> = ({
  request,
  onAccept,
  onMarkComplete,
  onRemove,
  onCancelAcceptance,
}) => {
  const { user } = useAuth();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // 로컬 로딩 상태 관리
  const [loadingStates, setLoadingStates] = useState({
    isAccepting: false,
    isMarkingComplete: false,
    isRemoving: false,
    isCancelingAcceptance: false,
  });

  const isOwner = request.helpRequester?.id === user?.memberId;
  const isAcceptedByMe = request.helper?.id === user?.memberId;
  const canMarkComplete =
    request.status === RequestStatus.REQUEST && isAcceptedByMe;
  const canCancelAcceptance =
    request.status === RequestStatus.REQUEST && isAcceptedByMe;

  // 버튼 핸들러들
  const handleAccept = () => {
    setLoadingStates((prev) => ({ ...prev, isAccepting: true }));
    onAccept();
    // 성공 후에도 잠시 로딩 유지
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, isAccepting: false }));
    }, 1000);
  };

  const handleRemove = () => {
    setLoadingStates((prev) => ({ ...prev, isRemoving: true }));
    onRemove();
    // 성공 후에도 잠시 로딩 유지
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, isRemoving: false }));
    }, 1000);
  };

  const handleCancelAcceptance = () => {
    setLoadingStates((prev) => ({ ...prev, isCancelingAcceptance: true }));
    onCancelAcceptance();
    // 성공 후에도 잠시 로딩 유지
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, isCancelingAcceptance: false }));
    }, 1000);
  };

  const handleCompleteClick = () => {
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = () => {
    setLoadingStates((prev) => ({ ...prev, isMarkingComplete: true }));
    onMarkComplete();
    setShowCompleteModal(false);
    // 성공 후에도 잠시 로딩 유지
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, isMarkingComplete: false }));
    }, 1000);
  };

  const renderButtons = () => {
    if (request.status === RequestStatus.COMPLETED) {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="text-sm text-green-700 font-medium bg-green-50 px-3 py-2 rounded-xl border border-green-200">
            <span className="font-semibold">
              {request.helper?.helperName}님
            </span>
            의 도움으로 완료
          </div>
        </div>
      );
    }

    if (request.status === RequestStatus.REQUEST) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              📝 {request.helper?.helperName}님이 수락
            </span>
          </div>

          <div className="flex gap-2">
            {canCancelAcceptance && (
              <button
                onClick={handleCancelAcceptance}
                disabled={
                  loadingStates.isCancelingAcceptance ||
                  loadingStates.isMarkingComplete
                }
                className="btn-outline text-sm px-3 py-2 flex-1 disabled:opacity-50"
              >
                {loadingStates.isCancelingAcceptance ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-1"></div>
                    취소중...
                  </div>
                ) : (
                  '도움 수락 취소하기'
                )}
              </button>
            )}

            {canMarkComplete && (
              <button
                onClick={handleCompleteClick}
                disabled={
                  loadingStates.isMarkingComplete ||
                  loadingStates.isCancelingAcceptance
                }
                className="btn-primary text-sm px-3 py-2 flex-1 disabled:opacity-50"
              >
                {loadingStates.isMarkingComplete ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    완료중...
                  </div>
                ) : (
                  '등록 완료'
                )}
              </button>
            )}
          </div>
        </div>
      );
    }

    // waiting 상태 - 로딩 중에도 같은 버튼 유지
    return (
      <div className="flex gap-2">
        {!isOwner && (
          <button
            onClick={handleAccept}
            disabled={loadingStates.isAccepting || loadingStates.isRemoving}
            className="btn-primary text-sm px-3 py-2 flex-1 disabled:opacity-50"
          >
            {loadingStates.isAccepting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                수락중...
              </div>
            ) : (
              '도움 요청 수락하기'
            )}
          </button>
        )}

        {isOwner && (
          <button
            onClick={handleRemove}
            disabled={loadingStates.isRemoving || loadingStates.isAccepting}
            className="btn-danger text-sm px-3 py-2 flex-1 disabled:opacity-50"
          >
            {loadingStates.isRemoving ? (
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
    return getRequestStatusColor(request.status as RequestStatusType);
  };

  const getStatusText = () => {
    return getRequestStatusText(request.status as RequestStatusType);
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
                {request.helpRequester?.helpRequesterName}
              </div>
              <div className="text-primary-600 font-medium text-sm">
                {request.reqCar?.carNumber}
              </div>
              <div className="text-xs text-gray-500">
                {formatToKoreanTime(request.reqDate)} 등록
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
          requesterName={request.helpRequester?.helpRequesterName || ''}
          carNumber={request.reqCar?.carNumber || ''}
          onConfirm={handleCompleteConfirm}
          onCancel={() => setShowCompleteModal(false)}
          isLoading={loadingStates.isMarkingComplete}
        />
      )}
    </>
  );
};

export default HelpRequestCard;
