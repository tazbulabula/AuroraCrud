import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '@/services/clienteService';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types';
import ClienteModal from '@/components/ClienteModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/contexts/ToastContext';
import { formatDate } from '@/utils/format';

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { canViewClientes, canCreateClientes, canEditClientes, canDeleteClientes } = usePermissions();
  const { success, error: toastError } = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'CLIENT'>('ALL');
  
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

  useEffect(() => {
    if (authLoading) return;

    if (!canViewClientes()) {
      toastError('Não tem permissão para acessar esta página');
      navigate('/dashboard');
      return;
    }

    carregarClientes();
  }, [authLoading, user]);

  const carregarClientes = async () => {
    if (!canViewClientes()) return;
    
    try {
      setLoading(true);
      const data = await clienteService.listarTodos();
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

  const handleNovoCliente = () => {
    if (!canCreateClientes()) {
      toastError('Não tem permissão para criar clientes');
      return;
    }
    setClienteEditando(null);
    setModalTitle('Novo Cliente');
    setModalOpen(true);
  };

  const handleEditar = (cliente: Cliente) => {
    if (!canEditClientes()) {
      toastError('Não tem permissão para editar clientes');
      return;
    }
    setClienteEditando(cliente);
    setModalTitle('Editar Cliente');
    setModalOpen(true);
  };

  const handleSalvar = async (data: CreateClienteDTO | UpdateClienteDTO) => {
    if (!canCreateClientes() && !canEditClientes()) {
      toastError('Não tem permissão para esta ação');
      return;
    }

    try {
      if (clienteEditando) {
        const clienteAtualizado = await clienteService.atualizar(clienteEditando.id, data);
        setClientes(prev => prev.map(c => 
          c.id === clienteEditando.id ? { ...c, ...clienteAtualizado } : c
        ));
        success(`Cliente "${data.name || clienteEditando.name}" atualizado com sucesso!`);
      } else {
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
      
      await carregarClientes();
    }
  };

  const handleConfirmarDeletar = (id: number, nome: string) => {
    if (!canDeleteClientes()) {
      toastError('Não tem permissão para eliminar clientes');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      clienteId: id,
      clienteNome: nome,
      loading: false,
    });
  };

  const handleDeletar = async () => {
    if (!canDeleteClientes()) return;
    
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await clienteService.deletar(confirmDialog.clienteId);
      setClientes(prev => prev.filter(c => c.id !== confirmDialog.clienteId));
      success(`Cliente "${confirmDialog.clienteNome}" eliminado com sucesso!`);
      setConfirmDialog({ isOpen: false, clienteId: 0, clienteNome: '', loading: false });
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      toastError('Erro ao eliminar cliente');
      await carregarClientes();
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // ✅ Filtragem
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchSearch = 
        cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = roleFilter === 'ALL' || cliente.role === roleFilter;
      
      return matchSearch && matchRole;
    });
  }, [clientes, searchTerm, roleFilter]);

  // ✅ Estatísticas
  const stats = useMemo(() => {
    const total = clientes.length;
    const admins = clientes.filter(c => c.role === 'ADMIN').length;
    const clients = clientes.filter(c => c.role === 'CLIENT').length;
    const novosEsteMes = clientes.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;

    return { total, admins, clients, novosEsteMes };
  }, [clientes]);

  // ===== LOADING =====
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">A carregar clientes...</p>
        </div>
      </div>
    );
  }

  if (!canViewClientes()) return null;

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <span className="text-3xl block mb-2">❌</span>
        <p className="font-semibold">{error}</p>
        <button
          onClick={carregarClientes}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              👑 ADMIN
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            👥 Gestão de Clientes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie todos os utilizadores do sistema
          </p>
        </div>

        {canCreateClientes() && (
          <button
            onClick={handleNovoCliente}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105"
          >
            <span className="text-lg">➕</span>
            Novo Cliente
          </button>
        )}
      </div>

      {/* ===== CARDS DE ESTATÍSTICAS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">🏪</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Vendedores</p>
          <p className="text-2xl font-bold text-gray-800">{stats.admins}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">🛒</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Clientes</p>
          <p className="text-2xl font-bold text-gray-800">{stats.clients}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">✨</span>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              +{stats.novosEsteMes}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Novos (mês)</p>
          <p className="text-2xl font-bold text-gray-800">{stats.novosEsteMes}</p>
        </div>
      </div>

      {/* ===== BARRA DE FILTROS ===== */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all bg-white"
            />
          </div>

          {/* Filtro de Role */}
          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                roleFilter === 'ALL'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({clientes.length})
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                roleFilter === 'ADMIN'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🏪 Vendedores
            </button>
            <button
              onClick={() => setRoleFilter('CLIENT')}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                roleFilter === 'CLIENT'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🛒 Clientes
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABELA ===== */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              📋 Lista de Utilizadores
            </h2>
            <p className="text-sm text-gray-500">
              {filteredClientes.length} de {clientes.length} utilizador(es)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-center py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Registado
                </th>
                {canEditClientes() && (
                  <th className="text-right py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={canEditClientes() ? 5 : 4} className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <p className="text-gray-500 font-medium">
                      {searchTerm || roleFilter !== 'ALL'
                        ? 'Nenhum resultado encontrado'
                        : 'Nenhum cliente cadastrado'}
                    </p>
                    {(searchTerm || roleFilter !== 'ALL') && (
                      <button
                        onClick={() => { setSearchTerm(''); setRoleFilter('ALL'); }}
                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                          cliente.role === 'ADMIN'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        }`}>
                          {cliente.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {cliente.name}
                          </p>
                          <p className="text-xs text-gray-400 md:hidden truncate">
                            {cliente.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{cliente.email}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${
                        cliente.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cliente.role === 'ADMIN' ? '🏪 Vendedor' : '🛒 Cliente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <p className="text-xs text-gray-500">
                        {formatDate(cliente.created_at)}
                      </p>
                    </td>
                    {canEditClientes() && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditar(cliente)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleConfirmarDeletar(cliente.id, cliente.name)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAIS ===== */}
      <ClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSalvar}
        cliente={clienteEditando}
        title={modalTitle}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleDeletar}
        title="Confirmar eliminação"
        message={`Tem certeza que deseja eliminar o cliente "${confirmDialog.clienteNome}"?\nEsta ação não pode ser desfeita.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="red"
        loading={confirmDialog.loading}
      />
    </div>
  );
};

export default Clientes;