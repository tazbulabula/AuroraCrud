import React, { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import type { Produto, CreateProdutoDTO, UpdateProdutoDTO } from '@/types';

import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/contexts/ToastContext';

const Produtos: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<CreateProdutoDTO | UpdateProdutoDTO>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    produtoId: 0,
    produtoNome: '',
    loading: false,
  });

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const data = await productService.listarTodos();
      setProdutos(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos');
      toastError('Erro ao carregar a lista de produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoProduto = () => {
    setProdutoEditando(null);
    setModalTitle('Novo Produto');
    setFormData({ name: '', description: '', price: 0, stock: 0 });
    setModalOpen(true);
  };

  const handleEditar = (produto: Produto) => {
    setProdutoEditando(produto);
    setModalTitle('Editar Produto');
    setFormData({
      name: produto.name,
      description: produto.description || '',
      price: produto.price,
      stock: produto.stock,
    });
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (produtoEditando) {
        const produtoAtualizado = await productService.atualizar(produtoEditando.id, formData);
        setProdutos(prev => prev.map(p => p.id === produtoEditando.id ? { ...p, ...produtoAtualizado } : p));
        success(`Produto "${formData.name}" atualizado com sucesso!`);
      } else {
        const novoProduto = await productService.criar(formData as CreateProdutoDTO);
        setProdutos(prev => [...prev, novoProduto]);
        success(`Produto "${formData.name}" criado com sucesso!`);
      }
      setModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat().join('\n');
        toastError(errorMessages || 'Erro de validação');
      } else {
        toastError(error.response?.data?.message || 'Erro ao salvar produto');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarDeletar = (id: number, nome: string) => {
    setConfirmDialog({ isOpen: true, produtoId: id, produtoNome: nome, loading: false });
  };

  const handleDeletar = async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await productService.deletar(confirmDialog.produtoId);
      setProdutos(prev => prev.filter(p => p.id !== confirmDialog.produtoId));
      success(`Produto "${confirmDialog.produtoNome}" deletado com sucesso!`);
      setConfirmDialog({ isOpen: false, produtoId: 0, produtoNome: '', loading: false });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toastError('Erro ao deletar produto');
      await carregarProdutos();
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600">Carregando produtos...</div></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Produtos</h1>
          <p className="text-gray-600 text-sm">Total: {produtos.length} produtos cadastrados</p>
        </div>
        <button onClick={handleNovoProduto} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span>➕</span> Novo Produto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum produto cadastrado</td></tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{produto.id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{produto.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{produto.description || '-'}</td>
                  <td className="py-3 px-4 text-sm font-medium text-green-600">R$ {Number(produto.price).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.stock > 10 ? 'bg-green-100 text-green-800' :
                      produto.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {produto.stock} unidades
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleEditar(produto)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3 transition-colors">✏️ Editar</button>
                    <button onClick={() => handleConfirmarDeletar(produto.id, produto.name)} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">🗑️ Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <form onSubmit={handleSalvar}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do produto" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Descrição</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descrição do produto" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Preço *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" min="0" step="0.01" required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Estoque *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" min="0" required />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleDeletar}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o produto "${confirmDialog.produtoNome}"?\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        loading={confirmDialog.loading}
      />
    </div>
  );
};

export default Produtos;