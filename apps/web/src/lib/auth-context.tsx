'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@opspilot/shared';
import { AuthUserResponseDto } from '@opspilot/api-contracts';

interface AuthContextType {
  user: AuthUserResponseDto | null;
  token: string | null;
  login: (token: string, user: AuthUserResponseDto) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('opspilot_token');
    const storedUser = localStorage.getItem('opspilot_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    } else {
      // Default demo logged-in user for ease of navigation
      const defaultUser: AuthUserResponseDto = {
        id: 'usr-admin-01',
        email: 'admin@opspilot.local',
        firstName: 'Somsak',
        lastName: 'Prasert',
        role: UserRole.ADMIN,
        departmentName: 'IT Infrastructure',
      };
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: AuthUserResponseDto) => {
    localStorage.setItem('opspilot_token', newToken);
    localStorage.setItem('opspilot_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('opspilot_token');
    localStorage.removeItem('opspilot_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
