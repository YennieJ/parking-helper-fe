import React, { useState } from 'react';

interface Props {
  selectedTasks: any[];
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: any;
}

const CompleteConfirmationModal: React.FC<Props> = ({
  selectedTasks,
  onCancel,
  onConfirm,
  isLoading = false,
  error,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = async () => {
    if (!isChecked) return;
    onConfirm();
  };

  const getModalContent = () => {
    return {
      icon: '🤝',
      title: '도움 완료 확인',
      description: `${selectedTasks.length}개의 요청을 처리하시겠습니까?`,
      checkboxText: '선택된 요청들을 완료 처리합니다.',
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
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg mt-0.5">⚠️</span>
              <div className="text-sm text-green-800">
                <div className="font-semibold mb-1">처리 전 확인사항</div>
                <ul className="space-y-1 text-xs">
                  <li>• 실제로 모든 주차 도움이 이루어졌는지 확인</li>
                  <li>• 처리 후에는 개별 취소할 수 없습니다</li>
                  <li>• 이달의 사원 점수에 반영됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-lg mt-0.5">❌</span>
                <div className="text-sm text-red-800">
                  <div className="font-semibold mb-1">오류가 발생했습니다</div>
                  <div className="text-xs">
                    {error.message || '알 수 없는 오류가 발생했습니다.'}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              disabled={isLoading}
              className="btn-outline flex-1 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isChecked || isLoading}
              className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 min-h-[48px] ${
                isChecked && !isLoading
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
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
        </div>
      </div>
    </div>
  );
};

export default CompleteConfirmationModal;
