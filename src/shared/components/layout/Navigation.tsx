import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * 네비게이션 컴포넌트
 * 하단 네비게이션 바와 로그아웃 모달을 제공
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    // 로그아웃 기능 제거됨
    setShowLogoutModal(false);
  };

  /**
   * 페이지 네비게이션 처리
   * @param path - 이동할 경로
   */
  const handleNavigation = (path: string) => {
    // 스크롤을 최상단으로 이동
    window.scrollTo(0, 0);
    // 페이지 이동
    navigate(path);
  };

  /**
   * 네비게이션 아이템 정의
   */
  const navItems = [
    { path: '/', icon: '🏠', label: '홈' },
    { path: '/request', icon: '🙏', label: '요청' },
    { path: '/offer', icon: '🤝', label: '제안' },
    { path: '/my-activity', icon: '📋', label: '현황' },
    {
      path: '/my-page',
      icon: '👤',
      label: `${user?.memberName || '내페이지'}님`,
    },
  ];

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 py-2 grid grid-cols-5 gap-1 shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-gray-800 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:scale-95'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">로그아웃</h2>
              <p className="text-gray-600 mb-8">정말 로그아웃 하시겠습니까?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="btn-outline flex-1"
                >
                  취소
                </button>
                <button onClick={handleLogout} className="btn-danger flex-1">
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
