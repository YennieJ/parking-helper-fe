import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './shared/components/ui/Toast';
import { env } from './config/env';
import Navigation from './shared/components/layout/Navigation';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import LoadingScreen from './shared/components/layout/LoadingScreen';
import './App.css';
import RequestPage from './pages/RequestPage';
import OfferPage from './pages/OfferPage';
import MyActivityPage from './pages/MyActivityPage';

/**
 * 앱 컨텐츠 컴포넌트
 * 인증 상태에 따라 로그인 페이지 또는 메인 앱을 렌더링
 */
const AppContent: React.FC = () => {
  const { user, isLoggingIn } = useAuth();

  // 사용자가 로그인하지 않은 경우 로그인 페이지 표시
  if (!user) {
    return (
      <div className="relative">
        <LoginPage />
        {isLoggingIn && (
          <div className="absolute inset-0 z-50">
            <LoadingScreen />
          </div>
        )}
      </div>
    );
  }

  // 로그인된 사용자를 위한 메인 앱 레이아웃
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pb-20 ">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/request" element={<RequestPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/my-activity" element={<MyActivityPage />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
};

/**
 * 메인 앱 컴포넌트
 * 프로바이더들과 라우팅을 설정
 */
function App() {
  useEffect(() => {
    // 앱 제목 설정
    document.title = env.APP_TITLE;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
      {/* 개발 중에만 표시되는 React Query 개발자 도구 */}
      {/* {env.IS_DEVELOPMENT && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
}

export default App;
