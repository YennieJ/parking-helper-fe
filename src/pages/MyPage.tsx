import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';

const MyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    carNumber: user?.carNumber || '',
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // 여기에 실제 API 호출 로직 추가
      // await updateProfile(editData);

      showSuccess('프로필 수정 완료', '개인정보가 업데이트되었습니다.');
      setIsEditing(false);
    } catch (error) {
      showError('프로필 수정 실패', '개인정보 업데이트에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditData({
      carNumber: user?.carNumber || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-primary-50 h-[calc(100vh-5rem)]">
      {/* 헤더 - 고정 */}
      <Header
        title="내 페이지"
        rightAction={{
          icon: '🚪',
          onClick: () => setShowLogoutModal(true),
        }}
      />

      <div className="p-3">
        {/* 사용자 프로필 카드 */}
        <div className="card">
          {/* 헤더 */}
          <div className="text-center mb-3">
            <div className="size-10 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">내 정보</h2>
            <p className="text-gray-600 text-sm">
              개인정보를 확인하고 수정할 수 있습니다
            </p>
          </div>

          {/* 정보 표시 모드 */}
          {!isEditing && (
            <div className="space-y-3">
              {/* 사원번호 */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  사원번호
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.employeeNumber}
                </div>
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  이름
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.name}
                </div>
              </div>

              {/* 차량번호 */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  차량번호
                </label>
                <div className="input-field bg-gray-100 text-gray-500">
                  {user.carNumber}
                </div>
              </div>

              {/* 수정 버튼 */}
              <div className="pt-1">
                <button onClick={handleEdit} className="btn-primary w-full">
                  <span className="mr-2">✏️</span>
                  차량번호 수정하기
                </button>
              </div>
            </div>
          )}

          {/* 편집 모드 */}
          {isEditing && (
            <div className="space-y-3">
              {/* 사원번호 (읽기 전용) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  사원번호
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.employeeNumber}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  사원번호는 변경할 수 없습니다.
                </p>
              </div>

              {/* 이름 (읽기 전용) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  이름
                </label>
                <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed">
                  {user.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  이름은 변경할 수 없습니다.
                </p>
              </div>

              {/* 차량번호 (편집 가능) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  차량번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.carNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, carNumber: e.target.value })
                  }
                  className="input-field"
                  placeholder="12가 3456"
                />
                <p className="text-xs text-gray-500 mt-1">예: 12가 3456</p>
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3 pt-1">
                <button onClick={handleCancel} className="btn-outline flex-1">
                  취소
                </button>
                <button onClick={handleSave} className="btn-primary flex-1">
                  저장하기
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
