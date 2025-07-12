import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  employeeNumber: string;
  name: string;
  carNumber: string;
}

interface Props {
  user: User;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
}

const EditProfileModal: React.FC<Props> = ({ user, onClose, onSave }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    carNumber: user.carNumber,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.carNumber.trim()) {
      newErrors.carNumber = '차량번호를 입력해주세요.';
    } else if (
      !/^[0-9]{2,3}[가-힣][0-9]{4}$/.test(formData.carNumber.replace(/\s/g, ''))
    ) {
      newErrors.carNumber = '올바른 차량번호 형식이 아닙니다. (예: 12가 3456)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedData = {
        ...formData,
        carNumber: formData.carNumber
          .replace(/\s/g, '')
          .replace(/^([0-9]{2,3})([가-힣])([0-9]{4})$/, '$1$2 $3'),
      };

      updateUser(updatedData);
      onSave(updatedData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✏️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              개인정보 수정
            </h2>
            <p className="text-gray-600">정보를 업데이트해주세요</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사원번호 (읽기 전용) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                사원번호
              </label>
              <input
                type="text"
                value={user.employeeNumber}
                disabled
                className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                사원번호는 변경할 수 없습니다.
              </p>
            </div>
            {/* 이름 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                이름
              </label>
              <input
                type="text"
                value={user.name}
                disabled
                className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                이름은 변경할 수 없습니다.
              </p>
            </div>

            {/* 차량번호 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                차량번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.carNumber}
                onChange={(e) => handleInputChange('carNumber', e.target.value)}
                className={`input-field ${
                  errors.carNumber ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder="12가 3456"
                disabled={isLoading}
              />
              {errors.carNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.carNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">예: 12가 3456</p>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-outline flex-1"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </div>
                ) : (
                  '저장하기'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
