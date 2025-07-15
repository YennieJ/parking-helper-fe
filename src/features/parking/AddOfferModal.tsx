import React from 'react';

interface Props {
  onClose: () => void;
  onSubmit: (data: { userName: string }) => void;
  isLoading: boolean;
}

const AddOfferModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  // 임시 사용자 정보 (실제로는 로그인된 사용자 정보를 가져와야 함)
  const currentUser = {
    name: '김철수',
  };

  const handleSubmit = () => {
    onSubmit({
      userName: currentUser.name,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">🙋‍♂️</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              도움 제안하기
            </h2>
            <div className="text-sm text-gray-600 mb-4">
              {currentUser.name}님
            </div>
            <p className="text-gray-700">주차 도움을 주실 수 있나요?</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">
              취소
            </button>
            <button onClick={handleSubmit} className="btn-secondary flex-1">
              제안하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOfferModal;
