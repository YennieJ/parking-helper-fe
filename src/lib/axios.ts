import axios from 'axios';

// axios 기본 설정
const apiClient = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// POST 요청을 위한 기본 함수
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

// GET 요청을 위한 기본 함수
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
  } catch (error) {
    console.error('GET 요청 실패:', error);
    throw error;
  }
};

// PUT 요청을 위한 기본 함수
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

// DELETE 요청을 위한 기본 함수
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
