// src/utils/mockData.ts
import { env } from '../config/env';

// 타입 정의
type Status = 'waiting' | 'reserved' | 'completed';

interface HelpRequest {
  id: string;
  userName: string;
  carNumber: string;
  createdAt: string;
  status: Status;
  isOwner: boolean;
  reservedBy?: string;
  reservedById?: string;
  reservedByCarNumber?: string; // 예약자의 차량번호 (offer에서만 사용하지만 타입 통일)
}

interface HelpOffer {
  id: string;
  userName: string;
  createdAt: string;
  status: Status;
  isOwner: boolean;
  reservedBy?: string;
  reservedById?: string;
  reservedByCarNumber?: string;
}

// 임시 목업 데이터
export const mockHelpRequests: HelpRequest[] = [
  {
    id: '1',
    userName: '김철수',
    carNumber: '12가 3456',
    createdAt: '08:30',
    status: 'waiting',
    isOwner: true,
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
  },
  {
    id: '3',
    userName: '정수민',
    carNumber: '78라 5678',
    createdAt: '08:40',
    status: 'waiting',
    isOwner: false,
  },
];

export const mockHelpOffers: HelpOffer[] = [
  {
    id: '1',
    userName: '이영희',
    createdAt: '08:40',
    status: 'waiting',
    isOwner: false,
  },
  {
    id: '2',
    userName: '정수민',
    createdAt: '08:45',
    status: 'reserved',
    reservedBy: '김철수',
    reservedById: '1',
    reservedByCarNumber: '12가 3456', // 예약자의 차량번호 추가
    isOwner: true,
  },
];

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
    { id: '1', type: '도와주세요', user: '박민수', time: '진행중' },
  ],
};

export const mockEmployeeOfMonth = [
  { rank: 1, name: '김철수', completedCount: 15, carNumber: '12가 3456' },
  { rank: 2, name: '이영희', completedCount: 12, carNumber: '34나 1234' },
  { rank: 3, name: '박민수', completedCount: 10, carNumber: '56다 7890' },
  { rank: 4, name: '정수민', completedCount: 8, carNumber: '78라 5678' },
  { rank: 5, name: '최영수', completedCount: 5, carNumber: '90마 9012' },
];

// 현재 사용자 정보 (실제로는 Context에서 가져와야 함)
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('parking_user') || '{}');
  return {
    id: user.id || '1',
    name: user.name || '김철수',
    carNumber: user.carNumber || '12가 3456',
  };
};

// 목업 API 함수들 (실제 API와 같은 인터페이스)
export const mockParkingApi = {
  getHelpRequests: () => Promise.resolve(mockHelpRequests),
  getHelpOffers: () => Promise.resolve(mockHelpOffers),
  getMyData: () => Promise.resolve(mockMyData),
  getEmployeeOfMonth: () => Promise.resolve(mockEmployeeOfMonth),

  createHelpRequest: (data: any) => {
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
        };
        mockHelpRequests.unshift(newRequest);
        resolve(newRequest);
      }, 1000);
    });
  },

  createHelpOffer: (data: any) => {
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
        };
        mockHelpOffers.unshift(newOffer);
        resolve(newOffer);
      }, 1000);
    });
  },

  reserveHelp: (id: string, type: 'request' | 'offer') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = getCurrentUser();
        const array = type === 'request' ? mockHelpRequests : mockHelpOffers;
        const item = array.find((item) => item.id === id);

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

        // 도와줄수있어요의 경우 예약자의 차량번호도 저장
        if (type === 'offer') {
          item.reservedByCarNumber = currentUser.carNumber;
        }

        resolve(item);
      }, 1000);
    });
  },

  cancelReservation: (id: string, type: 'request' | 'offer') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const array = type === 'request' ? mockHelpRequests : mockHelpOffers;
        const item = array.find((item) => item.id === id);

        if (item) {
          item.status = 'waiting';
          delete item.reservedBy;
          delete item.reservedById;
          if (type === 'offer') {
            delete item.reservedByCarNumber;
          }
        }
        resolve(item);
      }, 1000);
    });
  },

  completeHelp: (id: string, type: 'request' | 'offer') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const array = type === 'request' ? mockHelpRequests : mockHelpOffers;
        const item = array.find((item) => item.id === id);

        if (item) {
          item.status = 'completed';
        }
        resolve(item);
      }, 1000);
    });
  },

  deleteHelp: (id: string, type: 'request' | 'offer') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const array = type === 'request' ? mockHelpRequests : mockHelpOffers;
        const item = array.find((item) => item.id === id);

        // 도와줄수있어요가 예약된 상태면 삭제 불가
        if (type === 'offer' && item && item.status === 'reserved') {
          reject({
            response: {
              data: {
                code: 'CANNOT_DELETE_RESERVED',
                message: '예약된 제안은 삭제할 수 없습니다.',
              },
            },
          });
          return;
        }

        const index = array.findIndex((item) => item.id === id);
        if (index > -1) {
          array.splice(index, 1);
        }
        resolve({ success: true });
      }, 1000);
    });
  },

  updateProfile: (data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },

  login: (employeeNumber: string, password: string) => {
    return Promise.resolve({ success: true });
  },

  healthCheck: () => Promise.resolve({ status: 'ok' }),
};

// 환경에 따라 실제 API 또는 목업 API 선택
export const getApiClient = () => {
  // 개발 환경에서는 목업 API 사용
  if (env.IS_DEVELOPMENT) {
    console.log('🔧 목업 API 사용 중...');
    return mockParkingApi;
  }

  // 프로덕션에서는 실제 API 사용
  const { parkingApi } = require('../api/parkingApi');
  return parkingApi;
};
