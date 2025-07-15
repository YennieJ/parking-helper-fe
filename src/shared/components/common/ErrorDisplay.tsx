import React from 'react';
import type { ErrorInfo } from '../../hooks/useErrorHandler';

interface ErrorDisplayProps {
  error: string | ErrorInfo;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className = '',
}) => {
  if (!error) return null;

  // ErrorInfo 객체인 경우
  if (typeof error === 'object' && 'title' in error) {
    const errorInfo = error as ErrorInfo;
    return (
      <div
        className={`p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="flex items-start gap-2">
          <span className="text-red-500 text-sm">⚠️</span>
          <div className="text-sm text-red-700">
            <div className="font-medium">{errorInfo.title}</div>
            <div className="mt-1 whitespace-pre-line">{errorInfo.message}</div>
          </div>
        </div>
      </div>
    );
  }

  // 문자열인 경우 (기존 방식)
  return (
    <div
      className={`p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-red-500 text-sm">⚠️</span>
        <div className="text-sm text-red-700">
          <div className="font-medium">오류가 발생했습니다</div>
          <div className="mt-1 whitespace-pre-line">{error}</div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
