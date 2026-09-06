// ============================================
// TIPOS DE USUÁRIO / AUTENTICAÇÃO
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expire: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'CLIENT';
}

// ============================================
// TIPOS DE CLIENTES
// ============================================

export interface Cliente {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  created_at: string;
  updated_at: string;
}

export interface CreateClienteDTO {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'CLIENT';
}

export interface UpdateClienteDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'CLIENT';
}


// ============================================
// TIPOS DE PRODUTOS
// ============================================

export interface Produto {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProdutoDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProdutoDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface ProdutoFilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}