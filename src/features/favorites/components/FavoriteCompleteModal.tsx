import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../shared/components/ui/Toast';
import { Service, type ServiceType } from '../../../shared/types/servieType';
import { useCompleteHelpOffer } from '../../offer/useOfferHelp';
import { useFavoriteMembers } from '../useFavorites';

interface Props {
  onClose: () => void;
}

const FavoriteCompleteModal: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const { mutate: completeHelpOffer, isPending } = useCompleteHelpOffer();
  const { data: favoriteMembers, isLoading } = useFavoriteMembers(
    user?.memberId ?? 0
  );

  // 선택된 멤버들
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  // 각 멤버의 선택된 서비스 타입 (기본값: 카페)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<{
    [key: number]: ServiceType;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 즐겨찾기 멤버가 변경될 때 기본값 설정
  useEffect(() => {
    if (favoriteMembers) {
      const newDefaultValues: { [key: number]: ServiceType } = {};
      favoriteMembers.forEach((member) => {
        if (!selectedServiceTypes[member.favoriteMemberId]) {
          newDefaultValues[member.favoriteMemberId] = Service.CAFE;
        }
      });

      if (Object.keys(newDefaultValues).length > 0) {
        setSelectedServiceTypes((prev) => ({
          ...prev,
          ...newDefaultValues,
        }));
      }
    }
  }, [favoriteMembers]);

  const handleMemberSelect = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (!favoriteMembers) return;

    if (selectedMembers.length === favoriteMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(
        favoriteMembers.map((member) => member.favoriteMemberId)
      );
    }
  };

  const handleSubmit = async () => {
    if (!user?.memberId) {
      showError('사용자 정보 없음', '로그인이 필요합니다.');
      return;
    }

    if (selectedMembers.length === 0) {
      showError('선택된 멤버 없음', '도움을 완료할 멤버를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 선택된 멤버들을 completeHelpOffer 형식으로 변환
      const requesters = selectedMembers.map((memberId) => ({
        requesterId: memberId,
        discountApplyType: selectedServiceTypes[memberId] || Service.CAFE,
      }));

      // API 호출
      completeHelpOffer(
        {
          helperMemId: user.memberId,
          requesters,
        },
        {
          onSuccess: () => {
            showSuccess(
              '즐겨찾기 도움 완료',
              `${selectedMembers.length}명의 즐겨찾기 도움이 성공적으로 완료되었습니다.`
            );
            onClose();
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message ||
              '즐겨찾기 도움 완료 중 오류가 발생했습니다.';
            showError('도움 완료 실패', errorMessage);
          },
        }
      );
    } catch (error) {
      showError('도움 완료 실패', '즐겨찾기 도움 완료 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || isPending;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-sm p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">
              즐겨찾기 목록을 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 헤더 섹션 */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl">⭐</span>
              즐겨찾기 도움 완료
            </h2>

            {/* 설명 텍스트 */}
            <div className="flex items-start justify-center">
              <span className="text-yellow-500 mr-2 text-lg">💡</span>
              <p className="text-sm text-gray-600 text-left leading-relaxed">
                즐겨찾기로 등록된 동료들의 차량 등록을 도와드리는 기능입니다.
              </p>
            </div>
          </div>

          {/* 즐겨찾기 멤버 목록 */}
          {favoriteMembers && favoriteMembers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-yellow-500">👥</span>
                  즐겨찾기 멤버 선택
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={
                        selectedMembers.length === favoriteMembers.length &&
                        favoriteMembers.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                    <span>전체 선택</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {favoriteMembers.map((member) => (
                  <div
                    key={member.favoriteMemberId}
                    className="p-4 rounded-lg border border-gray-200 bg-yellow-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                          <input
                            id={`checkbox-${member.favoriteMemberId}`}
                            type="checkbox"
                            checked={selectedMembers.includes(
                              member.favoriteMemberId
                            )}
                            onChange={() =>
                              handleMemberSelect(member.favoriteMemberId)
                            }
                            className="w-4 h-4 text-yellow-600 rounded"
                          />
                        </label>

                        <label
                          htmlFor={`checkbox-${member.favoriteMemberId}`}
                          className="flex-1"
                        >
                          {/* 이름 */}
                          <div className="font-bold text-gray-800 mb-2 text-base">
                            {member.favoriteMemberName}님
                          </div>

                          {/* 차량번호 */}
                          <div className="flex items-center gap-2">
                            <div className="bg-yellow-500 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-white">
                              <span className="text-red-500 text-base">🚗</span>
                              <span className="text-sm font-semibold">
                                {member.carNumber || '차량번호 없음'}
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* 오른쪽: 서비스 타입 선택 */}
                      <div className="flex flex-col items-end gap-3">
                        {/* 카페/식당 선택 토글 */}
                        <div className="relative">
                          <div className="bg-gray-200 rounded-full p-1 flex items-center">
                            <button
                              type="button"
                              className={`flex-1 px-2 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                                selectedServiceTypes[
                                  member.favoriteMemberId
                                ] === Service.CAFE
                                  ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                              onClick={() => {
                                setSelectedServiceTypes((prev) => ({
                                  ...prev,
                                  [member.favoriteMemberId]: Service.CAFE,
                                }));
                              }}
                            >
                              <span className="text-xs">☕</span>
                              <span className="text-xs">카페</span>
                            </button>
                            <button
                              type="button"
                              className={`flex-1 px-2 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                                selectedServiceTypes[
                                  member.favoriteMemberId
                                ] === Service.RESTAURANT
                                  ? 'bg-white text-orange-600 shadow-sm transform scale-105'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                              onClick={() => {
                                setSelectedServiceTypes((prev) => ({
                                  ...prev,
                                  [member.favoriteMemberId]: Service.RESTAURANT,
                                }));
                              }}
                            >
                              <span className="text-xs">🍽️</span>
                              <span className="text-xs">식당</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 즐겨찾기 멤버가 없을 때 */}
          {(!favoriteMembers || favoriteMembers.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <div>즐겨찾기로 등록된 멤버가 없습니다</div>
              <div className="text-sm mt-2">
                마이페이지에서 즐겨찾기를 등록해주세요
              </div>
            </div>
          )}

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-lg mt-0.5">⚠️</span>
              <div className="text-sm text-yellow-800">
                <div className="font-semibold mb-1">주의사항</div>
                <ul className="space-y-1 text-xs">
                  <li>• 실제로 주차 도움이 이루어졌는지 확인</li>
                  <li>• 이달의 사원 점수에 반영됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled || selectedMembers.length === 0}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isButtonDisabled ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                처리 중...
              </>
            ) : (
              <>
                <span className="text-xl">⭐</span>
                선택된 {selectedMembers.length}명 도움 완료
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCompleteModal;
