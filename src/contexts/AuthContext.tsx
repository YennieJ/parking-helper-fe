import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';

interface User {
  id: number;
  employeeNumber: string;
  name: string;
  carNumber: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (employeeNumber: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const loginMutation = useLogin();

  useEffect(() => {
    // 페이지 로드 시 저장된 로그인 정보 확인
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // id를 명시적으로 숫자로 변환
        parsedUser.id = Number(parsedUser.id);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('parking_user');
      }
    }
  }, []);

  const login = async (employeeNumber: string): Promise<boolean> => {
    try {
      const result = await loginMutation.mutateAsync({
        memberLoginId: employeeNumber,
      });

      // HTTP 상태 코드가 200이면 성공, 400이면 에러가 이미 던져짐
      // API 응답을 프론트엔드 형식으로 변환
      const userData = {
        id: result.id,
        employeeNumber: result.memberLoginId,
        name: result.memberName,
        carNumber: result.cars?.[0]?.carNumber || '',
        email: result.email,
      };

      setUser(userData);
      localStorage.setItem('parking_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      return false;
    }
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
        isLoading: loginMutation.isPending,
        login,
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
