import React from 'react';
import type { ActivityDetail } from '../types/activity';
import ActivityAccordion from './ActivityAccordion';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import { Service } from '../../../shared/types/servieType';

interface RequestActivityListProps {
  requests: ActivityDetail[];
  expandedRequests: Set<string>;
  onToggleExpanded: (id: string) => void;
  onCancelRequest: (detailId: number) => void;
  onCancelOffer: (offerId: number, detailId: number) => void;
  isDeleting: boolean;
}

const RequestActivityList: React.FC<RequestActivityListProps> = ({
  requests,
  expandedRequests,
  onToggleExpanded,
  onCancelRequest,
  onCancelOffer,
  isDeleting,
}) => {
  const getDetailStatusText = (detail: any) => {
    const name = detail.helper?.name;

    switch (detail.reqDetailStatus) {
      case 'Check':
        return `💪 ${name}님이 도와주는 중!`;
      case 'Completed':
        return `😇🪽 ${name}님의 빠른 도움!`;
      default:
        return `🔍 도와 주실 분 찾는 중`;
    }
  };

  const getDiscountTypeText = (discountType: string) => {
    switch (discountType) {
      case Service.CAFE:
        return '☕ 카페에서';
      case Service.RESTAURANT:
        return '🍽️ 식당에서';
      default:
        return '';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🤷‍♂️</div>
        <p>요청한 도움이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const isExpanded = expandedRequests.has(request.originalId);

        return (
          <ActivityAccordion
            key={request.originalId}
            activity={request}
            isExpanded={isExpanded}
            onToggle={onToggleExpanded}
            showStatusBadges={true}
          >
            {request.helpDetails
              .sort((a, b) => {
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
              .map((detail) => (
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
                        {getDetailStatusText(detail)}
                      </div>
                      {(detail.reqDetailStatus === 'Check' ||
                        detail.reqDetailStatus === 'Completed') && (
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-6"></div>
                          <div className="font-semibold">
                            {getDiscountTypeText(detail.discountApplyType)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={detail.reqDetailStatus} />
                      {detail.reqDetailStatus === 'Waiting' &&
                        request.type === 'request' && (
                          <button
                            onClick={() => onCancelRequest(detail.id)}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md text-sm font-medium transition-colors"
                          >
                            {isDeleting ? '삭제 중...' : '취소'}
                          </button>
                        )}
                      {detail.reqDetailStatus === 'Check' &&
                        request.type === 'transformed' && (
                          <button
                            onClick={() =>
                              onCancelOffer((detail as any).offerId, detail.id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md text-sm font-medium transition-colors"
                          >
                            {isDeleting ? '삭제 중...' : '취소'}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
          </ActivityAccordion>
        );
      })}
    </div>
  );
};

export default RequestActivityList;
