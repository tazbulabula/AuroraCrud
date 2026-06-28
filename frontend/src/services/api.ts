
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

const API_URL = 'http://localhost';


const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Erro na requisição:', error.message);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response: AxiosResponse) => {

    return response;
  },
  (error: AxiosError<ApiError>) => {

    
    if (error.response) {
 
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`Erro ${status}:`, data?.message || error.message);
      
 
      switch (status) {
        case 401:
         
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          console.error('Acesso negado. Você não tem permissão.');
          break;
          
        case 404:
          console.error('Recurso não encontrado.');
          break;
          
        case 422:
          console.error('Erro de validação:', data?.errors);
          break;
          
        case 500:
          console.error('Erro interno do servidor.');
          break;
          
        default:
          console.error('Erro na requisição:', data?.message || error.message);
      }
      
      return Promise.reject({
        message: data?.message || 'Erro na requisição',
        status: status,
        errors: data?.errors || {},
      });
      
    } else if (error.request) {
      
      console.error('Sem resposta do servidor:', error.request);
      return Promise.reject({
        message: 'Sem resposta do servidor. Verifique sua conexão.',
        status: 0,
        errors: {},
      });
      
    } else {
      
      console.error('Erro na configuração:', error.message);
      return Promise.reject({
        message: error.message || 'Erro desconhecido',
        status: 0,
        errors: {},
      });
    }
  }
);


export const apiService = {
  
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get(url, config).then(res => res.data);
  },
  
 
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.post(url, data, config).then(res => res.data);
  },
  
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.put(url, data, config).then(res => res.data);
  },
  
 
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.patch(url, data, config).then(res => res.data);
  },
  
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete(url, config).then(res => res.data);
  },
};

export default api;
