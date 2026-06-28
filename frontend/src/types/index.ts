// ============================================
// TIPOS GERAIS DA API
// ============================================

// Resposta padrão da API
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

// Erro da API
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Paginação
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// TIPOS DE USUÁRIO / AUTENTICAÇÃO
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

// ============================================
// TIPOS DE CLIENTES
// ============================================

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  documento?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  status: 'ativo' | 'inativo' | 'pendente';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDTO {
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  documento?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  status?: 'ativo' | 'inativo' | 'pendente';
  observacoes?: string;
}

export interface UpdateClienteDTO extends Partial<CreateClienteDTO> {}

// ============================================
// TIPOS DE PRODUTOS
// ============================================

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  preco_custo?: number;
  quantidade: number;
  quantidade_minima?: number;
  categoria: string;
  subcategoria?: string;
  codigo_barras?: string;
  sku?: string;
  unidade_medida?: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm';
  status: 'ativo' | 'inativo';
  imagem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProdutoDTO {
  nome: string;
  descricao?: string;
  preco: number;
  preco_custo?: number;
  quantidade: number;
  quantidade_minima?: number;
  categoria: string;
  subcategoria?: string;
  codigo_barras?: string;
  sku?: string;
  unidade_medida?: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm';
  status?: 'ativo' | 'inativo';
  imagem?: string;
}

export interface UpdateProdutoDTO extends Partial<CreateProdutoDTO> {}

// ============================================
// TIPOS DE PEDIDOS / VENDAS
// ============================================

export interface Pedido {
  id: number;
  cliente_id: number;
  cliente?: Cliente;
  produtos: PedidoItem[];
  total: number;
  desconto?: number;
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia';
  status: 'pendente' | 'pago' | 'cancelado' | 'entregue';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  produto_id: number;
  produto?: Produto;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface CreatePedidoDTO {
  cliente_id: number;
  produtos: Array<{
    produto_id: number;
    quantidade: number;
  }>;
  desconto?: number;
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia';
  observacoes?: string;
}

// ============================================
// TIPOS DE FORNECEDORES
// ============================================

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TIPOS PARA FILTROS E PARÂMETROS
// ============================================

export interface FilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ClienteFilterParams extends FilterParams {
  tipo_pessoa?: 'fisica' | 'juridica';
  status?: 'ativo' | 'inativo' | 'pendente';
}

export interface ProdutoFilterParams extends FilterParams {
  categoria?: string;
  status?: 'ativo' | 'inativo';
  min_preco?: number;
  max_preco?: number;
}

// ============================================
// TIPOS PARA FORMULÁRIOS
// ============================================

export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface FormFieldError {
  field: string;
  message: string;
}

// ============================================
// TIPOS PARA ESTADO GLOBAL
// ============================================

export interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: 'light' | 'dark';
}

// ============================================
// TIPOS PARA COMPONENTES
// ============================================

export interface OptionType {
  value: string | number;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================
// TIPOS PARA NOTIFICAÇÕES
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

// ============================================
// TIPOS PARA GRÁFICOS E ESTATÍSTICAS
// ============================================

export interface DashboardStats {
  total_clientes: number;
  total_produtos: number;
  total_pedidos: number;
  faturamento_mes: number;
  faturamento_ano: number;
  clientes_ativos: number;
  produtos_baixo_estoque: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

// ============================================
// TIPOS PARA UPLOAD DE ARQUIVOS
// ============================================

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// ============================================
// TIPOS PARA PERMISSÕES
// ============================================

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

// ============================================
// TIPOS PARA LOGS
// ============================================

export interface Log {
  id: number;
  user_id?: number;
  user?: User;
  action: string;
  table?: string;
  record_id?: number;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// TIPOS PARA CONFIGURAÇÕES
// ============================================

export interface SystemSettings {
  app_name: string;
  app_version: string;
  maintenance_mode: boolean;
  max_upload_size: number;
  allowed_file_types: string[];
  timezone: string;
  date_format: string;
  currency: string;
}

// ============================================
// TIPOS UTILITÁRIOS
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OmitRequired<T, K extends keyof T> = Omit<T, K>;

// ============================================
// EXPORTAÇÕES GERAIS
// ============================================

export default {
  // Usuários
  User,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  
  // Clientes
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  
  // Produtos
  Produto,
  CreateProdutoDTO,
  UpdateProdutoDTO,
  
  // Pedidos
  Pedido,
  PedidoItem,
  CreatePedidoDTO,
  
  // API
  ApiResponse,
  ApiError,
  PaginatedResponse,
  
  // Filtros
  FilterParams,
  ClienteFilterParams,
  ProdutoFilterParams,
  
  // Utilitários
  Nullable,
  Optional,
  DeepPartial,
};
