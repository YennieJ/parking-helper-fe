// src/api/parkingApi.ts
import axios from 'axios';
import { env } from '../config/env';

const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (인증 정보 추가)
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('parking_user') || '{}');
    if (user.id) {
      config.headers['X-User-ID'] = user.id;
      config.headers['X-Employee-Number'] = user.employeeNumber;
    }

    // 개발 환경에서 요청 로깅
    if (env.IS_DEVELOPMENT) {
      console.log('🔍 API 요청:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => {
    // 개발 환경에서 응답 로깅
    if (env.IS_DEVELOPMENT) {
      console.log('✅ API 응답:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ API 에러:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
    });

    // 특정 에러 코드에 따른 처리
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃 처리
      localStorage.removeItem('parking_user');
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export const parkingApi = {
  // 도와주세요 요청들 가져오기
  getHelpRequests: () => api.get('/help-requests').then((res) => res.data),

  // 도와줄수있어요 제안들 가져오기
  getHelpOffers: () => api.get('/help-offers').then((res) => res.data),

  // 내 페이지 데이터 가져오기
  getMyData: () => api.get('/my-data').then((res) => res.data),

  // 이달의 사원 데이터 가져오기
  getEmployeeOfMonth: () =>
    api.get('/employee-of-month').then((res) => res.data),

  // 새 요청 등록
  createHelpRequest: (data: { message?: string }) =>
    api.post('/help-requests', data).then((res) => res.data),

  // 새 제안 등록
  createHelpOffer: (data: { message?: string }) =>
    api.post('/help-offers', data).then((res) => res.data),

  // 예약하기
  reserveHelp: (id: string, type: 'request' | 'offer') =>
    api
      .post(
        `/${type === 'request' ? 'help-requests' : 'help-offers'}/${id}/reserve`
      )
      .then((res) => res.data),

  // 예약 취소하기
  cancelReservation: (id: string, type: 'request' | 'offer') =>
    api
      .delete(
        `/${
          type === 'request' ? 'help-requests' : 'help-offers'
        }/${id}/reservation`
      )
      .then((res) => res.data),

  // 완료하기
  completeHelp: (id: string, type: 'request' | 'offer') =>
    api
      .post(
        `/${
          type === 'request' ? 'help-requests' : 'help-offers'
        }/${id}/complete`
      )
      .then((res) => res.data),

  // 삭제하기
  deleteHelp: (id: string, type: 'request' | 'offer') =>
    api
      .delete(`/${type === 'request' ? 'help-requests' : 'help-offers'}/${id}`)
      .then((res) => res.data),

  // 개인정보 수정
  updateProfile: (data: { name: string; carNumber: string }) =>
    api.put('/profile', data).then((res) => res.data),

  // 로그인 (실제 API 연결 시 사용)
  login: (employeeNumber: string, password: string) =>
    api
      .post('/auth/login', { employeeNumber, password })
      .then((res) => res.data),

  // 건강 상태 체크
  healthCheck: () => api.get('/health').then((res) => res.data),
};
