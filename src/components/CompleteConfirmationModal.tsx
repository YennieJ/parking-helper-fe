import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateRequestHelp } from '../hooks/useRequestHelp';
import { useToast } from './Toast';
import { createMessage } from '../utils/messages';
import { RequestStatus } from '../types/requestStatus';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorDisplay from './common/ErrorDisplay';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  requestId: number;
  requesterName?: string;
  carNumber?: string;
  onCancel: () => void;
}

const CompleteConfirmationModal: React.FC<Props> = ({
  requestId,
  requesterName,
  carNumber,
  onCancel,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const updateRequestHelp = useUpdateRequestHelp();
  const { showSuccess } = useToast();
  const { error, handleError, clearError } = useErrorHandler();
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = async () => {
    if (!isChecked) return;

    clearError();
    try {
      await updateRequestHelp.mutateAsync({
        id: requestId,
        data: {
          status: RequestStatus.COMPLETED,
          helperMemId: user?.memberId || null,
        },
      });

      const message = createMessage.helpRequest.completed();
      showSuccess(message.title, message.message);

      queryClient.invalidateQueries({ queryKey: ['ranking'] });

      onCancel();
    } catch (error) {
      handleError(error);
    }
  };

  const getModalContent = () => {
    // 내가 도움을 줬을 때만 사용
    return {
      icon: '🤝',
      title: '주차 도움 완료 확인',
      description: `${requesterName}님(${carNumber})의 주차를 도와드리셨나요?`,
      checkboxText: '주차 도움을 완료했습니다.',
      confirmText: '완료 처리',
    };
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="p-8">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{content.icon}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              {content.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-lg mt-0.5">⚠️</span>
              <div className="text-sm text-yellow-800">
                <div className="font-semibold mb-1">완료 처리 전 확인사항</div>
                <ul className="space-y-1 text-xs">
                  <li>• 실제로 주차 도움이 이루어졌는지 확인</li>
                  <li>• 완료 처리 후에는 취소할 수 없습니다</li>
                  <li>• 이달의 사원 점수에 반영됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          <ErrorDisplay error={error} className="mb-4" />

          {/* 확인 체크박스 */}
          <div className="mb-6">
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isChecked
                  ? 'bg-primary-50 border-primary-300 text-primary-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  {isChecked && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <span className="font-medium text-sm leading-relaxed">
                {content.checkboxText}
              </span>
            </label>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={updateRequestHelp.isPending}
              className="btn-outline flex-1 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isChecked || updateRequestHelp.isPending}
              className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 min-h-[48px] ${
                isChecked && !updateRequestHelp.isPending
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {updateRequestHelp.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  처리 중...
                </div>
              ) : (
                <>
                  <span className="mr-2">🎉</span>
                  {content.confirmText}
                </>
              )}
            </button>
          </div>

          {/* 추가 안내 */}
          {/* <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              완료 처리 시 양측 모두에게 알림이 전송됩니다
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CompleteConfirmationModal;
