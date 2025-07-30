import { useDeleteRequestHelpDetail } from '../features/requestDetail/useRequestHelpDetail';
import Header from '../shared/components/layout/Header';
import DeleteConfirmModal from '../shared/components/ui/DeleteConfirmModal';
import { useState, useEffect } from 'react';
import {
  useDeleteOfferHelp,
  useUpdateOfferHelp,
} from '../features/offer/useOfferHelp';
import { useToast } from '../shared/components/ui/Toast';
import CardContainer from '../shared/components/ui/CardContiner';
import { useActivityData } from '../features/activity/hooks/useActivityData';
import RequestActivityList from '../features/activity/components/RequestActivityList';
import OfferActivityList from '../features/activity/components/OfferActivityList';

const MyActivityPage = () => {
  const { isLoading, todayRequests, todayGivenHelp } = useActivityData();
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

  // 가장 최근 요청과 제안을 기본적으로 열어두기
  useEffect(() => {
    const expandedIds = new Set<string>();

    // 통합된 요청 목록에서 가장 최근 요청 찾기 (정렬된 배열의 마지막 아이템)
    if (todayRequests && todayRequests.length > 0) {
      const latestRequest = todayRequests[todayRequests.length - 1];
      expandedIds.add(latestRequest.originalId);
    }

    // 통합된 주는 도움 목록에서 가장 최근 항목 찾기 (정렬된 배열의 마지막 아이템)
    if (todayGivenHelp && todayGivenHelp.length > 0) {
      const latestGivenHelp = todayGivenHelp[todayGivenHelp.length - 1];
      expandedIds.add(latestGivenHelp.originalId);
    }

    setExpandedRequests(expandedIds);
  }, [todayRequests, todayGivenHelp]);

  // 로딩 상태 처리
  if (isLoading) {
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
        <CardContainer>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <span className="text-xl">🙏</span>
              내가 받는 도움
            </h2>
          </div>

          <RequestActivityList
            requests={todayRequests}
            expandedRequests={expandedRequests}
            onToggleExpanded={(id) => {
              const newExpanded = new Set(expandedRequests);
              if (newExpanded.has(id)) {
                newExpanded.delete(id);
              } else {
                newExpanded.add(id);
              }
              setExpandedRequests(newExpanded);
            }}
            onCancelRequest={(detailId) => {
              setDeleteModal({
                isOpen: true,
                type: 'request',
                id: detailId,
                onConfirm: () => {
                  deleteRequestDetail.mutate(detailId);
                },
              });
            }}
            onCancelOffer={(offerId, detailId) => {
              handleCancelOffer(offerId, detailId);
            }}
            isDeleting={deleteRequestDetail.isPending}
          />
        </CardContainer>

        {/* 내가 주는 도움 */}
        <CardContainer>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-700 flex items-center gap-2">
              <span className="text-xl">🤝</span>
              내가 주는 도움
            </h2>
          </div>

          <OfferActivityList
            offers={todayGivenHelp}
            expandedRequests={expandedRequests}
            onToggleExpanded={(id) => {
              const newExpanded = new Set(expandedRequests);
              if (newExpanded.has(id)) {
                newExpanded.delete(id);
              } else {
                newExpanded.add(id);
              }
              setExpandedRequests(newExpanded);
            }}
            onCancelOffer={(detailId) => {
              setDeleteModal({
                isOpen: true,
                type: 'offer',
                id: detailId,
                onConfirm: () => {
                  deleteOfferHelpDetail.mutate(detailId);
                },
              });
            }}
            isDeleting={deleteOfferHelpDetail.isPending}
          />
        </CardContainer>
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
