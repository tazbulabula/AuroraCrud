
import type { Produto, CreateProdutoDTO, UpdateProdutoDTO } from '@/types';
import productApi from './productApi';

function toMultipartFormData(data: CreateProdutoDTO | UpdateProdutoDTO): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(
        key,
        value instanceof File ? value : typeof value === 'boolean' ? (value ? '1' : '0') : String(value),
      );
    }
  });

  return formData;
}

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
    const { data: produto } = await productApi.post<Produto>(
      '/products/create',
      toMultipartFormData(data),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return produto;
  },

  // Atualizar produto
  async atualizar(id: number, data: UpdateProdutoDTO): Promise<Produto> {
    const formData = toMultipartFormData(data);
    formData.append('_method', 'PUT');

    const { data: produto } = await productApi.post<Produto>(
      `/products/update/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return produto;
  },

  // Deletar produto
  async deletar(id: number): Promise<void> {
    await productApi.delete(`/products/${id}`);
  },
};