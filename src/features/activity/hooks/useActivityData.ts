import { useMemo } from 'react';
import { useMyInfo } from '../../member/useMember';
import type { ActivityDetail } from '../types/activity';

export const useActivityData = () => {
  const { data: myInfo, isLoading } = useMyInfo();

  // 실제 데이터 사용 (myInfo가 배열로 오므로 첫 번째 요소 사용)
  const memberData = Array.isArray(myInfo) ? myInfo[0] : myInfo;
  const displayMyInfo = memberData;

  // helpOfferMyRequestHistory를 requestHelpHistory와 같은 형태로 변환하는 함수
  const transformHelpOfferMyRequestHistory = (
    helpOfferMyRequestHistory: any[]
  ): ActivityDetail[] => {
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

    const transformedData = Object.values(
      groupedByOfferAndTime
    ) as ActivityDetail[];

    return transformedData;
  };

  // 변환된 helpOfferMyRequestHistory
  const transformedHelpOfferMyRequestHistory = useMemo(
    () =>
      transformHelpOfferMyRequestHistory(
        displayMyInfo?.helpOfferMyRequestHistory || []
      ),
    [displayMyInfo?.helpOfferMyRequestHistory]
  );

  // 두 목록을 합쳐서 오름차순으로 정렬
  const allRequests = useMemo(() => {
    const requests = [
      ...(displayMyInfo?.requestHelpHistory || []).map((request: any) => {
        const helpDetails = request.helpDetails || [];
        const totalDisCount = helpDetails.length;
        const applyDisCount = helpDetails.filter(
          (detail: any) => detail.reqDetailStatus === 'Completed'
        ).length;

        return {
          ...request,
          type: 'request' as const,
          originalId: request.id,
          helpDetails,
          totalDisCount,
          applyDisCount,
        };
      }),
      ...(transformedHelpOfferMyRequestHistory || []).map((request: any) => {
        const helpDetails = request.helpDetails || [];
        const totalDisCount = helpDetails.length;
        const applyDisCount = helpDetails.filter(
          (detail: any) => detail.reqDetailStatus === 'Completed'
        ).length;

        return {
          ...request,
          type: 'transformed' as const,
          originalId: request.id,
          helpDetails,
          totalDisCount,
          applyDisCount,
        };
      }),
    ];

    return requests.sort((a: any, b: any) => {
      const dateA = new Date(a.reqDate);
      const dateB = new Date(b.reqDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [displayMyInfo?.requestHelpHistory, transformedHelpOfferMyRequestHistory]);

  // 내가 주는 도움 목록을 합쳐서 오름차순으로 정렬
  const allGivenHelp = useMemo(() => {
    const givenHelp = [
      // 1. 내가 제안한 도움 (일반 제안)
      ...(displayMyInfo?.helpOfferHistory || [])
        .filter(
          (offer: any) =>
            offer.helpOfferType === 'offerOnly' ||
            offer.helpOfferType === 'OfferOnly'
        )
        .map((offer: any) => {
          const helpOfferDetails = offer.helpOfferDetail || [];
          const totalDisCount = helpOfferDetails.length;
          const applyDisCount = helpOfferDetails.filter(
            (detail: any) => detail.reqDetailStatus === 'Completed'
          ).length;

          // helpOfferDetail을 helpDetails 형태로 변환
          const helpDetails = helpOfferDetails.map((detail: any) => ({
            id: detail.id,
            reqDetailStatus: detail.reqDetailStatus,
            discountApplyType: detail.discountApplyType,
            discountApplyDate: detail.discountApplyDate,
            insertDate: detail.requestDate || new Date().toISOString(),
            helper: {
              id: offer.helper?.id,
              name: offer.helper?.name,
              email: offer.helper?.email,
              slackId: offer.helper?.slackId,
            },
            slackThreadTs: null,
            helpRequester: detail.helpRequester, // helpRequester 정보 추가
          }));

          return {
            ...offer,
            type: 'offer' as const,
            originalId: offer.id,
            reqDate: offer.helperServiceDate,
            helpDetails,
            totalDisCount,
            applyDisCount,
          };
        }),
      // 2. 내가 제안한 도움 (즐겨찾기 도움)
      ...(displayMyInfo?.helpOfferHistory || [])
        .filter((offer: any) => offer.helpOfferType === 'ImmediateComplete')
        .map((offer: any) => {
          const helpOfferDetails = offer.helpOfferDetail || [];
          const totalDisCount = helpOfferDetails.length;
          const applyDisCount = helpOfferDetails.filter(
            (detail: any) => detail.reqDetailStatus === 'Completed'
          ).length;

          // helpOfferDetail을 helpDetails 형태로 변환
          const helpDetails = helpOfferDetails.map((detail: any) => ({
            id: detail.id,
            reqDetailStatus: detail.reqDetailStatus,
            discountApplyType: detail.discountApplyType,
            discountApplyDate: detail.discountApplyDate,
            insertDate: detail.requestDate || new Date().toISOString(),
            helper: {
              id: offer.helper?.id,
              name: offer.helper?.name,
              email: offer.helper?.email,
              slackId: offer.helper?.slackId,
            },
            slackThreadTs: null,
            helpRequester: detail.helpRequester, // helpRequester 정보 추가
          }));

          return {
            ...offer,
            type: 'immediateComplete' as const,
            originalId: offer.id,
            reqDate: offer.helperServiceDate,
            helpDetails,
            totalDisCount,
            applyDisCount,
          };
        }),
      // 3. 다른 사람의 요청을 처리한 도움
      ...(displayMyInfo?.myRequestHelpCompleteHistory || []).map(
        (request: any) => {
          const helpDetails = request.helpDetails || [];
          const totalDisCount = helpDetails.length;
          const applyDisCount = helpDetails.length;

          return {
            ...request,
            type: 'completed' as const,
            originalId: request.id,
            helpDetails,
            totalDisCount,
            applyDisCount,
          };
        }
      ),
    ];

    return givenHelp.sort((a: any, b: any) => {
      const dateA = new Date(a.reqDate);
      const dateB = new Date(b.reqDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [
    displayMyInfo?.helpOfferHistory,
    displayMyInfo?.myRequestHelpCompleteHistory,
  ]);

  // 오늘 날짜만 필터링
  const todayRequests = useMemo(() => {
    const today = new Date();
    const todayString = today.toDateString();

    return allRequests.filter((request) => {
      const requestDate = new Date(request.reqDate);
      return requestDate.toDateString() === todayString;
    });
  }, [allRequests]);

  const todayGivenHelp = useMemo(() => {
    const today = new Date();
    const todayString = today.toDateString();

    return allGivenHelp.filter((help) => {
      const helpDate = new Date(help.reqDate);
      return helpDate.toDateString() === todayString;
    });
  }, [allGivenHelp]);

  return {
    isLoading,
    todayRequests,
    todayGivenHelp,
    allRequests,
    allGivenHelp,
  };
};
