import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  employeeNumber: string;
  name: string;
  carNumber: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (employeeNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 임시 사용자 데이터 (실제로는 API에서 가져와야 함)
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    employeeNumber: 'EMP001',
    password: '1234',
    name: '김철수',
    carNumber: '12가 3456',
  },
  {
    id: '2',
    employeeNumber: 'EMP002',
    password: '1234',
    name: '이영희',
    carNumber: '34나 1234',
  },
  {
    id: '3',
    employeeNumber: 'EMP003',
    password: '1234',
    name: '박민수',
    carNumber: '56다 7890',
  },
  {
    id: '4',
    employeeNumber: 'EMP004',
    password: '1234',
    name: '정수민',
    carNumber: '78라 5678',
  },
  {
    id: '5',
    employeeNumber: 'EMP005',
    password: '1234',
    name: '최영수',
    carNumber: '90마 9012',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const login = async (
    employeeNumber: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    // 실제 API 호출 시뮬레이션 (1초 지연)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = MOCK_USERS.find(
      (u) => u.employeeNumber === employeeNumber && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('parking_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
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
      value={{ user, isLoading, login, logout, updateUser }}
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
