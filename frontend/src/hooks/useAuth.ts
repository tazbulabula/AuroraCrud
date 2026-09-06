import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = authService.getUser();
        console.log('🔍 useAuth - User loaded:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ useAuth - Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const userData = authService.getUser();
      setUser(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setLoading(false);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}