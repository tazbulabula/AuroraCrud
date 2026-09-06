
import type { Produto, CreateProdutoDTO, UpdateProdutoDTO } from '@/types';
import productApi from './productApi';

export const productService = {
  // Listar todos os produtos do usuário
  async listarTodos(): Promise<Produto[]> {
    const { data } = await productApi.get<Produto[]>('/api/products');
    return data;
  },

  // Buscar produto por ID
  async buscarPorId(id: number): Promise<Produto> {
    const { data } = await productApi.get<Produto>(`/api/products/${id}`);
    return data;
  },

  // Criar novo produto
  async criar(data: CreateProdutoDTO): Promise<Produto> {
    const { data: produto } = await productApi.post<Produto>('/api/products', data);
    return produto;
  },

  // Atualizar produto
  async atualizar(id: number, data: UpdateProdutoDTO): Promise<Produto> {
    const { data: produto } = await productApi.put<Produto>(`/api/products/${id}`, data);
    return produto;
  },

  // Deletar produto
  async deletar(id: number): Promise<void> {
    await productApi.delete(`/api/products/${id}`);
  },
};