import React, { useState, useEffect, createContext, useContext } from 'react';

/**
 * 토스트 메시지 인터페이스
 */
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

/**
 * 토스트 컨텍스트 타입
 */
interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * 토스트 훅 - 토스트 컨텍스트를 사용하기 위한 훅
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * 토스트 프로바이더 컴포넌트
 * 전역 토스트 상태를 관리하고 토스트 메시지를 표시
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * 토스트 메시지를 표시
   * @param toast - 표시할 토스트 정보
   */
  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    // 기존 토스트를 모두 제거하고 새 토스트만 표시
    setToasts([newToast]);

    // 자동으로 토스트 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  };

  /**
   * 성공 토스트 메시지 표시
   */
  const showSuccess = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  /**
   * 에러 토스트 메시지 표시
   */
  const showError = (title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  };

  /**
   * 경고 토스트 메시지 표시
   */
  const showWarning = (title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  };

  /**
   * 토스트 메시지 제거
   */
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * 토스트 컨테이너 컴포넌트 Props
 */
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

/**
 * 토스트 컨테이너 컴포넌트
 * 모든 토스트 메시지를 관리하고 표시
 */
const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

/**
 * 토스트 아이템 컴포넌트 Props
 */
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

/**
 * 개별 토스트 메시지 컴포넌트
 * 토스트 메시지의 표시와 애니메이션을 담당
 */
const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 마운트 애니메이션
    setIsVisible(true);
  }, []);

  /**
   * 토스트 닫기 처리
   */
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  /**
   * 토스트 스타일 클래스 반환
   */
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  /**
   * 토스트 아이콘 반환
   */
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out max-w-sm w-full
        ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }
        ${getToastStyles()}
        rounded-xl shadow-xl border-2 p-4 backdrop-blur-lg
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <div className="font-semibold text-sm">{toast.title}</div>
          )}
          {toast.message && (
            <div
              className={`text-sm opacity-90 ${toast.title ? 'mt-1' : 'mt-0'}`}
            >
              {toast.message}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
};
