import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMember } from '../hooks/useMember';

interface User {
  id: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const memberMutation = useMember();

  useEffect(() => {
    // 페이지 로드 시 저장된 로그인 정보 확인
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('parking_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (employeeNumber: string): Promise<boolean> => {
    try {
      const result = await memberMutation.mutateAsync({
        memberId: employeeNumber,
      });

      if (result.Result === 'Success') {
        // API 응답을 프론트엔드 형식으로 변환
        const userData = {
          id: result.Id.toString(),
          employeeNumber: result.MemberLoginId,
          name: result.MemberName,
          carNumber: result.Cars?.[0]?.carNumber || '',
          email: result.Email,
        };

        setUser(userData);
        localStorage.setItem('parking_user', JSON.stringify(userData));
        return true;
      }

      return false;
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
        isLoading: isLoading || memberMutation.isPending,
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
