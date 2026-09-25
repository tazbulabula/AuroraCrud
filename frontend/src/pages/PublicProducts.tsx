import React, { useState, useEffect } from 'react';
import productApi from '@/services/productApi';
import { formatKwanza } from '@/utils/format';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface OrderData {
    product_id: number;
    buyer_name: string;
    buyer_phone: string;
    buyer_address: string;
    buyer_email: string;
    buyer_notes: string;
    quantity: number;
    guest_id: string;
}

const PublicProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderResult, setOrderResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [orderData, setOrderData] = useState<OrderData>({
        product_id: 0,
        buyer_name: '',
        buyer_phone: '',
        buyer_address: '',
        buyer_email: '',
        buyer_notes: '',
        quantity: 1,
        guest_id: '',
    });

    useEffect(() => {
        loadProducts();
        const guestId = localStorage.getItem('guest_id') || 'guest_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('guest_id', guestId);
        setOrderData(prev => ({ ...prev, guest_id: guestId }));
    }, []);

    const loadProducts = async () => {
        try {
            const response = await productApi.get('/products/public');
            setProducts(response.data);
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = (product: Product) => {
        setSelectedProduct(product);
        setOrderData(prev => ({ ...prev, product_id: product.id, quantity: 1 }));
        setShowCheckout(true);
        setError('');
        setShowSuccess(false);
    };

    const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setOrderData({ ...orderData, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await productApi.post('/orders', orderData);
            setShowCheckout(false);
            setShowSuccess(true);
            setOrderResult(response.data.order);
            loadProducts();
            
            const savedOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
            savedOrders.push({
                tracking_code: response.data.order.tracking_code,
                product_name: selectedProduct?.name,
                date: new Date().toISOString(),
            });
            localStorage.setItem('guest_orders', JSON.stringify(savedOrders));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao realizar pedido');
        }
    };

    // Filtrar produtos pela busca
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Carregando produtos...</p>
                </div>
            </div>
        );
    }

    if (showSuccess && orderResult) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-white border border-green-100 rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-green-100/50">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                        <span className="text-5xl">🎉</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Pedido Realizado!
                    </h2>
                    <p className="text-gray-600 mb-8">
                        O vendedor foi notificado e entrará em contacto brevemente.
                    </p>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
                        <p className="text-sm text-gray-600 mb-2">Código de Rastreio</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            {orderResult.tracking_code}
                        </p>
                        <p className="text-xs text-gray-500">
                            Guarde este código para acompanhar o seu pedido
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-200"
                        >
                            Continuar a Comprar
                        </button>
                        <a
                            href="/track"
                            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 font-semibold"
                        >
                            Rastrear Pedido
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-16 mb-12 shadow-2xl shadow-indigo-200">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0ek0yNCAzNGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
                        <span>🇦🇴</span>
                        <span>Marketplace Angolano</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Encontre os melhores produtos
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                        Compre com segurança e receba em casa. Sem necessidade de cadastro, 
                        com pagamento na entrega.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
                            ✅ Compra sem cadastro
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
                            🚚 Entrega em casa
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
                            💵 Pagamento na entrega
                        </span>
                    </div>
                </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Produtos Disponíveis
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {filteredProducts.length} produto(s) encontrado(s)
                    </p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="🔍 Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 bg-white"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        🔍
                    </span>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-5xl">📦</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Tente uma busca diferente' : 'Volte mais tarde para ver novidades'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                        >
                            {/* Imagem/Placeholder */}
                            <div className="relative h-48 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                                <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                                    📦
                                </span>
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
                                        product.stock > 10 
                                            ? 'bg-green-500/90 text-white' 
                                            : product.stock > 0 
                                            ? 'bg-yellow-500/90 text-white'
                                            : 'bg-red-500/90 text-white'
                                    }`}>
                                        {product.stock > 0 ? `${product.stock} un.` : 'Esgotado'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Conteúdo */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                    {product.description || 'Sem descrição'}
                                </p>
                                
                                <div className="border-t border-gray-100 pt-4 mt-auto">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                        {formatKwanza(product.price)}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <span>🏪</span>
                                        <span>{product.user?.name || 'Vendedor'}</span>
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => handleBuy(product)}
                                    disabled={product.stock === 0}
                                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] disabled:shadow-none"
                                >
                                    {product.stock === 0 ? 'Indisponível' : '🛒 Comprar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Checkout */}
            {showCheckout && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Finalizar Compra
                                </h2>
                                <p className="text-sm text-gray-500">Preencha os seus dados</p>
                            </div>
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <p className="font-semibold text-gray-800 mb-1">{selectedProduct.name}</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatKwanza(selectedProduct.price)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Estoque: {selectedProduct.stock} unidades
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    name="buyer_name"
                                    value={orderData.buyer_name}
                                    onChange={handleOrderChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Telefone *
                                </label>
                                <input
                                    type="tel"
                                    name="buyer_phone"
                                    value={orderData.buyer_phone}
                                    onChange={handleOrderChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="+244 9XX XXX XXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email (opcional)
                                </label>
                                <input
                                    type="email"
                                    name="buyer_email"
                                    value={orderData.buyer_email}
                                    onChange={handleOrderChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Endereço de Entrega *
                                </label>
                                <textarea
                                    name="buyer_address"
                                    value={orderData.buyer_address}
                                    onChange={handleOrderChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                    placeholder="Rua, número, bairro, município, província"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantidade
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={orderData.quantity}
                                    onChange={handleOrderChange}
                                    min="1"
                                    max={selectedProduct.stock}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Observações (opcional)
                                </label>
                                <textarea
                                    name="buyer_notes"
                                    value={orderData.buyer_notes}
                                    onChange={handleOrderChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                    placeholder="Referências para entrega, horário preferido, etc."
                                />
                            </div>

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800 flex items-center gap-2">
                                    <span>💵</span>
                                    <span><strong>Pagamento na entrega</strong> - Pague em dinheiro ou Multicaixa ao receber</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02]"
                            >
                                ✅ Confirmar Compra
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProducts;