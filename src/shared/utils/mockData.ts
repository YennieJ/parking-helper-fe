/**
 * 목 데이터 타입 정의
 * 개발 환경에서 사용되는 목업 데이터의 타입들
 */

/**
 * 요청 상태 타입
 */
type RequestStatus = 'waiting' | 'reserved' | 'completed';

/**
 * 제안 상태 타입
 */
type OfferStatus = 'waiting' | 'requested' | 'confirmed' | 'completed';

/**
 * 도움 요청 인터페이스
 */
interface HelpRequest {
  id: string;
  userName: string;
  carNumber: string;
  createdAt: string;
  status: RequestStatus;
  isOwner: boolean;
  reservedBy?: string;
  reservedById?: string;
  reservedByCarNumber?: string; // 예약자의 차량번호 (offer에서만 사용하지만 타입 통일)
  userEmail?: string; // Slack 멘션용 이메일
}

/**
 * 도움 제안 인터페이스
 */
interface HelpOffer {
  id: string;
  userName: string;
  createdAt: string;
  status: OfferStatus;
  isOwner: boolean;
  requestedBy?: string;
  requestedById?: string;
  requestedByCarNumber?: string;
  userEmail?: string; // Slack 멘션용 이메일
}

/**
 * 임시 목업 데이터 - 도움 요청 목록
 */
export const mockHelpRequests: HelpRequest[] = [
  {
    id: '1',
    userName: '김철수',
    carNumber: '12가 3456',
    createdAt: '08:30',
    status: 'waiting',
    isOwner: true,
    userEmail: 'kim.chulsoo@company.com',
  },
  {
    id: '2',
    userName: '박민수',
    carNumber: '56다 7890',
    createdAt: '08:35',
    status: 'reserved',
    reservedBy: '이영희',
    reservedById: '2',
    isOwner: false,
    userEmail: 'park.minsu@company.com',
  },
  {
    id: '3',
    userName: '정수민',
    carNumber: '78라 5678',
    createdAt: '08:40',
    status: 'waiting',
    isOwner: false,
    userEmail: 'jung.sumin@company.com',
  },
];

/**
 * 임시 목업 데이터 - 도움 제안 목록
 */
export const mockHelpOffers: HelpOffer[] = [
  {
    id: '1',
    userName: '이영희',
    createdAt: '08:40',
    status: 'waiting',
    isOwner: false, // 기본값, API에서 동적으로 계산됨
    userEmail: 'lee.younghee@company.com',
  },
  {
    id: '2',
    userName: '정수민',
    createdAt: '08:45',
    status: 'requested',
    requestedBy: '김철수',
    requestedById: '1',
    requestedByCarNumber: '12가 3456', // 요청자의 차량번호 추가
    isOwner: false, // 기본값, API에서 동적으로 계산됨
    userEmail: 'jung.sumin@company.com',
  },
  {
    id: '3',
    userName: '김설수',
    createdAt: '09:00',
    status: 'requested',
    requestedBy: '박민수',
    requestedById: '3',
    requestedByCarNumber: '56다 7890', // 박민수의 차량번호
    isOwner: false, // 기본값, API에서 동적으로 계산됨
    userEmail: 'kim.seolsu@company.com',
  },
  {
    id: '4',
    userName: '김설수',
    createdAt: '09:15',
    status: 'confirmed',
    requestedBy: '최영수',
    requestedById: '5',
    requestedByCarNumber: '90마 9012', // 최영수의 차량번호
    isOwner: false, // 기본값, API에서 동적으로 계산됨
    userEmail: 'kim.seolsu@company.com',
  },
  {
    id: '5',
    userName: '김철수',
    createdAt: '09:30',
    status: 'requested',
    requestedBy: '이영희',
    requestedById: '2',
    requestedByCarNumber: '34나 1234', // 이영희의 차량번호
    isOwner: false, // 기본값, API에서 동적으로 계산됨
    userEmail: 'kim.chulsoo@company.com',
  },
  {
    id: '6',
    userName: '김철수',
    createdAt: '09:45',
    status: 'confirmed',
    requestedBy: '정수민',
    requestedById: '4',
    requestedByCarNumber: '78라 5678', // 정수민의 차량번호
    isOwner: false, // 기본값, API에서 동적으로 계산됨
    userEmail: 'kim.chulsoo@company.com',
  },
];

