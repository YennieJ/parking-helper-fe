import React from 'react';

interface HeaderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  rightAction?: {
    icon: string;
    onClick: () => void;
    className?: string;
  };
  className?: string;
}

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
      <div className="flex items-center justify-between w-full">
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
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            className={`text-gray-500 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 ${
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
