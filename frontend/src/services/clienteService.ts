import api from './api';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types';

export const clienteService = {
  // Listar todos os clientes
  async listarTodos(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/api/clientes');
    return data;
  },

  // Registrar novo cliente
  async registrar(data: CreateClienteDTO): Promise<Cliente> {
    const { data: cliente } = await api.post<Cliente>('/api/clientes/register', data);
    return cliente;
  },

  // Atualizar cliente
  async atualizar(id: number, data: UpdateClienteDTO): Promise<Cliente> {
    const { data: cliente } = await api.put<Cliente>(`/api/clientes/${id}`, data);
    return cliente;
  },

  // Deletar cliente
  async deletar(id: number): Promise<void> {
    await api.delete(`/api/clientes/${id}`);
  },
};