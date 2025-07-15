import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        {/* 로딩 아이콘 */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl mb-8 shadow-xl">
          <div className="animate-bounce">
            <span className="text-5xl">🚗</span>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <h1 className="text-2xl font-bold text-white mb-4">주차 도우미</h1>

        {/* 로딩 스피너 */}
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/80"></div>
          <span className="ml-3 text-white/80 text-lg">로딩 중...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
