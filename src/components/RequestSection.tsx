import React from 'react';
import HelpRequestCard from './HelpRequestCard';
import { MESSAGES } from '../utils/messages';

interface RequestSectionProps {
  helpRequests: any[];
  onAddRequest: () => void;
  onAccept: (
    id: string,
    requestData?: { carNumber?: string; userName?: string }
  ) => void;
  onMarkComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onCancelAcceptance: (id: string) => void;
  loadingState: (id: string) => {
    isAccepting: boolean;
    isMarkingComplete: boolean;
    isRemoving: boolean;
    isCancelingAcceptance: boolean;
  };
  isCreating: boolean;
}

const RequestSection: React.FC<RequestSectionProps> = ({
  helpRequests,
  onAddRequest,
  onAccept,
  onMarkComplete,
  onRemove,
  onCancelAcceptance,
  loadingState,
  isCreating,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🆘</span>
          차량 등록 요청하기
        </h2>
        <button
          onClick={onAddRequest}
          disabled={isCreating}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            '+ 추가'
          )}
        </button>
      </div>
      <div className="space-y-3">
        {helpRequests?.map((request: any) => (
          <HelpRequestCard
            key={request.id}
            request={request}
            onAccept={() =>
              onAccept(request.id, {
                carNumber: request.carNumber,
                userName: request.userName,
              })
            }
            onMarkComplete={() => onMarkComplete(request.id)}
            onRemove={() => onRemove(request.id)}
            onCancelAcceptance={() => onCancelAcceptance(request.id)}
            loadingState={loadingState(request.id)}
          />
        ))}
        {(!helpRequests || helpRequests.length === 0) && (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🤷‍♂️</div>
            <p className="text-gray-500">{MESSAGES.HELP_REQUEST.EMPTY_STATE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestSection;
