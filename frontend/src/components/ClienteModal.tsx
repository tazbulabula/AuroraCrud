import React, { useState, useEffect } from 'react';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClienteDTO | UpdateClienteDTO) => Promise<void>;
  cliente?: Cliente | null;
  title: string;
}

const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cliente,
  title,
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        name: cliente.name,
        email: cliente.email,
        password: '', // Senha não é enviada na edição se estiver vazia
        role: cliente.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'CLIENT',
      });
    }
    setErrors({});
  }, [cliente, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpar erro do campo ao digitar
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: [] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Preparar dados para envio
      const dataToSend: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };

      // Só incluir password se for novo cliente ou se foi preenchido na edição
      if (!cliente) {
        // Novo cliente: password é obrigatório
        if (!formData.password) {
          setErrors({ password: ['A senha é obrigatória'] });
          setLoading(false);
          return;
        }
        dataToSend.password = formData.password;
      } else if (formData.password) {
        // Edição: só incluir se foi preenchido
        dataToSend.password = formData.password;
      }

      await onSave(dataToSend);
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      
      // Tratar erros de validação
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors || {};
        setErrors(validationErrors);
      } else {
        alert(error.response?.data?.message || 'Erro ao salvar cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Erros gerais */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium text-sm mb-1">Erros de validação:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {Object.entries(errors).map(([field, messages]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {messages.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nome *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome completo"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@exemplo.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {cliente ? 'Nova Senha (opcional)' : 'Senha *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={cliente ? 'Deixe em branco para manter' : 'Mínimo 8 caracteres'}
              minLength={8}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
            )}
            {cliente && (
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para manter a senha atual
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tipo de Usuário
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CLIENT">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteModal;