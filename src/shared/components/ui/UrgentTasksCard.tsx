import { useEffect, useState } from 'react';
import { useMyInfo } from '../../../features/member/useMember';
import { useUpdateOfferHelp } from '../../../features/offer/useOfferHelp';
import { useRequestHelp } from '../../../features/request/useRequestHelp';
import { useUpdateRequestHelpDetail } from '../../../features/requestDetail/useRequestHelpDetail';
import CardContainer from './CardContiner';
import { Service, type ServiceType } from '../../../shared/types/servieType';
import { ParkingStatus } from '../../../shared/types/parkingStatus';
import { useToast } from './Toast';
import type { User } from '../../../contexts/AuthContext';
import CompleteConfirmationModal from './CompleteConfirmationModal';
import { useQueryClient } from '@tanstack/react-query';

// 태스크 타입 enum 정의
const TaskType = {
  ACCEPTED_REQUEST: 'accepted_request',
  APPROVED_OFFER: 'approved_offer',
} as const;

export const UrgentTasksCard = ({ user }: { user: User | null }) => {
  const { data: myInfo } = useMyInfo();
  const { data: requestHelpData } = useRequestHelp();
  const updateRequestHelpDetail = useUpdateRequestHelpDetail();
  const updateOfferHelp = useUpdateOfferHelp();
  const queryClient = useQueryClient();

  // 일괄 처리를 위한 상태
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  // 각 태스크의 선택된 할인 타입 상태 (기본값: 카페)
  const [selectedDiscountTypes, setSelectedDiscountTypes] = useState<{
    [key: string]: ServiceType;
  }>({});
  // 확인 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { showError, showSuccess } = useToast();

  // 실제 데이터 사용 (myInfo가 배열로 오므로 첫 번째 요소 사용)
  const displayMyInfo = Array.isArray(myInfo) ? myInfo[0] : myInfo;

  // 1. 내가 수락한 다른 사람의 요청들 (내가 helper인 경우) - requestHelp에서 가져오기
  const myAcceptedTasks =
    requestHelpData?.flatMap((request) =>
      request.helpDetails
        .filter(
          (detail) =>
            detail.helper?.id === user?.memberId &&
            detail.reqDetailStatus === ParkingStatus.REQUEST
        )
        .map((detail) => ({
          ...request,
          detail,
          id: `request-${request.id}-${detail.id}`,
          type: TaskType.ACCEPTED_REQUEST,
          user: request.helpRequester.helpRequesterName,
          carNumber:
            request.helpRequester.reqHelpCar?.carNumber || '차량번호 없음',
          time: new Date(request.reqDate).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
    ) || [];

  // 2. 내가 승인해서 처리해야 할 제안들 (오늘 날짜만)
  const myApprovedOffers =
    displayMyInfo?.helpOfferHistory?.flatMap((offer: any) =>
      offer.helpOfferDetail
        .filter(
          (detail: any) =>
            detail.helpRequester &&
            detail.reqDetailStatus === ParkingStatus.REQUEST
        )
        .map((detail: any) => ({
          id: `approved-${offer.id}-${detail.id}`,
          type: TaskType.APPROVED_OFFER,
          user: detail.helpRequester?.helpRequesterName,
          carNumber:
            detail.helpRequester?.reqHelpCar?.carNumber || '차량번호 없음',
          time: detail.discountApplyDate
            ? new Date(detail.discountApplyDate).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '시간 미확인',
          offerId: offer.id,
          detailId: detail.id,
          reqDate: detail.discountApplyDate || offer.helperServiceDate,
        }))
    ) || [];

  // 오늘 날짜 필터링
  const today = new Date();
  const todayString = today.toDateString();

  const todayAcceptedTasks = myAcceptedTasks.filter((task: any) => {
    const taskDate = new Date(task.reqDate);
    return taskDate.toDateString() === todayString;
  });

  const todayApprovedOffers = myApprovedOffers.filter((task: any) => {
    const taskDate = new Date(task.reqDate);
    return taskDate.toDateString() === todayString;
  });

  // 모든 처리할 일을 하나로 합치기 (오늘 날짜만)
  const urgentTasks = [...todayAcceptedTasks, ...todayApprovedOffers];

  // urgentTasks가 변경될 때 기본값 설정
  useEffect(() => {
    const newDefaultValues: { [key: string]: ServiceType } = {};
    urgentTasks.forEach((task) => {
      if (!selectedDiscountTypes[task.id]) {
        newDefaultValues[task.id] = Service.CAFE;
      }
    });

    if (Object.keys(newDefaultValues).length > 0) {
      setSelectedDiscountTypes((prev) => ({
        ...prev,
        ...newDefaultValues,
      }));
    }
  }, [urgentTasks]);

  // 일괄 처리 관련 함수들
  const acceptedRequests = urgentTasks.filter(
    (task) =>
      task.type === TaskType.ACCEPTED_REQUEST ||
      task.type === TaskType.APPROVED_OFFER
  );

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === acceptedRequests.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(acceptedRequests.map((task) => task.id));
    }
  };

  const handleBatchComplete = async () => {
    // 선택된 태스크들을 타입별로 분리
    const selectedRequestTasks = urgentTasks.filter(
      (task) =>
        selectedTasks.includes(task.id) &&
        task.type === TaskType.ACCEPTED_REQUEST
    );

    const selectedOfferTasks = urgentTasks.filter(
      (task) =>
        selectedTasks.includes(task.id) && task.type === TaskType.APPROVED_OFFER
    );

    const totalTasks = selectedRequestTasks.length + selectedOfferTasks.length;
    if (totalTasks === 0) return;

    try {
      // 모든 mutation을 Promise 배열로 생성
      const requestPromises = selectedRequestTasks.map((task) => {
        const getServiceType =
          selectedDiscountTypes[task.id] === Service.CAFE
            ? Service.CAFE
            : Service.RESTAURANT;

        return updateRequestHelpDetail.mutateAsync({
          detailId: task.detail.id,
          discountApplyType: getServiceType,
          reqDetailStatus: ParkingStatus.COMPLETED,
          helperMemId: user?.memberId || 0,
        });
      });

      const offerPromises = selectedOfferTasks.map((task) => {
        const getServiceType =
          selectedDiscountTypes[task.id] === Service.CAFE
            ? Service.CAFE
            : Service.RESTAURANT;

        return updateOfferHelp.mutateAsync({
          id: task.offerId,
          data: {
            status: ParkingStatus.COMPLETED,
            helpOfferDetail: [
              {
                id: task.detailId,
                status: ParkingStatus.COMPLETED,
                reqMemberId: user?.memberId || 0,
                discountApplyDate: new Date().toISOString(),
                discountApplyType: getServiceType,
                requestDate: new Date().toISOString(),
              },
            ],
          },
        });
      });

      // 모든 Promise를 병렬로 실행
      await Promise.all([...requestPromises, ...offerPromises]);

      // 성공 처리
      showSuccess(
        '도움 완료',
        `${totalTasks}개의 도움 요청이 성공적으로 처리되었습니다.`
      );

      // 일괄 처리 완료 후 랭킹 업데이트
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    } catch (error) {
      // 실패 처리
      showError('도움 실패', '일부 도움 요청 처리 중 오류가 발생했습니다.');
    } finally {
      // 선택 초기화
      setSelectedTasks([]);
      setShowConfirmModal(false);
    }
  };

  const handleBatchCompleteConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleBatchCompleteCancel = () => {
    setShowConfirmModal(false);
  };

  const handleBatchCancel = () => {
    // 제안이 포함된 태스크가 있는지 확인
    const hasOfferTasks = selectedTasks.some((taskId) => {
      const task = urgentTasks.find((t) => t.id === taskId);
      return task?.type === TaskType.APPROVED_OFFER;
    });

    if (hasOfferTasks) {
      showError('취소 불가', '나의 제안에 부탁한 요청은 취소할 수 없습니다');
      return;
    }

    // 선택된 태스크들을 찾아서 각각 API 호출
    const selectedTaskObjects = urgentTasks.filter(
      (task) =>
        selectedTasks.includes(task.id) &&
        task.type === TaskType.ACCEPTED_REQUEST
    );

    // 각 태스크에 대해 업데이트 API 호출 (수락 취소)
    selectedTaskObjects.forEach((task) => {
      updateRequestHelpDetail.mutate(
        {
          detailId: task.detail.id,
          discountApplyType: Service.NONE, // 기본값
          reqDetailStatus: ParkingStatus.WAITING, // 수락 취소 = 대기 상태로 변경
          helperMemId: 0, // 헬퍼 ID 제거
        },
        {
          onSuccess: () => {
            showSuccess(
              '일괄 수락 취소',
              `${selectedTaskObjects.length}개의 도움 요청 수락이 취소되었습니다.`
            );
          },
          onError: () => {
            showError(
              '수락 취소 실패',
              '일부 도움 요청 수락 취소 중 오류가 발생했습니다.'
            );
          },
        }
      );
    });

    // 선택 초기화
    setSelectedTasks([]);
  };
  return (
    <CardContainer>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🔔 지금 처리할 일
        </h2>
      </div>
      {urgentTasks.length > 0 && (
        <div className="border border-gray-100 px-3 bg-gray-50 rounded-lg p-2 mb-2 flex items-center justify-between font-semibold text-base text-gray-500 ">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4"
              checked={
                selectedTasks.length === urgentTasks.length &&
                urgentTasks.length > 0
              }
              onChange={handleSelectAll}
            />
            <span>전체 선택</span>
          </label>
          <span>
            {selectedTasks.length} / {urgentTasks.length} 선택됨
          </span>
        </div>
      )}

      <div className="space-y-3">
        {urgentTasks.map((task: any) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border-l-4 ${
              task.type === TaskType.ACCEPTED_REQUEST
                ? 'bg-blue-50 border-blue-500'
                : 'bg-green-50 border-green-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {(task.type === TaskType.ACCEPTED_REQUEST ||
                  task.type === TaskType.APPROVED_OFFER) && (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      id={`checkbox-${task.id}`}
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleTaskSelect(task.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                )}

                <label htmlFor={`checkbox-${task.id}`} className="flex-1">
                  {/* 이름 */}
                  <div className="font-bold text-gray-800 mb-2 text-base">
                    {task.user}님{' '}
                    <span className="text-sm text-gray-500">
                      {task.type === TaskType.ACCEPTED_REQUEST}
                    </span>
                  </div>

                  {/* 차량번호 */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-white">
                      <span className="text-red-500 text-base">🚗</span>
                      <span className="text-sm font-semibold">
                        {task.carNumber ? task.carNumber : '차량번호 없음'}
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              {/* 오른쪽: 시간과 선택 */}
              <div className="flex flex-col items-end gap-3">
                {/* 시간 표시 */}
                <div className="text-sm text-gray-500">{task.time}</div>

                {/* 카페/식당 선택 토글 */}
                <div className="relative">
                  <div className="bg-gray-200 rounded-full p-1 flex items-center">
                    <button
                      type="button"
                      className={`flex-1 px-2 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                        selectedDiscountTypes[task.id] === Service.CAFE
                          ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedDiscountTypes((prev) => ({
                          ...prev,
                          [task.id]: Service.CAFE,
                        }));
                      }}
                    >
                      <span className="text-xs">☕</span>
                      <span className="text-xs">카페</span>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-2 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1 min-w-0 ${
                        selectedDiscountTypes[task.id] === Service.RESTAURANT
                          ? 'bg-white text-orange-600 shadow-sm transform scale-105'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedDiscountTypes((prev) => ({
                          ...prev,
                          [task.id]: Service.RESTAURANT,
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

        {urgentTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">😌</div>
            <div>처리할 일이 없습니다</div>
          </div>
        )}

        {/* 하단 액션 버튼들 */}
        {urgentTasks.length > 0 && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleBatchCancel}
              disabled={
                selectedTasks.length === 0 ||
                updateRequestHelpDetail.isPending || // 업데이트 API 호출 시 대기 상태
                !selectedTasks.some((taskId) => {
                  const task = urgentTasks.find((t) => t.id === taskId);
                  return task?.type === TaskType.ACCEPTED_REQUEST;
                })
              }
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              {updateRequestHelpDetail.isPending
                ? '처리 중...'
                : '선택된 요청 취소'}
            </button>
            <button
              onClick={handleBatchCompleteConfirm}
              disabled={
                selectedTasks.length === 0 ||
                updateRequestHelpDetail.isPending ||
                updateOfferHelp.isPending
              }
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              {updateRequestHelpDetail.isPending || updateOfferHelp.isPending
                ? '처리 중...'
                : '선택된 요청 처리'}
            </button>
          </div>
        )}

        {/* 확인 모달 */}
        {showConfirmModal && (
          <CompleteConfirmationModal
            selectedTasks={urgentTasks.filter((task) =>
              selectedTasks.includes(task.id)
            )}
            onCancel={handleBatchCompleteCancel}
            onConfirm={handleBatchComplete}
            isLoading={
              updateRequestHelpDetail.isPending || updateOfferHelp.isPending
            }
          />
        )}
      </div>
    </CardContainer>
  );
};
