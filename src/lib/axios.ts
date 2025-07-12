import axios from 'axios';

// axios 기본 설정
const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? '' : 'https://parkinghelp.onrender.com',
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error('GET 요청 실패:', error);
    throw error;
  }
};

// PUT 요청을 위한 기본 함수
export const putData = async <T = any>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error) {
    console.error('PUT 요청 실패:', error);
    throw error;
  }
};

// DELETE 요청을 위한 기본 함수
export const deleteData = async <T = any>(url: string): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url);
    return response.data;
  } catch (error) {
    console.error('DELETE 요청 실패:', error);
    throw error;
  }
};

export default apiClient;
