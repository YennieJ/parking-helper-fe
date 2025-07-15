import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleParkingWebsite = () => {
    // 실제 주차 등록 사이트 URL로 변경 필요
    window.open('http://gidc001.iptime.org:35052/nxpmsc/login', '_blank');
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleNavigation = (path: string) => {
    // 스크롤을 최상단으로 이동
    window.scrollTo(0, 0);
    // 페이지 이동
    navigate(path);
  };

  const navItems = [
    { path: '/', icon: '🏠', label: '홈' },
    { path: '/ranking', icon: '🏆', label: '이달의사원' },
    {
      path: '/parking-register',
      icon: '🚗',
      label: '주차등록 (C2115)',
      isExternal: true,
    },
    {
      path: '/my-page',
      icon: '👤',
      label: `${user?.memberName || '내페이지'}님`,
    },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 py-2 grid grid-cols-4 gap-1 shadow-lg">
        {navItems.map((item) =>
          item.isExternal ? (
            <button
              key={item.path}
              onClick={handleParkingWebsite}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 text-gray-600 hover:text-primary-600 hover:bg-primary-50 active:scale-95"
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ) : (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 active:scale-95'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        )}
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
