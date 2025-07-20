import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ParkingStatus } from '../../shared/types/parkingStatus';
import { type RequestHelp } from './useRequestHelp';
import { formatToKoreanTime } from '../../shared/utils/formatToKoreanTime';
import { useToast } from '../../shared/components/ui/Toast';
import { MESSAGES } from '../../shared/utils/messages';
import { useUpdateRequestHelpDetail } from '../requestDetail/useRequestHelpDetail';
import { Service } from '../../shared/types/servieType';

interface Props {
  request: RequestHelp;
}

const HelpRequestCard: React.FC<Props> = ({ request }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const updateRequestHelpDetail = useUpdateRequestHelpDetail();
  const [helpCount, setHelpCount] = useState(1); // 도와드릴 건수 상태 추가

  // 로컬 로딩 상태 관리
  const [loadingStates, setLoadingStates] = useState({
    isAccepting: false,
    isMarkingComplete: false,
    isRemoving: false,
    isCancelingAcceptance: false,
  });

  const requestCount = request.totalDisCount - request.applyDisCount; // 남은 요청 건수
  const maxHelpCount = Math.min(requestCount, 3); // 최대 도움 가능 건수

  // 도움 요청 수락 처리
  const handleAccept = async () => {
    if (!user) return;

    setLoadingStates((prev) => ({ ...prev, isAccepting: true }));
    try {
      // Waiting 상태인 helpDetails만 필터링
      const waitingDetails = request.helpDetails.filter(
        (detail) => detail.reqDetailStatus === ParkingStatus.WAITING
      );

      // helpCount만큼만 선택해서 업데이트
      const detailsToUpdate = waitingDetails.slice(0, helpCount);

      detailsToUpdate.forEach((detail) => {
        updateRequestHelpDetail.mutate({
          detailId: detail.id,
          helperMemId: user?.memberId || 0,
          discountApplyType: Service.NONE,
          reqDetailStatus: ParkingStatus.REQUEST,
        });
      });

      showSuccess('수락 완료', MESSAGES.HELP_REQUEST.ACCEPTED);
      setHelpCount(1); // helpCount를 1로 초기화
    } catch (error) {
      showError('수락 실패', MESSAGES.HELP_REQUEST.ACCEPT_FAILED);
    } finally {
      setLoadingStates((prev) => ({ ...prev, isAccepting: false }));
    }
  };

  // 도와드릴 건수 증가/감소
  const increaseHelpCount = () => {
    if (helpCount < maxHelpCount) {
      setHelpCount(helpCount + 1);
    }
  };

  const decreaseHelpCount = () => {
    if (helpCount > 1) {
      setHelpCount(helpCount - 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* 헤더 - 사용자 정보와 시간 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <span className="font-semibold text-gray-800">
            {request.helpRequester?.helpRequesterName || '익명'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <span className="text-xs">🕐</span>
          <span>{formatToKoreanTime(request.reqDate)}</span>
        </div>
      </div>

      {/* 메인 내용 */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          주차 할인권 등록 요청{' '}
          <span className="text-blue-600">{requestCount}건</span>
        </h3>

        {/* 도와드릴 건수 선택 - 다중 건수일 때만 표시 */}
        {requestCount > 1 && (
          <div className="flex items-center gap-4 mb-4">
            <span className="text-base font-medium text-gray-700">
              도와드릴 건수:
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={decreaseHelpCount}
                disabled={helpCount <= 1}
                className="w-10 h-10 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-blue-600 font-bold text-lg">−</span>
              </button>
              <span className="w-12 text-center font-bold text-xl text-blue-600">
                {helpCount}
              </span>
              <button
                onClick={increaseHelpCount}
                disabled={helpCount >= maxHelpCount}
                className="w-10 h-10 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-blue-600 font-bold text-lg">+</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div>
        <button
          onClick={handleAccept}
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-6 rounded-2xl font-semibold text-lg transition-colors duration-200 border border-blue-200"
          disabled={loadingStates.isAccepting}
        >
          {loadingStates.isAccepting
            ? '처리중...'
            : `${helpCount}건 도와드릴게요`}
        </button>
      </div>
    </div>
  );
};

export default HelpRequestCard;