/**
 * 내 페이지 데이터 목업
 */
export const mockMyData = {
  helpRequests: 3,
  helpOffers: 5,
  completedHelps: 8,
  myRequests: [
    { id: '1', time: '08:30', status: '예약됨', reservedBy: '이영희' },
    { id: '2', time: '어제', status: '완료됨', reservedBy: '박민수' },
  ],
  myOffers: [{ id: '1', time: '08:40', status: '대기중' }],
  myReservations: [
    { id: '1', type: '차량 등록 요청하기', user: '박민수', time: '진행중' },
  ],
};

/**
 * 이달의 사원 랭킹 목업 데이터
 */
export const mockEmployeeOfMonth = [
  { rank: 1, name: '김철수', completedCount: 15, carNumber: '12가 3456' },
  { rank: 2, name: '이영희', completedCount: 12, carNumber: '34나 1234' },
  { rank: 3, name: '박민수', completedCount: 10, carNumber: '56다 7890' },
  { rank: 4, name: '정수민', completedCount: 8, carNumber: '78라 5678' },
  { rank: 5, name: '최영수', completedCount: 5, carNumber: '90마 9012' },
];

/**
 * 현재 사용자 정보를 가져오는 함수
 * localStorage에서 사용자 정보를 읽어옴
 */
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('parking_user') || '{}');
  return {
    id: user.id || '1',
    name: user.name || '김철수',
    carNumber: user.carNumber || '12가 3456',
    email: user.email || 'kim.chulsoo@company.com',
  };
};

/**
 * 목업 API 함수들
 * 실제 API와 같은 인터페이스를 제공하여 개발 환경에서 테스트 가능
 */
