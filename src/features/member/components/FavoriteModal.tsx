import React, { useState, useEffect } from 'react';
import { useToast } from '../../../shared/components/ui/Toast';
import { useMembers } from '../useMember';
import {
  type FavoriteMember,
  useUpdateFavoriteMembers,
} from '../../favorites/useFavorites';

interface FavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteMembers: FavoriteMember[];
  favoritesLoading: boolean;
  memberId: number;
}

const FavoriteModal: React.FC<FavoriteModalProps> = ({
  isOpen,
  onClose,
  favoriteMembers,
  favoritesLoading,
  memberId,
}) => {
  const { showSuccess, showError } = useToast();
  const [selectedFavorites, setSelectedFavorites] = useState<number[]>([]);
  const { data: members, isLoading: usersLoading } = useMembers();
  const { mutate: updateFavoriteMembers, isPending } =
    useUpdateFavoriteMembers();

  // 모달이 열릴 때 현재 즐겨찾기 상태로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedFavorites(
        favoriteMembers?.map((member) => member.favoriteMemberId) ?? []
      );
    }
  }, [isOpen, favoriteMembers]);

  const handleToggleFavorite = (userId: number) => {
    setSelectedFavorites((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    updateFavoriteMembers(
      {
        memberId: memberId,
        data: {
          favoriteMemberIds: selectedFavorites,
        },
      },
      {
        onSuccess: () => {
          showSuccess('즐겨찾기 저장 완료', '즐겨찾기가 업데이트되었습니다.');
          onClose();
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            '즐겨찾기 업데이트에 실패했습니다.';
          showError('즐겨찾기 저장 실패', errorMessage);
        },
      }
    );
  };

  const hasChanges = () => {
    const currentIds = favoriteMembers
      ?.map((member) => member.favoriteMemberId)
      .sort();
    const selectedIds = selectedFavorites.sort();
    return JSON.stringify(currentIds) !== JSON.stringify(selectedIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">즐겨찾기 관리</h2>
              <p className="text-sm text-gray-500">
                자주 도움을 주는 사람들을 선택하세요
              </p>
            </div>
          </div>
        </div>

        {/* 사용자 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          {usersLoading || favoritesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">
                데이터를 불러오는 중...
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {members
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      selectedFavorites.includes(user.id)
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleToggleFavorite(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                        <span className="text-sm">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.cars?.[0]?.carNumber || '차량번호 없음'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg transition-all duration-200 ${
                          selectedFavorites.includes(user.id)
                            ? 'text-yellow-500 scale-110'
                            : 'text-gray-300'
                        }`}
                      >
                        {selectedFavorites.includes(user.id) ? '⭐' : '☆'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges() || isPending}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? '저장 중...' : '완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteModal;
