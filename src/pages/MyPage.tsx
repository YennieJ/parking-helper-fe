import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../shared/components/ui/Toast';
import { useUpdateMember } from '../features/member/useMember';
import { useCreateCarNumber } from '../features/memberCar/useMemberCar';
import Header from '../shared/components/layout/Header';
import CardContainer from '../shared/components/ui/CardContiner';
import FavoriteModal from '../features/member/components/FavoriteModal';
import { useFavoriteMembers } from '../features/favorites/useFavorites';

/**
 * 내 페이지 컴포넌트
 * 사용자 정보 조회 및 차량번호 수정 기능을 제공
 */
const MyPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const { mutate: updateMember, isPending } = useUpdateMember();
  const { mutate: createCarNumber } = useCreateCarNumber();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [editData, setEditData] = useState({
    carNumber: user?.carNumber || '',
  });
  const [carNumberError, setCarNumberError] = useState('');
  const { data: favoriteMembers, isLoading: favoritesLoading } =
    useFavoriteMembers(user?.memberId ?? 0);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  /**
   * 차량번호 유효성 검사 정규식
   */
  const carNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/;

  if (!user) return null;

  /**
   * 편집 모달 열기
   */
  const handleEdit = () => {
    setEditData({
      carNumber: user?.carNumber || '',
    });
    setShowEditModal(true);
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

      if (isCarNumberChanged) {
        // 차량번호가 없는 경우 createCarNumber 사용
        if (!user.carNumber) {
          createCarNumber(
            {
              memberId: user.memberId,
              carNumber: editData.carNumber || '',
            },
            {
              onSuccess: () => {
                showSuccess('차량번호 등록 완료', '차량번호가 등록되었습니다.');
                setShowEditModal(false);
                setCarNumberError('');
                // AuthContext의 user 상태 업데이트
                updateUser({ carNumber: editData.carNumber || '' });
              },
              onError: () => {
                showError(
                  '차량번호 등록 실패',
                  '차량번호 등록에 실패했습니다.'
                );
              },
            }
          );
        } else {
          // 차량번호가 있는 경우 updateMember 사용
          updateMember(
            {
              id: user.memberId.toString(),
              data: {
                carNumber: editData.carNumber || '',
                memberName: user.memberName,
                email: user.email,
              },
            },
            {
              onSuccess: () => {
                showSuccess(
                  '차량번호 수정 완료',
                  '차량번호가 업데이트되었습니다.'
                );
                setShowEditModal(false);
                setCarNumberError('');
                // AuthContext의 user 상태 업데이트
                updateUser({ carNumber: editData.carNumber || '' });
              },
              onError: () => {
                showError(
                  '차량번호 수정 실패',
                  '차량번호 업데이트에 실패했습니다.'
                );
              },
            }
          );
        }
      } else {
        setShowEditModal(false);
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
    setShowEditModal(false);
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
    <div className="min-h-screen bg-gray-50">
      <Header
        icon="👤"
        title="마이 페이지"
        rightAction={{
          onClick: () => setShowLogoutModal(true),
          icon: '👋',
        }}
      />

      <div className="px-4 py-4 md:max-w-[700px] mx-auto space-y-6">
        <CardContainer>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">내 정보</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-500 mb-1">사원번호</div>
                <div className="font-medium text-gray-800 text-base">
                  {user.memberLoginId}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-500 mb-1">이름</div>
                <div className="font-medium text-gray-800 text-base">
                  {user.memberName}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">차량번호</div>
                <div className="font-medium text-gray-800 text-base">
                  {user.carNumber || '등록된 차량번호가 없습니다'}
                </div>
              </div>
              <button
                onClick={handleEdit}
                className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                수정
              </button>
            </div>
          </div>
        </CardContainer>

        {/* 즐겨찾기 카드 */}
        <CardContainer>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">즐겨찾기</h2>
                <p className="text-sm text-gray-500">자주 도움을 주는 사람들</p>
              </div>
            </div>
            <button
              onClick={() => setShowFavoriteModal(true)}
              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              관리
            </button>
          </div>

          <div className="space-y-3">
            {favoriteMembers && favoriteMembers.length > 0 ? (
              // 즐겨찾기가 있는 경우 - 오름차순 정렬
              favoriteMembers
                .sort((a, b) =>
                  a.favoriteMemberName.localeCompare(b.favoriteMemberName)
                )
                .map((favorite) => (
                  <div
                    key={favorite.favoriteMemberId}
                    className="flex items-center justify-between py-3 px-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <span className="text-base font-medium">
                          {favorite.favoriteMemberName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-base">
                          {favorite.favoriteMemberName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {favorite.carNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              // 즐겨찾기가 없는 경우
              <div className="text-center py-6 text-gray-500 text-base">
                즐겨찾기된 사용자가 없습니다
              </div>
            )}
          </div>
        </CardContainer>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">로그아웃</h2>
              <p className="text-gray-600 mb-8 text-base">
                정말 로그아웃 하시겠습니까?
              </p>

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

      {/* 편집 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✏️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  차량번호 수정
                </h2>
                <p className="text-gray-600 text-base">
                  차량번호를 수정할 수 있습니다
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    사원번호
                  </label>
                  <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed text-base">
                    {user.memberLoginId}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    사원번호는 변경할 수 없습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    이름
                  </label>
                  <div className="input-field bg-gray-100 text-gray-500 cursor-not-allowed text-base">
                    {user.memberName}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    이름은 변경할 수 없습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    차량번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.carNumber}
                    onChange={handleCarNumberChange}
                    className={`input-field text-base ${
                      carNumberError ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="12가3456"
                  />
                  {carNumberError && (
                    <p className="text-sm text-red-500 mt-1">
                      {carNumberError}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    형식: 숫자2-3자리 + 한글1자리 + 숫자4자리 (예: 12가3456,
                    123나4567)
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
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
            </div>
          </div>
        </div>
      )}

      {/* 즐겨찾기 관리 모달 */}
      <FavoriteModal
        isOpen={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        favoriteMembers={favoriteMembers ?? []}
        favoritesLoading={favoritesLoading}
        memberId={user?.memberId ?? 0}
      />
    </div>
  );
};

export default MyPage;
