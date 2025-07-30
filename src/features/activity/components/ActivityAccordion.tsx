import React from 'react';
import type { ActivityDetail } from '../types/activity';
import { ParkingStatus } from '../../../shared/types/parkingStatus';

interface ActivityAccordionProps {
  activity: ActivityDetail;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  showStatusBadges?: boolean;
}

const ActivityAccordion: React.FC<ActivityAccordionProps> = ({
  activity,
  isExpanded,
  onToggle,
  children,
  showStatusBadges = false,
}) => {
  const getActivityCounts = () => {
    const completedCount = activity.helpDetails.filter(
      (detail) => detail.reqDetailStatus === ParkingStatus.COMPLETED
    ).length;
    const checkCount = activity.helpDetails.filter(
      (detail) => detail.reqDetailStatus === ParkingStatus.REQUEST
    ).length;
    const waitingCount = activity.helpDetails.filter(
      (detail) => detail.reqDetailStatus === ParkingStatus.WAITING
    ).length;

    return { completedCount, checkCount, waitingCount };
  };

  const getTitle = () => {
    const time = new Date(activity.reqDate).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    switch (activity.type) {
      case 'request':
        return `${time} - ${activity.totalDisCount}건 도움 요청`;
      case 'transformed':
        return `${time} - ${activity.totalDisCount}건 도움 부탁`;
      case 'offer':
        return `${time} - ${activity.totalDisCount}건 도움 제안`;
      case 'immediateComplete':
        return `${time} - ${activity.totalDisCount}건 도움 완료`;
      case 'completed':
        return `${time} - ${activity.helpDetails.length}건 도움 수락`;
      default:
        return `${time} - 활동`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* 아코디언 헤더 */}
      <div
        className={`cursor-pointer transition-all duration-200 group ${
          isExpanded ? 'mb-4' : 'mb-0'
        }`}
        onClick={() => onToggle(activity.originalId)}
      >
        <div className="flex items-center justify-between min-h-[3rem]">
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold text-gray-800">
              {getTitle()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showStatusBadges && !isExpanded && (
              <div className="flex items-center gap-1 text-xs">
                {getActivityCounts().waitingCount > 0 && (
                  <span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {getActivityCounts().waitingCount}
                  </span>
                )}
                {getActivityCounts().checkCount > 0 && (
                  <span className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {getActivityCounts().checkCount}
                  </span>
                )}
                {getActivityCounts().completedCount > 0 && (
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {getActivityCounts().completedCount}
                  </span>
                )}
              </div>
            )}
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
      {isExpanded && <div className="space-y-2">{children}</div>}
    </div>
  );
};

export default ActivityAccordion;
