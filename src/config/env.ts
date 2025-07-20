// src/config/env.ts
export const env = {
  APP_TITLE: import.meta.env.VITE_APP_NAME || '주차 도우미',
  API_BASE_URL:
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  IS_DEVELOPMENT: import.meta.env.DEV,
};
