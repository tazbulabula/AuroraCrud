import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const userData = authService.getUser();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await authService.login(email, senha);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}