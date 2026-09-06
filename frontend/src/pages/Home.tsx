import React from 'react';
import { authService } from '@/services/authService';

const Home: React.FC = () => {
  const user = authService.getUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bem-vindo, {user?.name || 'Usuário'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Dashboard do Aurora CRUD
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-800">1,234</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Produtos</p>
              <p className="text-2xl font-bold text-gray-800">567</p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pedidos Hoje</p>
              <p className="text-2xl font-bold text-gray-800">89</p>
            </div>
            <span className="text-3xl">🛒</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faturamento</p>
              <p className="text-2xl font-bold text-green-600">R$ 12.450</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
      </div>

      {/* Conteúdo adicional */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Atividades Recentes
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-sm text-gray-800">Novo cliente cadastrado</p>
              <p className="text-xs text-gray-500">Há 5 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-gray-800">Venda realizada - R$ 1.200</p>
              <p className="text-xs text-gray-500">Há 15 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-sm text-gray-800">Produto atualizado</p>
              <p className="text-xs text-gray-500">Há 30 minutos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;