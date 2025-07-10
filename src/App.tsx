import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient'; // 이미 만든 queryClient 가져오기
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { env } from './config/env';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import EmployeeOfMonth from './pages/EmployeeOfMonth';
import LoginPage from './pages/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/employee-of-month" element={<EmployeeOfMonth />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
};

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
      {env.IS_DEVELOPMENT && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;
