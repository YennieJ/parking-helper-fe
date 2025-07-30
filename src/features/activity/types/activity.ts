export interface ActivityDetail {
  id: number;
  reqDate: string;
  totalDisCount: number;
  applyDisCount: number;
  helpRequester?: {
    id: number;
    helpRequesterName: string;
    requesterEmail: string;
    slackId: string | null;
    reqHelpCar: {
      id: number;
      carNumber: string;
    };
  };
  helper?: {
    id: number;
    name: string;
    email: string;
    slackId: string | null;
  };
  helpDetails: Array<{
    id: number;
    reqDetailStatus: 'Waiting' | 'Check' | 'Completed';
    discountApplyType: string;
    discountApplyDate: string | null;
    insertDate: string;
    helper: {
      id: number;
      name: string;
      email: string;
      slackId: string | null;
    } | null;
    slackThreadTs: string | null;
    helpRequester?: {
      id: number;
      helpRequesterName: string;
      requesterEmail: string;
      slackId: string | null;
      reqHelpCar: {
        id: number;
        carNumber: string;
      };
    } | null;
  }>;
  helpOfferDetail?: Array<{
    id: number;
    helpRequester: {
      id: number;
      helpRequesterName: string;
      requesterEmail: string;
      slackId: string | null;
      reqHelpCar: {
        id: number;
        carNumber: string;
      };
    } | null;
    reqDetailStatus: 'Waiting' | 'Check' | 'Completed';
    discountApplyDate: string | null;
    discountApplyType: string;
    requestDate: string | null;
  }>;
  type: 'request' | 'transformed' | 'offer' | 'completed' | 'immediateComplete';
  originalId: string;
}
