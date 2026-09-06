import api from './api';
import type { User, LoginResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data } = await api.post<LoginResponse>('/api/login', { 
        email, 
        password 
      });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      const userData = await this.getMe();
      localStorage.setItem('user', JSON.stringify(userData));
      
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  async getMe(): Promise<User> {
    try {
      const { data } = await api.get<User>('/api/me');
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const { data } = await api.post<{ access_token: string }>('/api/refresh-token');
      
      localStorage.setItem('token', data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      this.logout();
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Erro ao fazer parse do usuário:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};