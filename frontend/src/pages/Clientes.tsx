import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '@/services/clienteService';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types';
import ClienteModal from '@/components/ClienteModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/contexts/ToastContext';

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { canViewClientes, canCreateClientes, canEditClientes, canDeleteClientes } = usePermissions();
  const { success, error: toastError } = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modais
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  
  // Estados para diálogo de confirmação
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    clienteId: 0,
    clienteNome: '',
    loading: false,
  });

  // Verificar permissão e carregar dados
  useEffect(() => {
    // Se ainda está carregando, não faz nada
    if (authLoading) {
      console.log('⏳ Aguardando carregamento do usuário...');
      return;
    }

    console.log('✅ Usuário carregado:', user);
    console.log('🔍 canViewClientes:', canViewClientes());

    // Se não tem permissão, redireciona
    if (!canViewClientes()) {
      toastError('Você não tem permissão para acessar esta página');
      navigate('/');
      return;
    }

    // Se tem permissão, carrega os clientes
    console.log('✅ Tem permissão! Carregando clientes...');
    carregarClientes();
  }, [authLoading, user]); // ← Dependências corretas

  // Carregar clientes (apenas ADMIN pode ver)
  const carregarClientes = async () => {
    if (!canViewClientes()) {
      console.log('❌ Sem permissão para carregar clientes');
      return;
    }
    
    try {
      setLoading(true);
      console.log('📡 Buscando clientes...');
      const data = await clienteService.listarTodos();
      console.log('✅ Clientes carregados:', data);
      setClientes(data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes');
      toastError('Erro ao carregar a lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de criação
  const handleNovoCliente = () => {
    if (!canCreateClientes()) {
      toastError('Você não tem permissão para criar clientes');
      return;
    }
    setClienteEditando(null);
    setModalTitle('Novo Cliente');
    setModalOpen(true);
  };

  // Abrir modal de edição
  const handleEditar = (cliente: Cliente) => {
    if (!canEditClientes()) {
      toastError('Você não tem permissão para editar clientes');
      return;
    }
    setClienteEditando(cliente);
    setModalTitle('Editar Cliente');
    setModalOpen(true);
  };

  // Salvar cliente (criar ou editar)
  const handleSalvar = async (data: CreateClienteDTO | UpdateClienteDTO) => {
    if (!canCreateClientes() && !canEditClientes()) {
      toastError('Você não tem permissão para esta ação');
      return;
    }

    try {
      if (clienteEditando) {
        // Editar
        const clienteAtualizado = await clienteService.atualizar(clienteEditando.id, data);
        
        // Atualizar localmente
        setClientes(prev => prev.map(c => 
          c.id === clienteEditando.id ? { ...c, ...clienteAtualizado } : c
        ));
        
        success(`Cliente "${data.name || clienteEditando.name}" atualizado com sucesso!`);
      } else {
        // Criar
        const novoCliente = await clienteService.registrar(data as CreateClienteDTO);
        setClientes(prev => [...prev, novoCliente]);
        success(`Cliente "${data.name}" criado com sucesso!`);
      }
      
      setModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat().join('\n');
        toastError(errorMessages || 'Erro de validação');
      } else {
        toastError(error.response?.data?.message || 'Erro ao salvar cliente');
      }
      
      // Recarregar para garantir consistência
      await carregarClientes();
    }
  };

  // Abrir diálogo de confirmação para deletar
  const handleConfirmarDeletar = (id: number, nome: string) => {
    if (!canDeleteClientes()) {
      toastError('Você não tem permissão para deletar clientes');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      clienteId: id,
      clienteNome: nome,
      loading: false,
    });
  };

  // Deletar cliente
  const handleDeletar = async () => {
    if (!canDeleteClientes()) return;
    
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await clienteService.deletar(confirmDialog.clienteId);
      
      // Remover localmente
      setClientes(prev => prev.filter(c => c.id !== confirmDialog.clienteId));
      
      success(`Cliente "${confirmDialog.clienteNome}" deletado com sucesso!`);
      setConfirmDialog({ isOpen: false, clienteId: 0, clienteNome: '', loading: false });
      
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toastError('Erro ao deletar cliente');
      
      // Recarregar para garantir consistência
      await carregarClientes();
      
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // ⭐ Enquanto carrega o usuário, mostra loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando informações do usuário...</div>
      </div>
    );
  }

  // ⭐ Se não tem permissão, não renderiza
  if (!canViewClientes()) {
    return null;
  }

  // ⭐ Enquanto carrega os clientes
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando clientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Clientes</h1>
          <p className="text-gray-600 text-sm">
            Total: {clientes.length} clientes cadastrados
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Logado como: <span className="font-semibold">{user?.name}</span> ({user?.role})
          </p>
        </div>
        
        {/* Botão Novo Cliente - visível apenas para ADMIN */}
        {canCreateClientes() && (
          <button
            onClick={handleNovoCliente}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>➕</span> Novo Cliente
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              {/* Coluna de Ações - visível apenas para ADMIN */}
              {canEditClientes() && (
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={canEditClientes() ? 6 : 5} className="text-center py-8 text-gray-500">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{cliente.id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {cliente.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{cliente.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        cliente.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cliente.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(cliente.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  
                  {/* Coluna de Ações - visível apenas para ADMIN */}
                  {canEditClientes() && (
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEditar(cliente)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleConfirmarDeletar(cliente.id, cliente.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cliente */}
      <ClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSalvar}
        cliente={clienteEditando}
        title={modalTitle}
      />

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleDeletar}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o cliente "${confirmDialog.clienteNome}"?\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        loading={confirmDialog.loading}
      />
    </div>
  );
};

export default Clientes;