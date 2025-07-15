import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  memberId: number;
  memberLoginId: string;
  memberName: string;
  carId: number;
  carNumber: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggingIn: boolean;
  setLoginUser: (userData: User) => void;
  setLoggingIn: (isLoading: boolean) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const setLoginUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('parking_user', JSON.stringify(userData));
  };

  const setLoggingIn = (isLoading: boolean) => {
    setIsLoggingIn(isLoading);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parking_user');
  };

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
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
