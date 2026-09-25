import React, { useState } from 'react';
import productApi from '@/services/productApi';
import { formatKwanza, formatDate } from '@/utils/format';

const TrackOrder: React.FC = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await productApi.get(`/orders/track/${trackingCode}`);
            setOrder(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Pedido não encontrado');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const statusLabels: Record<string, { label: string; color: string; icon: string; bg: string }> = {
        pending: { label: 'Pendente', color: 'text-yellow-800', bg: 'bg-yellow-100', icon: '⏳' },
        confirmed: { label: 'Confirmado', color: 'text-green-800', bg: 'bg-green-100', icon: '✅' },
        delivered: { label: 'Entregue', color: 'text-blue-800', bg: 'bg-blue-100', icon: '📦' },
        cancelled: { label: 'Cancelado', color: 'text-red-800', bg: 'bg-red-100', icon: '❌' },
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                    <span className="text-4xl">📦</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Rastrear Pedido
                </h1>
                <p className="text-gray-500">
                    Insira o código de rastreio para acompanhar o seu pedido
                </p>
            </div>

            <form onSubmit={handleTrack} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                        placeholder="Ex: AURO-XXXXXXXX"
                        className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg font-mono"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 font-bold shadow-lg shadow-indigo-200 hover:scale-105"
                    >
                        {loading ? '🔍 Buscando...' : '🔍 Rastrear'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-700 text-center">
                    <span className="text-3xl block mb-2">❌</span>
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            {order && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header do Pedido */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Código de Rastreio</p>
                                <p className="text-2xl font-bold font-mono">{order.tracking_code}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm`}>
                                {statusLabels[order.status]?.icon} {statusLabels[order.status]?.label}
                            </span>
                        </div>
                    </div>

                    {/* Detalhes */}
                    <div className="p-6 space-y-6">
                        {/* Produto */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Produto
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="font-semibold text-gray-800">{order.product?.name || 'Produto'}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-600">
                                        Quantidade: {order.quantity}
                                    </span>
                                    <span className="font-bold text-indigo-600">
                                        {formatKwanza(order.total_price)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Comprador */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Dados de Entrega
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                <p className="text-gray-800 font-medium">{order.buyer_name}</p>
                                <p className="text-sm text-gray-600">📞 {order.buyer_phone}</p>
                                <p className="text-sm text-gray-600">📍 {order.buyer_address}</p>
                            </div>
                        </div>

                        {/* Data */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs text-gray-400 text-center">
                                Pedido realizado em {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;