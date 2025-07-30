import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUpdateOfferHelp, type OfferHelpResponse } from '../useOfferHelp';
import { formatToKoreanTime } from '../../../shared/utils/formatToKoreanTime';
import { useToast } from '../../../shared/components/ui/Toast';
import { ParkingStatus } from '../../../shared/types/parkingStatus';
import { Service } from '../../../shared/types/servieType';

interface Props {
  offer: OfferHelpResponse;
}

const HelpOfferCard: React.FC<Props> = ({ offer }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const updateOfferHelp = useUpdateOfferHelp();
  const [helpCount, setHelpCount] = useState(1); // 도움 받을 건수 상태 추가

  // 로컬 로딩 상태 관리
  const [loadingStates, setLoadingStates] = useState({
    isRequesting: false,
    isMarkingComplete: false,
    isRemoving: false,
    isCancelingAcceptance: false,
  });

  const offerCount = offer.discountTotalCount - offer.discountApplyCount; // 제안 건수
  const maxHelpCount = Math.min(offerCount, 3); // 최대 도움 받을 수 있는 건수

  // 사용 가능한 제안이 없으면 렌더링하지 않음
  if (offerCount === 0) {
    return null;
  }

  // 도움 제안 요청 처리
  const handleRequest = async () => {
    if (!user) return;

    // 차량 정보 확인
    if (!user.carNumber) {
      showError(
        '차량 정보 없음',
        '등록된 차량이 없습니다. 주차 등록 사이트에서 차량을 등록한 후 다시 시도해주세요.'
      );
      return;
    }

    setLoadingStates((prev) => ({ ...prev, isRequesting: true }));
    try {
      const waitingDetails = offer.helpOfferDetail.filter(
        (detail) => detail.reqDetailStatus === ParkingStatus.WAITING
      );

      // helpCount만큼만 선택해서 업데이트
      const detailsToUpdate = waitingDetails.slice(0, helpCount);

      // 각 detail의 정보를 배열로 구성
      const helpOfferDetail = detailsToUpdate.map((detail) => ({
        id: detail.id,
        status: ParkingStatus.REQUEST,
        reqMemberId: user.memberId,
        discountApplyDate: new Date().toISOString(),
        discountApplyType: Service.NONE,
        requestDate: new Date().toISOString(),
      }));

      await updateOfferHelp.mutateAsync({
        id: offer.id,
        data: {
          status: ParkingStatus.WAITING,
          helpOfferDetail: helpOfferDetail,
        },
      });

      showSuccess('요청 완료', '도움 제안을 요청했습니다.');
      setHelpCount(1); // helpCount를 1로 초기화
    } catch (error) {
      showError('요청 실패', '도움 제안 요청에 실패했습니다.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, isRequesting: false }));
    }
  };

  // 도움 받을 건수 증가/감소
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
            <span className="text-sm">
              {(offer.helper?.name || '사용자').charAt(0)}
            </span>
          </div>
          <span className="font-semibold text-gray-800">
            {offer.helper?.name || '사용자'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <span className="text-xs">🕐</span>
          <span>{formatToKoreanTime(offer.helperServiceDate)}</span>
        </div>
      </div>

      {/* 메인 내용 */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          등록 도움 제안 <span className="text-green-600">{offerCount}건</span>
        </h3>
        {/* 도움 받을 건수 선택 - 다중 건수일 때만 표시 */}
        {offerCount > 1 && (
          <div className="flex items-center gap-4 mb-4">
            <span className="text-base font-medium text-gray-700">
              도움 받을 건수:
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={decreaseHelpCount}
                disabled={helpCount <= 1}
                className="w-10 h-10 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-green-600 font-bold text-lg">−</span>
              </button>
              <span className="w-12 text-center font-bold text-xl text-green-600">
                {helpCount}
              </span>
              <button
                onClick={increaseHelpCount}
                disabled={helpCount >= maxHelpCount}
                className="w-10 h-10 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-green-600 font-bold text-lg">+</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div>
        <button
          onClick={handleRequest}
          className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-4 px-6 rounded-2xl font-semibold text-lg transition-colors duration-200 border border-green-200"
          disabled={loadingStates.isRequesting}
        >
          {loadingStates.isRequesting
            ? '처리중...'
            : `${helpCount}건 부탁드릴게요`}
        </button>
      </div>
    </div>
  );
};

export default HelpOfferCard;
