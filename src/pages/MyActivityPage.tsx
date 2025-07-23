import { useMyInfo } from '../features/member/useMember';
import { useDeleteRequestHelpDetail } from '../features/requestDetail/useRequestHelpDetail';
import Header from '../shared/components/layout/Header';
import StatusBadge from '../shared/components/ui/StatusBadge';
import DeleteConfirmModal from '../shared/components/ui/DeleteConfirmModal';
import { useState, useEffect } from 'react';
import {
  useDeleteOfferHelp,
  useUpdateOfferHelp,
} from '../features/offer/useOfferHelp';
import { useToast } from '../shared/components/ui/Toast';

const MyActivityPage = () => {
  const { isLoading } = useMyInfo();
  const { data: myInfo, isLoading: myInfoLoading } = useMyInfo();
  const deleteRequestDetail = useDeleteRequestHelpDetail();
  const deleteOfferHelpDetail = useDeleteOfferHelp();
  const { showSuccess, showError } = useToast();
  const updateOfferHelp = useUpdateOfferHelp();
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set()
  );

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'request' | 'offer' | 'offerRequest';
    id: number;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'request',
    id: 0,
    onConfirm: () => {},
  });

  // helpOfferMyRequestHistory를 requestHelpHistory와 같은 형태로 변환하는 함수
  const transformHelpOfferMyRequestHistory = (
    helpOfferMyRequestHistory: any[]
  ) => {
    if (!helpOfferMyRequestHistory || helpOfferMyRequestHistory.length === 0) {
      return [];
    }

    // helpOffer.id + requestDate별로 그룹화 (초 무시)
    const groupedByOfferAndTime = helpOfferMyRequestHistory.reduce(
      (acc: any, helpOffer: any) => {
        const offerId = helpOffer.id;

        // helpOfferDetail의 requestDate를 기준으로 그룹화 (초 무시)
        helpOffer.helpOfferDetail.forEach((detail: any) => {
          const requestDate = new Date(detail.requestDate);
          // 분까지만 사용 (초 무시)
          const timeKey = `${offerId}_${requestDate.getFullYear()}_${requestDate.getMonth()}_${requestDate.getDate()}_${requestDate.getHours()}_${requestDate.getMinutes()}`;

          if (!acc[timeKey]) {
            acc[timeKey] = {
              id: timeKey,
              reqDate: detail.requestDate,
              totalDisCount: 0,
              applyDisCount: 0,
              helpRequester: {
                id: helpOffer.helper?.id,
                helpRequesterName: helpOffer.helper?.name,
              },
              helpDetails: [],
            };
          }

          acc[timeKey].helpDetails.push({
            id: detail.id,
            reqDetailStatus: detail.reqDetailStatus,
            discountApplyType: detail.discountApplyType,
            discountApplyDate: detail.discountApplyDate,
            helper: {
              id: helpOffer.helper?.id,
              name: helpOffer.helper?.name,
            },
            helpRequester: {
              id: detail.helpRequester?.id,
              helpRequesterName: detail.helpRequester?.helpRequesterName,
            },
            offerId: offerId, // 부모 id 추가
          });
        });

        return acc;
      },
      {}
    );

    // totalDisCount와 applyDisCount를 실제 detail 개수로 계산
    Object.values(groupedByOfferAndTime).forEach((group: any) => {
      group.totalDisCount = group.helpDetails.length;
      group.applyDisCount = group.helpDetails.filter(
        (detail: any) => detail.reqDetailStatus === 'Completed'
      ).length;
    });

    const transformedData = Object.values(groupedByOfferAndTime);

    return transformedData;
  };

  // 실제 데이터 사용 (myInfo가 배열로 오므로 첫 번째 요소 사용)
  const memberData = Array.isArray(myInfo) ? myInfo[0] : myInfo;
  const displayMyInfo = memberData;

  // 변환된 helpOfferMyRequestHistory
  const transformedHelpOfferMyRequestHistory =
    transformHelpOfferMyRequestHistory(
      displayMyInfo?.helpOfferMyRequestHistory || []
    );

  // 두 목록을 합쳐서 오름차순으로 정렬
  const allRequests = [
    ...(displayMyInfo?.requestHelpHistory || []).map((request: any) => ({
      ...request,
      type: 'request',
      originalId: request.id,
    })),
    ...(transformedHelpOfferMyRequestHistory || []).map((request: any) => ({
      ...request,
      type: 'transformed',
      originalId: request.id,
    })),
  ].sort((a: any, b: any) => {
    const dateA = new Date(a.reqDate);
    const dateB = new Date(b.reqDate);
    return dateA.getTime() - dateB.getTime();
  });

  // 내가 주는 도움 목록을 합쳐서 오름차순으로 정렬
  const allGivenHelp = [
    ...(displayMyInfo?.helpOfferHistory || []).map((offer: any) => ({
      ...offer,
      type: 'offer',
      originalId: offer.id,
      reqDate: offer.helperServiceDate,
    })),
    ...(displayMyInfo?.myRequestHelpCompleteHistory || []).map(
      (request: any) => ({
        ...request,
        type: 'completed',
        originalId: request.id,
      })
    ),
  ].sort((a: any, b: any) => {
    const dateA = new Date(a.reqDate);
    const dateB = new Date(b.reqDate);
    return dateA.getTime() - dateB.getTime();
  });

  // 가장 최근 요청과 제안을 기본적으로 열어두기
  useEffect(() => {
    const expandedIds = new Set<string>();

    // 통합된 요청 목록에서 가장 최근 요청 찾기
    if (allRequests && allRequests.length > 0) {
      const todayRequests = allRequests.filter((request: any) => {
        const requestDate = new Date(request.reqDate);
        const today = new Date();
        return requestDate.toDateString() === today.toDateString();
      });

      if (todayRequests.length > 0) {
        const latestRequest = todayRequests.reduce(
          (latest: any, current: any) => {
            return new Date(current.reqDate) > new Date(latest.reqDate)
              ? current
              : latest;
          }
        );
        expandedIds.add(latestRequest.originalId);
      }
    }

    // 통합된 주는 도움 목록에서 가장 최근 항목 찾기
    if (allGivenHelp && allGivenHelp.length > 0) {
      const todayGivenHelp = allGivenHelp.filter((item: any) => {
        const itemDate = new Date(item.reqDate);
        const today = new Date();
        return itemDate.toDateString() === today.toDateString();
      });

      if (todayGivenHelp.length > 0) {
        const latestGivenHelp = todayGivenHelp.reduce(
          (latest: any, current: any) => {
            return new Date(current.reqDate) > new Date(latest.reqDate)
              ? current
              : latest;
          }
        );
        expandedIds.add(latestGivenHelp.originalId);
      }
    }

    setExpandedRequests(expandedIds);
  }, [displayMyInfo]);

  // 로딩 상태 처리
  if (isLoading || myInfoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중</p>
        </div>
      </div>
    );
  }

  const handleCancelOffer = (offerId: number, detailId: number) => {
    setDeleteModal({
      isOpen: true,
      type: 'offerRequest',
      id: detailId,
      onConfirm: () => {
        updateOfferHelp.mutate(
          {
            id: offerId,
            data: {
              status: 'Check',
              helpOfferDetail: [
                {
                  id: detailId,
                  status: 'Waiting',
                  reqMemberId: 0,
                  discountApplyDate: null,
                  discountApplyType: 'None',
                  requestDate: null,
                },
              ],
            },
          },
          {
            onSuccess: () => {
              showSuccess('도움 취소', '도움 요청을 취소했습니다.');
            },
            onError: () => {
              showError('도움 취소 실패', '도움 취소에 실패했습니다.');
            },
          }
        );
        setDeleteModal({
          isOpen: false,
          type: 'request',
          id: 0,
          onConfirm: () => {},
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="내 활동 현황" icon="📋" />

      <div className="px-4 py-4 md:max-w-[700px] mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <span className="text-xl">🙏</span>
              내가 받는 도움
            </h2>
          </div>

          {/* 모든 내 요청들을 request 단위로 표시 */}
          <div className="space-y-4">
            {/* 통합된 요청 목록 */}
            {allRequests
              ?.filter((request: any) => {
                const requestDate = new Date(request.reqDate);
                const today = new Date();
                return requestDate.toDateString() === today.toDateString();
              })
              ?.map((request: any) => {
                const isExpanded = expandedRequests.has(request.originalId);
                const completedCount = request.helpDetails.filter(
                  (detail: any) => detail.reqDetailStatus === 'Completed'
                ).length;
                const checkCount = request.helpDetails.filter(
                  (detail: any) => detail.reqDetailStatus === 'Check'
                ).length;
                const waitingCount = request.helpDetails.filter(
                  (detail: any) => detail.reqDetailStatus === 'Waiting'
                ).length;

                return (
                  <div
                    key={request.originalId}
                    className="rounded-xl border border-gray-100 shadow-md bg-white relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-l-xl"></div>
                    {/* 아코디언 헤더 */}
                    <div
                      className="bg-white p-6 cursor-pointer transition-all duration-200 group"
                      onClick={() => {
                        const newExpanded = new Set(expandedRequests);
                        if (isExpanded) {
                          newExpanded.delete(request.originalId);
                        } else {
                          newExpanded.add(request.originalId);
                        }
                        setExpandedRequests(newExpanded);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold text-gray-800">
                            {new Date(request.reqDate).toLocaleTimeString(
                              'ko-KR',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}{' '}
                            - {request.totalDisCount}건{' '}
                            {request.type === 'transformed'
                              ? `도움 부탁`
                              : '도움 요청'}
                          </div>
                          {!isExpanded && (
                            <div className="flex items-center gap-1 text-xs">
                              {waitingCount > 0 && (
                                <span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {waitingCount}
                                </span>
                              )}
                              {checkCount > 0 && (
                                <span className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {checkCount}
                                </span>
                              )}
                              {completedCount > 0 && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {completedCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`transform transition-all duration-200 text-gray-500 text-sm group-hover:scale-125 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            ▼
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 아코디언 내용 */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2">
                        {request.helpDetails
                          .sort((a: any, b: any) => {
                            const statusOrder: { [key: string]: number } = {
                              Waiting: 0,
                              Check: 1,
                              Completed: 2,
                            };
                            return (
                              statusOrder[a.reqDetailStatus] -
                              statusOrder[b.reqDetailStatus]
                            );
                          })
                          .map((detail: any) => (
                            <div
                              key={detail.id}
                              className={`p-4 rounded-lg border ${
                                detail.reqDetailStatus === 'Check'
                                  ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
                                  : detail.reqDetailStatus === 'Completed'
                                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                                  : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
                              } hover:shadow-md transition-shadow duration-200`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-800 text-base">
                                    {detail.reqDetailStatus === 'Check'
                                      ? `💪 ${detail.helper.name}님이 도와주는 중!`
                                      : detail.reqDetailStatus === 'Completed'
                                      ? `😇🪽 ${detail.helper.name}님의 빠른 도움!`
                                      : '🔍 도와 주실 분 찾는 중'}
                                  </div>
                                  {(detail.reqDetailStatus === 'Check' ||
                                    detail.reqDetailStatus === 'Completed') && (
                                    <div className="text-xs text-gray-600 flex items-center gap-2">
                                      <div className="w-6"></div>
                                      <div className="font-semibold">
                                        {detail.discountApplyType === 'Cafe'
                                          ? '☕ 카페에서'
                                          : detail.discountApplyType ===
                                            'Restaurant'
                                          ? '🍽️ 식당에서'
                                          : null}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge
                                    status={detail.reqDetailStatus}
                                  />
                                  {detail.reqDetailStatus === 'Waiting' &&
                                    request.type === 'request' && (
                                      <button
                                        onClick={() => {
                                          setDeleteModal({
                                            isOpen: true,
                                            type: 'request',
                                            id: detail.id,
                                            onConfirm: () => {
                                              deleteRequestDetail.mutate(
                                                detail.id
                                              );
                                            },
                                          });
                                        }}
                                        disabled={deleteRequestDetail.isPending}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md text-sm font-medium transition-colors"
                                      >
                                        {deleteRequestDetail.isPending
                                          ? '삭제 중...'
                                          : '취소'}
                                      </button>
                                    )}
                                  {detail.reqDetailStatus === 'Check' &&
                                    request.type === 'transformed' && (
                                      <button
                                        onClick={() => {
                                          handleCancelOffer(
                                            detail.offerId,
                                            detail.id
                                          );
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md text-sm font-medium transition-colors"
                                      >
                                        {deleteRequestDetail.isPending
                                          ? '삭제 중...'
                                          : '취소'}
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* 요청한 도움이 없는 경우 */}
            {(!allRequests ||
              allRequests.length === 0 ||
              allRequests.filter((request: any) => {
                const requestDate = new Date(request.reqDate);
                const today = new Date();
                return requestDate.toDateString() === today.toDateString();
              }).length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🤷‍♂️</div>
                <p>요청한 도움이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 내가 주는 도움 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-700 flex items-center gap-2">
              <span className="text-xl">🤝</span>
              내가 주는 도움
            </h2>
          </div>

          {/* 통합된 내가 주는 도움 목록 */}
          <div className="space-y-4">
            {allGivenHelp
              ?.filter((item: any) => {
                const itemDate = new Date(item.reqDate);
                const today = new Date();
                return itemDate.toDateString() === today.toDateString();
              })
              ?.map((item: any) => {
                const isExpanded = expandedRequests.has(item.originalId);

                if (item.type === 'offer') {
                  const completedCount = item.helpOfferDetail.filter(
                    (detail: any) => detail.reqDetailStatus === 'Completed'
                  ).length;
                  const checkCount = item.helpOfferDetail.filter(
                    (detail: any) => detail.reqDetailStatus === 'Check'
                  ).length;
                  const waitingCount = item.helpOfferDetail.filter(
                    (detail: any) => detail.reqDetailStatus === 'Waiting'
                  ).length;

                  return (
                    <div
                      key={item.originalId}
                      className="rounded-xl border border-gray-100 shadow-md bg-white relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-l-xl"></div>
                      {/* 아코디언 헤더 */}
                      <div
                        className="bg-white p-6 cursor-pointer transition-all duration-200 group"
                        onClick={() => {
                          const newExpanded = new Set(expandedRequests);
                          if (isExpanded) {
                            newExpanded.delete(item.originalId);
                          } else {
                            newExpanded.add(item.originalId);
                          }
                          setExpandedRequests(newExpanded);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold text-gray-800">
                              {new Date(item.reqDate).toLocaleTimeString(
                                'ko-KR',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}{' '}
                              - {item.discountTotalCount}건 도움 제안
                            </div>
                            {!isExpanded && (
                              <div className="flex items-center gap-1 text-xs">
                                {waitingCount > 0 && (
                                  <span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {waitingCount}
                                  </span>
                                )}
                                {checkCount > 0 && (
                                  <span className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {checkCount}
                                  </span>
                                )}
                                {completedCount > 0 && (
                                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {completedCount}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`transform transition-all duration-200 text-gray-500 text-sm group-hover:scale-125 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            >
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 아코디언 내용 */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2">
                          {item.helpOfferDetail
                            .sort((a: any, b: any) => {
                              const statusOrder: { [key: string]: number } = {
                                Waiting: 0,
                                Check: 1,
                                Completed: 2,
                              };
                              return (
                                statusOrder[a.reqDetailStatus] -
                                statusOrder[b.reqDetailStatus]
                              );
                            })
                            .map((detail: any) => (
                              <div
                                key={detail.id}
                                className={`p-4 rounded-lg border ${
                                  detail.reqDetailStatus === 'Check'
                                    ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
                                    : detail.reqDetailStatus === 'Completed'
                                    ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                                    : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
                                } hover:shadow-md transition-shadow duration-200`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800 text-base">
                                      {detail.reqDetailStatus === 'Check'
                                        ? `🫶${detail.helpRequester?.helpRequesterName}님이 도움이 필요해요!`
                                        : detail.reqDetailStatus === 'Completed'
                                        ? `😇🪽 ${detail.helpRequester?.helpRequesterName}님을 도와줌!`
                                        : '🔍 도움이 필요한 사람 찾는 중'}
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                                      <div className="w-6"></div>
                                      <div className="font-semibold">
                                        {detail.discountApplyType === 'Cafe'
                                          ? '☕ 카페'
                                          : detail.discountApplyType ===
                                            'Restaurant'
                                          ? '🍽️ 식당'
                                          : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusBadge
                                      status={detail.reqDetailStatus}
                                    />
                                    {detail.reqDetailStatus === 'Waiting' && (
                                      <button
                                        onClick={() => {
                                          setDeleteModal({
                                            isOpen: true,
                                            type: 'offer',
                                            id: detail.id,
                                            onConfirm: () => {
                                              deleteOfferHelpDetail.mutate(
                                                detail.id
                                              );
                                            },
                                          });
                                        }}
                                        disabled={
                                          deleteOfferHelpDetail.isPending
                                        }
                                        className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md text-sm font-medium transition-colors"
                                      >
                                        {deleteOfferHelpDetail.isPending
                                          ? '삭제 중...'
                                          : '취소'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                } else if (item.type === 'completed') {
                  const completedCount = item.helpDetails.filter(
                    (detail: any) => detail.reqDetailStatus === 'Completed'
                  ).length;

                  return (
                    <div
                      key={item.originalId}
                      className="rounded-xl border border-gray-100 shadow-md bg-white relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-200 rounded-l-xl"></div>
                      {/* 아코디언 헤더 */}
                      <div
                        className="bg-white p-6 cursor-pointer transition-all duration-200 group"
                        onClick={() => {
                          const newExpanded = new Set(expandedRequests);
                          if (isExpanded) {
                            newExpanded.delete(item.originalId);
                          } else {
                            newExpanded.add(item.originalId);
                          }
                          setExpandedRequests(newExpanded);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold text-gray-800">
                              {new Date(item.reqDate).toLocaleTimeString(
                                'ko-KR',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}{' '}
                              - {item.applyDisCount}건 도움 수락
                            </div>
                            {!isExpanded && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {completedCount}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`transform transition-all duration-200 text-gray-500 text-sm group-hover:scale-125 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            >
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 아코디언 내용 */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2">
                          {item.helpDetails
                            .filter(
                              (detail: any) =>
                                detail.reqDetailStatus === 'Completed'
                            )
                            .map((detail: any) => (
                              <div
                                key={detail.id}
                                className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800 text-base">
                                      😇🪽
                                      {item.helpRequester.helpRequesterName}을
                                      도와줌!
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-2">
                                      <div className="w-6"></div>
                                      <div className="font-semibold">
                                        {detail.discountApplyType === 'Cafe'
                                          ? '☕ 카페에서'
                                          : detail.discountApplyType ===
                                            'Restaurant'
                                          ? '🍽️ 식당에서'
                                          : null}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusBadge
                                      status={detail.reqDetailStatus}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}

            {/* 주는 도움이 없는 경우 */}
            {(!allGivenHelp ||
              allGivenHelp.length === 0 ||
              allGivenHelp.filter((item: any) => {
                const itemDate = new Date(item.reqDate);
                const today = new Date();
                return itemDate.toDateString() === today.toDateString();
              }).length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🤷‍♂️</div>
                <p>주는 도움이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={deleteModal.onConfirm}
        title={
          deleteModal.type === 'request'
            ? '도움 요청 취소'
            : deleteModal.type === 'offerRequest'
            ? '제안 부탁 취소'
            : '도움 제안 취소'
        }
        message={
          deleteModal.type === 'request'
            ? '정말 이 도움 요청을 취소하시겠습니까?'
            : deleteModal.type === 'offerRequest'
            ? '정말 이 제안 부탁을 취소하시겠습니까?'
            : '정말 이 도움 제안을 취소하시겠습니까?'
        }
        confirmText="취소"
        cancelText="돌아가기"
      />
    </div>
  );
};

export default MyActivityPage;
