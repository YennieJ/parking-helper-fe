import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * 사용자 정보 인터페이스
 */
export interface User {
  memberId: number;
  memberLoginId: string;
  memberName: string;
  carId: number;
  carNumber: string;
  email: string;
}

/**
 * 인증 컨텍스트 타입
 */
interface AuthContextType {
  user: User | null;
  isLoggingIn: boolean;
  setLoginUser: (userData: User) => void;
  setLoggingIn: (isLoading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 프로바이더 컴포넌트
 * 사용자 로그인 상태와 정보를 전역적으로 관리
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 저장된 로그인 정보 확인
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // id를 명시적으로 숫자로 변환
        parsedUser.memberId = Number(parsedUser.memberId);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('parking_user');
      }
    }
  }, []);

  /**
   * 로그인 사용자 정보 설정
   * @param userData - 사용자 정보
   */
  const setLoginUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('parking_user', JSON.stringify(userData));
  };

  /**
   * 로그인 상태 설정
   * @param isLoading - 로그인 진행 중 여부
   */
  const setLoggingIn = (isLoading: boolean) => {
    setIsLoggingIn(isLoading);
  };

  /**
   * 로그아웃 처리
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('parking_user');
  };

  /**
   * 사용자 정보 부분 업데이트
   * @param userData - 업데이트할 사용자 정보
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('parking_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggingIn,
        setLoginUser,
        setLoggingIn,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 인증 컨텍스트 훅
 * AuthProvider 내부에서만 사용 가능
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
