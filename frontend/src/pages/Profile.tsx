import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/contexts/ToastContext';
import { authService } from '@/services/authService';
import api from '@/services/api';
import type { User } from '@/types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Preencher formulário com dados do usuário
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar senha
      if (formData.new_password && formData.new_password !== formData.new_password_confirmation) {
        toastError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      // Preparar dados para enviar
      const dataToSend: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.current_password && formData.new_password) {
        dataToSend.current_password = formData.current_password;
        dataToSend.password = formData.new_password;
        dataToSend.password_confirmation = formData.new_password_confirmation;
      }

      // Atualizar perfil
      const response = await api.put('/api/profile', dataToSend);

      // Atualizar usuário no localStorage
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      success('Perfil atualizado com sucesso!');
      setEditMode(false);
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });

      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat().join('\n');
        toastError(errorMessages || 'Erro de validação');
      } else {
        toastError(error.response?.data?.message || 'Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Usuário não encontrado</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100/50">
        {/* Header do Perfil */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👤 Meu Perfil</h1>
            <p className="text-gray-600 text-sm">
              Gerencie suas informações pessoais
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              user.role === 'ADMIN' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role}
            </span>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {editMode ? 'Cancelar' : '✏️ Editar'}
            </button>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="space-y-6">
          {/* Avatar / Foto */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Formulário de Edição */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editMode 
                      ? 'border-gray-300' 
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editMode 
                      ? 'border-gray-300' 
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Campos de Alteração de Senha (apenas no modo edição) */}
            {editMode && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  🔒 Alterar Senha
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      placeholder="Digite sua senha atual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      placeholder="Digite a nova senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      name="new_password_confirmation"
                      value={formData.new_password_confirmation}
                      onChange={handleChange}
                      placeholder="Confirme a nova senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botão Salvar */}
            {editMode && (
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </form>

          {/* Estatísticas do Usuário */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">1</div>
                <div className="text-xs text-gray-500">Projetos</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">5</div>
                <div className="text-xs text-gray-500">Tarefas</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">12</div>
                <div className="text-xs text-gray-500">Atividades</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">3</div>
                <div className="text-xs text-gray-500">Equipes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;