import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../shared/components/ui/Toast';
import { useUpdateMember } from '../features/member/useMember';
import Header from '../shared/components/layout/Header';
import LogoutIcon from '../shared/components/icons/LogoutIcon';

/**
 * 내 페이지 컴포넌트
 * 사용자 정보 조회 및 차량번호 수정 기능을 제공
 */
const MyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const { mutate: updateMember, isPending } = useUpdateMember();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    carNumber: user?.carNumber || '',
  });
  const [carNumberError, setCarNumberError] = useState('');

  /**
   * 차량번호 유효성 검사 정규식
   */
  const carNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/;

  if (!user) return null;

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  /**
   * 편집 모드 시작
   */
  const handleEdit = () => {
    setIsEditing(true);
    setCarNumberError('');
  };

  /**
   * 차량번호 유효성 검사
   * @param carNumber - 검사할 차량번호
   * @returns 유효성 여부
   */
  const validateCarNumber = (carNumber: string): boolean => {
    const cleanCarNumber = carNumber.replace(/\s/g, '');
    return carNumberRegex.test(cleanCarNumber);
  };

  /**
   * 저장 처리
   */
  const handleSave = async () => {
    try {
      if (
        isCarNumberChanged &&
        editData.carNumber &&
        !validateCarNumber(editData.carNumber)
      ) {
        setCarNumberError(
          '올바른 차량번호 형식으로 입력해주세요. (예: 12가3456)'
        );
        return;
      }

      if (isCarNumberChanged && editData.carNumber) {
        updateMember(
          {
            id: user.memberId.toString(),
            data: { carNumber: editData.carNumber },
          },
          {
            onSuccess: () => {
              showSuccess(
                '차량번호 수정 완료',
                '차량번호가 업데이트되었습니다.'
              );
              setIsEditing(false);
              setCarNumberError('');
            },
            onError: () => {
              showError(
                '차량번호 수정 실패',
                '차량번호 업데이트에 실패했습니다.'
              );
            },
          }
        );
      } else {
        setIsEditing(false);
        setCarNumberError('');
      }
    } catch (error) {
      showError('차량번호 수정 실패', '차량번호 업데이트에 실패했습니다.');
    }
  };

  /**
   * 편집 취소 처리
   */
  const handleCancel = () => {
    setEditData({
      carNumber: user?.carNumber || '',
    });
    setIsEditing(false);
    setCarNumberError('');
  };

  /**
   * 차량번호 입력 변경 처리
   */
  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    value = value.replace(/\s/g, '');

    setEditData({ ...editData, carNumber: value });

    if (carNumberError) {
      setCarNumberError('');
    }
  };

  /**
   * 차량번호 변경 여부 확인
   */
  const isCarNumberChanged = editData.carNumber !== (user?.carNumber || '');

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50 h-[calc(100vh-5rem)]">
      <Header
        title="내 페이지"
        rightAction={{
          icon: <LogoutIcon size={24} />,
          onClick: () => setShowLogoutModal(true),
        }}
      />

      <div className="p-3 md:max-w-[700px] mx-auto">
        <div className="card">
          <div className="text-center mb-3">
            <div className="size-10 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">내 정보</h2>
            <p className="text-gray-600 text-sm">
              개인정보를 확인하고 수정할 수 있습니다
            </p>
          </div>

          {!isEditing && (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  사원번호
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.memberLoginId}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  이름
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.memberName}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  차량번호
                </label>
                <div className="input-field bg-gray-100 text-gray-500 min-h-[44px] flex items-center">
                  {user.carNumber || '등록된 차량번호가 없습니다'}
                </div>
              </div>

              <div className="pt-1">
                <button onClick={handleEdit} className="btn-primary w-full">
                  <span className="mr-2">✏️</span>
                  차량번호 수정하기
                </button>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  사원번호
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.memberLoginId}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  사원번호는 변경할 수 없습니다.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  이름
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.memberName}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  이름은 변경할 수 없습니다.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  차량번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.carNumber}
                  onChange={handleCarNumberChange}
                  className={`input-field ${
                    carNumberError ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="12가3456"
                />
                {carNumberError && (
                  <p className="text-xs text-red-500 mt-1">{carNumberError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  형식: 숫자2-3자리 + 한글1자리 + 숫자4자리 (예: 12가3456,
                  123나4567)
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={handleCancel} className="btn-outline flex-1">
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isCarNumberChanged || isPending}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">로그아웃</h2>
              <p className="text-gray-600 mb-8">정말 로그아웃 하시겠습니까?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="btn-outline flex-1"
                >
                  취소
                </button>
                <button onClick={handleLogout} className="btn-danger flex-1">
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
