import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSubmit: (data: { helpReqMemId: number; carId: number }) => void;
  isLoading: boolean;
}

const AddRequestModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const { user } = useAuth();

  const handleSubmit = () => {
    onSubmit({
      helpReqMemId: user?.memberId || 0,
      carId: user?.carId || 0,
    });
  };

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

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">
              취소
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1">
              요청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRequestModal;
