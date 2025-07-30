import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import ErrorDisplay from '../../../shared/components/common/ErrorDisplay';
import { useCreateOfferHelp } from '../useOfferHelp';
import { MESSAGES } from '../../../shared/utils/messages';

interface Props {
  onClose: () => void;
}

const AddOfferModal: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const createOfferHelp = useCreateOfferHelp();
  const { showSuccess } = useToast();
  const { error, handleError, clearError } = useErrorHandler();

  // 제안 건수 상태 관리 (1-3건)
  const [offerCount, setOfferCount] = useState(1);

  // 제안 건수 증가
  const handleIncrease = () => {
    if (offerCount < 3) {
      setOfferCount(offerCount + 1);
    }
  };

  // 제안 건수 감소
  const handleDecrease = () => {
    if (offerCount > 1) {
      setOfferCount(offerCount - 1);
    }
  };

  const handleSubmit = () => {
    clearError(); // 에러 메시지 초기화
    createOfferHelp.mutate(
      {
        helpReqMemId: user?.memberId || 0,
        totalDisCount: offerCount,
      },
      {
        onSuccess: () => {
          showSuccess('등록 완료', MESSAGES.HELP_OFFER.CREATED);
          onClose();
        },
        onError: (error: any) => {
          handleError(error);
        },
      }
    );
  };

  const isButtonDisabled = createOfferHelp.isPending;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 헤더 섹션 */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl">😇🪽</span>
              도와드릴게요
            </h2>

            {/* 설명 텍스트 */}
            <div className="flex items-start justify-center">
              <span className="text-green-500 mr-2 text-lg">💡</span>
              <p className="text-sm text-gray-600 text-left leading-relaxed">
                카페나 식당 이용 후 동료들의 차량 등록을 도와드리는 기능입니다.
              </p>
            </div>
          </div>

          {/* 도움 제안 건수 섹션 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
              도움 제안 건수
            </h3>

            <div className="flex items-center justify-center space-x-6">
              {/* 감소 버튼 */}
              <button
                onClick={handleDecrease}
                disabled={offerCount <= 1}
                className="w-12 h-12 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-green-600 font-bold text-xl">-</span>
              </button>

              {/* 건수 표시 */}
              <div className="text-center min-w-[100px]">
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {offerCount}건
                </div>
                <div className="text-xs text-green-500">
                  최대 3건까지 제안 가능
                </div>
              </div>

              {/* 증가 버튼 */}
              <button
                onClick={handleIncrease}
                disabled={offerCount >= 3}
                className="w-12 h-12 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-green-600 font-bold text-xl">+</span>
              </button>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <span className="text-green-500 mr-2 text-sm">ℹ️</span>
              <p className="text-xs text-green-700 leading-relaxed">
                제안 후 진행 상황은 하단{' '}
                <span className="font-semibold">현황</span> 탭에서 확인할 수
                있어요.
              </p>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          <ErrorDisplay error={error} className="mb-4" />

          {/* 도움 제안하기 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md"
          >
            {isButtonDisabled ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                제안중...
              </div>
            ) : (
              `${offerCount}건 도움 제안하기`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOfferModal;
