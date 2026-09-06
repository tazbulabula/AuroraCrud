
import type { Produto, CreateProdutoDTO, UpdateProdutoDTO } from '@/types';
import productApi from './productApi';

export const productService = {
  // Listar todos os produtos do usuário
  async listarTodos(): Promise<Produto[]> {
    const { data } = await productApi.get<Produto[]>('/products');
    return data;
  },

  // Buscar produto por ID
  async buscarPorId(id: number): Promise<Produto> {
    const { data } = await productApi.get<Produto>(`/products/${id}`);
    return data;
  },

  // Criar novo produto
  async criar(data: CreateProdutoDTO): Promise<Produto> {
    const { data: produto } = await productApi.post<Produto>('/products/create', data);
    return produto;
  },

  // Atualizar produto
  async atualizar(id: number, data: UpdateProdutoDTO): Promise<Produto> {
    const { data: produto } = await productApi.put<Produto>(`/products/update/${id}`, data);
    return produto;
  },

  // Deletar produto
  async deletar(id: number): Promise<void> {
    await productApi.delete(`/products/${id}`);
  },
};