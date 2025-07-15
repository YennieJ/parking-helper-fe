import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCreateRequestHelp } from '../hooks/useRequestHelp';
import { useToast } from '../components/Toast';
import { MESSAGES } from '../utils/messages';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorDisplay from './common/ErrorDisplay';

interface Props {
  onClose: () => void;
}

const AddRequestModal: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const createRequestHelp = useCreateRequestHelp();
  const { showSuccess } = useToast();
  const { error, handleError, clearError } = useErrorHandler();

  const handleSubmit = () => {
    clearError(); // 에러 메시지 초기화
    createRequestHelp.mutate(
      {
        helpReqMemId: user?.memberId || 0,
        carId: user?.carId || 0,
      },
      {
        onSuccess: () => {
          showSuccess('등록 완료', MESSAGES.HELP_REQUEST.CREATED);
          onClose();
        },
        onError: (error: any) => {
          handleError(error);
        },
      }
    );
  };

  const isButtonDisabled = createRequestHelp.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">🆘</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              도움 요청하기
            </h2>
            <div className="text-sm text-gray-600 mb-4">
              내 차량: {user?.carNumber} ({user?.memberName})
            </div>
            <p className="text-gray-700">주차 도움이 필요하신가요?</p>
          </div>

          {/* 에러 메시지 표시 */}
          <ErrorDisplay error={error} className="mb-4" />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isButtonDisabled}
              className="btn-outline flex-1 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isButtonDisabled ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  요청중...
                </div>
              ) : (
                '요청하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRequestModal;
