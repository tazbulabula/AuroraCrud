export default function Clientes() {
  const clientes = [
    { id: 1, nome: 'João Silva', email: 'joao@email.com', status: 'Ativo', plano: 'Premium' },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com', status: 'Ativo', plano: 'Básico' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', status: 'Inativo', plano: 'Premium' },
    { id: 4, nome: 'Ana Oliveira', email: 'ana@email.com', status: 'Ativo', plano: 'Empresarial' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Clientes</h1>
          <p className="text-gray-600 text-sm">Lista de clientes cadastrados no sistema</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span>➕</span> Novo Cliente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Plano</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900">{cliente.id}</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{cliente.nome}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{cliente.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    cliente.status === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cliente.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {cliente.plano}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3 transition-colors">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>Mostrando 4 clientes</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Anterior</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Próximo</button>
        </div>
      </div>
    </div>
  );
}
