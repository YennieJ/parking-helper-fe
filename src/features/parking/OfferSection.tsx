import React from 'react';
import HelpOfferCard from './HelpOfferCard';
import { MESSAGES } from '../../shared/utils/messages';

interface OfferSectionProps {
  helpOffers: any[];
  onAddOffer: () => void;
  onRequest: (id: string) => void;
  onConfirm: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onCancelRequest: (id: string) => void;
  loadingState: (id: string) => {
    isRequesting: boolean;
    isConfirming: boolean;
    isMarkingComplete: boolean;
    isRemoving: boolean;
    isCancelingRequest: boolean;
  };
  isCreating: boolean;
}

const OfferSection: React.FC<OfferSectionProps> = ({
  helpOffers,
  onAddOffer,
  onRequest,
  onConfirm,
  onMarkComplete,
  onRemove,
  onCancelRequest,
  loadingState,
  isCreating,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🙋‍♂️</span>
          차량 등록 도와주기
        </h2>
        <button
          onClick={onAddOffer}
          disabled={isCreating}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            '+ 추가'
          )}
        </button>
      </div>
      <div className="space-y-3">
        {helpOffers?.map((offer: any) => (
          <HelpOfferCard
            key={offer.id}
            offer={offer}
            onRequest={() => onRequest(offer.id)}
            onConfirm={() => onConfirm(offer.id)}
            onMarkComplete={() => onMarkComplete(offer.id)}
            onRemove={() => onRemove(offer.id)}
            onCancelRequest={() => onCancelRequest(offer.id)}
            loadingState={loadingState(offer.id)}
          />
        ))}
        {(!helpOffers || helpOffers.length === 0) && (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🤷‍♀️</div>
            <p className="text-gray-500">{MESSAGES.HELP_OFFER.EMPTY_STATE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferSection;
