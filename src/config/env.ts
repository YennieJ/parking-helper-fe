// src/config/env.ts
interface EnvConfig {
  API_BASE_URL: string;
  APP_TITLE: string;
  PARKING_WEBSITE_URL: string;
  ENVIRONMENT: 'development' | 'production' | 'test';
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
}

// Vite 환경변수 검증 및 기본값 설정
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
};

export const env: EnvConfig = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  APP_TITLE: getEnvVar('VITE_APP_TITLE', '주차 도우미'),
  PARKING_WEBSITE_URL: getEnvVar(
    'VITE_PARKING_WEBSITE_URL',
    'https://parking.example.com'
  ),
  ENVIRONMENT: getEnvVar(
    'VITE_ENVIRONMENT',
    'development'
  ) as EnvConfig['ENVIRONMENT'],
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// 환경변수 검증
export const validateEnv = () => {
  const requiredEnvs = [
    'VITE_API_BASE_URL',
    'VITE_APP_TITLE',
    'VITE_PARKING_WEBSITE_URL',
  ];

  const missingEnvs = requiredEnvs.filter((envVar) => !import.meta.env[envVar]);

  if (missingEnvs.length > 0) {
    console.warn('⚠️ 다음 환경변수들이 설정되지 않았습니다:', missingEnvs);
    console.warn('기본값을 사용합니다.');
  }

  console.log('🔧 환경설정:', {
    environment: env.ENVIRONMENT,
    apiBaseUrl: env.API_BASE_URL,
    appTitle: env.APP_TITLE,
  });
};
