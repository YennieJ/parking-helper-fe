import React from 'react';

const LogoutExitIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 문 - 왼쪽에 열린 문 */}
    <path
      d="M8 8 L8 24 L20 24 L20 8 Z"
      stroke="#374151"
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
    />

    {/* 화살표 - 문 안에서 밖으로 나가는 화살표 */}
    <path
      d="M14 16 L22 16"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 14 L22 16 L20 18"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default LogoutExitIcon;