export const mockParkingApi = {
  /**
   * 도움 요청 목록을 가져오는 함수
   */
  getHelpRequests: () => {
    const currentUser = getCurrentUser();
    const requestsWithOwnership = mockHelpRequests.map((request) => ({
      ...request,
      isOwner: request.userName === currentUser.name,
    }));
    return Promise.resolve(requestsWithOwnership);
  },

  /**
   * 도움 제안 목록을 가져오는 함수
   */
  getHelpOffers: () => {
    const currentUser = getCurrentUser();
    const offersWithOwnership = mockHelpOffers.map((offer) => ({
      ...offer,
      isOwner: offer.userName === currentUser.name,
    }));
    return Promise.resolve(offersWithOwnership);
  },

  /**
   * 내 페이지 데이터를 가져오는 함수
   */
  getMyData: () => Promise.resolve(mockMyData),

  /**
   * 이달의 사원 데이터를 가져오는 함수
   */
  getEmployeeOfMonth: () => Promise.resolve(mockEmployeeOfMonth),

  /**
   * 새 도움 요청을 생성하는 함수
   */
  createHelpRequest: (_data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = getCurrentUser();
        const newRequest: HelpRequest = {
          id: Date.now().toString(),
          userName: currentUser.name,
          carNumber: currentUser.carNumber,
          createdAt: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'waiting',
          isOwner: true,
          userEmail: currentUser.email,
        };
        mockHelpRequests.unshift(newRequest);
        resolve(newRequest);
      }, 1000);
    });
  },

  /**
   * 새 도움 제안을 생성하는 함수
   */
  createHelpOffer: (_data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = getCurrentUser();
        const newOffer: HelpOffer = {
          id: Date.now().toString(),
          userName: currentUser.name,
          createdAt: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'waiting',
          isOwner: true,
          userEmail: currentUser.email,
        };
        mockHelpOffers.unshift(newOffer);
        resolve(newOffer);
      }, 1000);
    });
  },

  /**
   * 도움 요청을 예약하는 함수
   */
  reserveHelp: (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = getCurrentUser();
        const item = mockHelpRequests.find((item) => item.id === id);

        if (!item) {
          reject({ response: { data: { code: 'NOT_FOUND' } } });
          return;
        }

        if (item.status === 'reserved') {
          reject({ response: { data: { code: 'ALREADY_RESERVED' } } });
          return;
        }

        item.status = 'reserved';
        item.reservedBy = currentUser.name;
        item.reservedById = currentUser.id;

        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 제안에 요청하는 함수
   */
  requestHelp: (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = getCurrentUser();
        const item = mockHelpOffers.find((item) => item.id === id);

        if (!item) {
          reject({ response: { data: { code: 'NOT_FOUND' } } });
          return;
        }

        if (item.status !== 'waiting') {
          reject({ response: { data: { code: 'INVALID_STATUS' } } });
          return;
        }

        item.status = 'requested';
        item.requestedBy = currentUser.name;
        item.requestedById = currentUser.id;
        item.requestedByCarNumber = currentUser.carNumber;

        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 요청을 확인하는 함수
   */
  confirmHelp: (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = mockHelpOffers.find((item) => item.id === id);

        if (!item) {
          reject({ response: { data: { code: 'NOT_FOUND' } } });
          return;
        }

        if (item.status !== 'requested') {
          reject({ response: { data: { code: 'INVALID_STATUS' } } });
          return;
        }

        item.status = 'confirmed';
        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 요청을 취소하는 함수
   */
  cancelHelpRequest: (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = mockHelpOffers.find((item) => item.id === id);

        if (!item) {
          reject({ response: { data: { code: 'NOT_FOUND' } } });
          return;
        }

        if (item.status !== 'requested') {
          reject({ response: { data: { code: 'INVALID_STATUS' } } });
          return;
        }

        item.status = 'waiting';
        item.requestedBy = undefined;
        item.requestedById = undefined;
        item.requestedByCarNumber = undefined;

        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 요청 예약을 취소하는 함수
   */
  cancelReservation: (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockHelpRequests.find((item) => item.id === id);

        if (item) {
          item.status = 'waiting';
          item.reservedBy = undefined;
          item.reservedById = undefined;
        }
        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 요청을 완료 처리하는 함수
   */
  completeHelpRequest: (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockHelpRequests.find((item) => item.id === id);

        if (item) {
          item.status = 'completed';
        }
        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 제안을 완료 처리하는 함수
   */
  completeHelpOffer: (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockHelpOffers.find((item) => item.id === id);

        if (item) {
          item.status = 'completed';
        }
        resolve(item);
      }, 1000);
    });
  },

  /**
   * 도움 요청을 삭제하는 함수
   */
  deleteHelpRequest: (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockHelpRequests.findIndex((item) => item.id === id);
        if (index > -1) {
          mockHelpRequests.splice(index, 1);
        }
        resolve({ success: true });
      }, 1000);
    });
  },

  /**
   * 도움 제안을 삭제하는 함수
   */
  deleteHelpOffer: (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = mockHelpOffers.find((item) => item.id === id);

        // 도움 제안이 요청된 상태면 삭제 불가
        if (
          item &&
          (item.status === 'requested' || item.status === 'confirmed')
        ) {
          reject({
            response: {
              data: {
                code: 'CANNOT_DELETE_REQUESTED',
                message: '요청된 제안은 삭제할 수 없습니다.',
              },
            },
          });
          return;
        }

        const index = mockHelpOffers.findIndex((item) => item.id === id);
        if (index > -1) {
          mockHelpOffers.splice(index, 1);
        }
        resolve({ success: true });
      }, 1000);
    });
  },

  /**
   * 프로필을 업데이트하는 함수
   */
  updateProfile: (_data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },

  /**
   * 로그인 함수
   */
  login: (_employeeNumber: string, _password: string) => {
    return Promise.resolve({ success: true });
  },

  /**
   * 헬스 체크 함수
   */
  healthCheck: () => Promise.resolve({ status: 'ok' }),
};
