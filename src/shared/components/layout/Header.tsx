import React from 'react';

/**
 * 헤더 컴포넌트 Props
 */
interface HeaderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  rightAction?: {
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
  };
  className?: string;
}

/**
 * 페이지 헤더 컴포넌트
 * 페이지 제목, 아이콘, 우측 액션 버튼을 표시
 */
const Header: React.FC<HeaderProps> = ({
  title,
  icon,
  subtitle,
  rightAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-4 shadow-sm h-16 flex items-center ${className}`}
    >
      <div className="flex items-center justify-between w-full md:max-w-[670px] mx-auto">
        {/* 왼쪽 영역: 아이콘과 제목 */}
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-600 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>

        {/* 우측 영역: 액션 버튼 */}
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            className={`text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-xl hover:bg-gray-100 ${
              rightAction.className || ''
            }`}
          >
            <span className="text-lg">{rightAction.icon}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
