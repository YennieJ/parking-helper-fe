import axios from 'axios';

/**
 * axios 기본 설정
 * 타임아웃과 기본 헤더를 설정
 */
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 서버 에러 시 로그인 페이지로 리다이렉트
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 404 에러는 완전히 무시하고 아무것도 출력하지 않음
    if (error?.response?.status === 404) {
      // 404 에러는 조용히 reject만 하고 아무것도 출력하지 않음
      return Promise.reject(error);
    }

    // 다른 에러만 콘솔에 출력
    console.error('API 요청 실패:', error);

    // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉트
    const currentPath = window.location.pathname;
    if (
      currentPath !== '/login' &&
      (error.response?.status === 500 ||
        error.code === 'NETWORK_ERROR' ||
        error.message?.includes('Network Error'))
    ) {
      // 로그아웃 처리
      localStorage.removeItem('parking_user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * POST 요청을 위한 기본 함수
 * @param url - 요청 URL
 * @param data - 요청 데이터
 * @returns Promise<T> - 응답 데이터
 */
export const postData = async <T = any>(
  url: string,
  data?: any
): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data);

    // 상태 코드에 따른 처리
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 400) {
      throw new Error('Bad Request: 400 에러');
    } else {
      throw new Error(`HTTP ${response.status}: 요청 실패`);
    }
  } catch (error) {
    console.error('POST 요청 실패:', error);
    throw error;
  }
};

/**
 * GET 요청을 위한 기본 함수
 * @param url - 요청 URL
 * @param params - 쿼리 파라미터
 * @returns Promise<T> - 응답 데이터
 */
export const getData = async <T = any>(
  url: string,
  params?: any
): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, { params });

    // 상태 코드에 따른 처리
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 400) {
      throw new Error('Bad Request: 400 에러');
    } else {
      throw new Error(`HTTP ${response.status}: 요청 실패`);
    }
  } catch (error: any) {
    // 404 에러는 완전히 무시하고 빈 배열 반환 (아무것도 출력하지 않음)
    if (error?.response?.status === 404) {
      // 404 에러는 조용히 빈 배열 반환
      return [] as T;
    }
    // 다른 에러만 콘솔에 출력
    console.error('GET 요청 실패:', error);
    throw error;
  }
};

/**
 * PUT 요청을 위한 기본 함수
 * @param url - 요청 URL
 * @param data - 요청 데이터
 * @returns Promise<T> - 응답 데이터
 */
export const putData = async <T = any>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data);

    // 상태 코드에 따른 처리
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 400) {
      throw new Error('Bad Request: 400 에러');
    } else {
      throw new Error(`HTTP ${response.status}: 요청 실패`);
    }
  } catch (error) {
    console.error('PUT 요청 실패:', error);
    throw error;
  }
};

/**
 * DELETE 요청을 위한 기본 함수
 * @param url - 요청 URL
 * @returns Promise<T> - 응답 데이터
 */
export const deleteData = async <T = any>(url: string): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url);

    // 상태 코드에 따른 처리
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 400) {
      throw new Error('Bad Request: 400 에러');
    } else {
      throw new Error(`HTTP ${response.status}: 요청 실패`);
    }
  } catch (error) {
    console.error('DELETE 요청 실패:', error);
    throw error;
  }
};

export default apiClient;
