import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService, Order } from '@/services/orderService';
import { formatKwanza, formatDate } from '@/utils/format';

const TrackOrder: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    
    const [trackingCode, setTrackingCode] = useState(code || '');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // ✅ Se vier código na URL, buscar automaticamente
    useEffect(() => {
        if (code) {
            setTrackingCode(code.toUpperCase());
            handleTrackByCode(code.toUpperCase());
        }
    }, [code]);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleTrackByCode(trackingCode);
    };

    const handleTrackByCode = async (trackingCodeToSearch: string) => {
        if (!trackingCodeToSearch.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);
        setSearched(true);

        try {
            // ✅ Usar o orderService
            const data = await orderService.rastrear(trackingCodeToSearch);
            setOrder(data);
            
            // Atualizar URL se não tiver o código
            if (!code) {
                navigate(`/track/${trackingCodeToSearch}`, { replace: true });
            }
        } catch (err: any) {
            console.error('Erro ao rastrear:', err);
            setError(
                err.response?.data?.error || 
                'Pedido não encontrado. Verifique o código e tente novamente.'
            );
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig: Record<string, { 
        label: string; 
        color: string; 
        bg: string; 
        icon: string; 
        description: string;
        step: number;
    }> = {
        pending: { 
            label: 'Pendente', 
            color: 'text-amber-800', 
            bg: 'bg-amber-100', 
            icon: '⏳',
            description: 'Aguardando confirmação do vendedor',
            step: 1,
        },
        confirmed: { 
            label: 'Confirmado', 
            color: 'text-emerald-800', 
            bg: 'bg-emerald-100', 
            icon: '✅',
            description: 'Pedido confirmado, em preparação',
            step: 2,
        },
        delivered: { 
            label: 'Entregue', 
            color: 'text-blue-800', 
            bg: 'bg-blue-100', 
            icon: '📦',
            description: 'Pedido entregue com sucesso',
            step: 3,
        },
        cancelled: { 
            label: 'Cancelado', 
            color: 'text-red-800', 
            bg: 'bg-red-100', 
            icon: '❌',
            description: 'Pedido cancelado',
            step: 0,
        },
    };

    const steps = [
        { step: 1, label: 'Pendente', icon: '⏳' },
        { step: 2, label: 'Confirmado', icon: '✅' },
        { step: 3, label: 'Entregue', icon: '📦' },
    ];

    const currentStatus = order ? statusConfig[order.status] : null;

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            {/* Header */}
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

            {/* Formulário */}
            <form onSubmit={handleTrack} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                        placeholder="Ex: AURO-XXXXXXXX"
                        className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg font-mono tracking-wider"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg shadow-indigo-200 hover:scale-105"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                A buscar...
                            </span>
                        ) : (
                            '🔍 Rastrear'
                        )}
                    </button>
                </div>
            </form>

            {/* Erro */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-red-700 text-center animate-shake">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <p className="font-bold text-lg mb-2">Pedido não encontrado</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Estado vazio (sem busca) */}
            {!searched && !order && !loading && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🔍</span>
                    </div>
                    <p className="text-gray-500">
                        Introduza o código de rastreio para ver os detalhes do pedido
                    </p>
                </div>
            )}

            {/* Detalhes do Pedido */}
            {order && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* Header do Pedido */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Código de Rastreio</p>
                                <p className="text-2xl md:text-3xl font-bold font-mono tracking-wider">
                                    {order.tracking_code}
                                </p>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
                                order.status === 'cancelled'
                                    ? 'bg-red-500/30 border border-red-300/30'
                                    : 'bg-white/20 border border-white/30'
                            }`}>
                                <span className="text-xl">{currentStatus?.icon}</span>
                                <span className="font-bold">{currentStatus?.label}</span>
                            </div>
                        </div>

                        {currentStatus && (
                            <p className="mt-4 text-sm text-white/90">
                                {currentStatus.description}
                            </p>
                        )}
                    </div>

                    {/* Timeline de Status */}
                    {order.status !== 'cancelled' && (
                        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
                                📍 Progresso do Pedido
                            </h3>
                            
                            <div className="relative">
                                {/* Linha de fundo */}
                                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" 
                                     style={{ width: 'calc(100% - 3rem)', marginLeft: '1.5rem' }}></div>
                                
                                {/* Linha de progresso */}
                                <div 
                                    className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000"
                                    style={{ 
                                        width: `calc(${((currentStatus?.step || 0) - 1) / 2 * 100}% - ${((currentStatus?.step || 0) - 1) / 2 * 3}rem)`,
                                        marginLeft: '1.5rem'
                                    }}
                                ></div>

                                {/* Steps */}
                                <div className="relative flex justify-between">
                                    {steps.map((step, _) => {
                                        const isCompleted = (currentStatus?.step || 0) >= step.step;
                                        const isCurrent = currentStatus?.step === step.step;
                                        
                                        return (
                                            <div key={step.step} className="flex flex-col items-center flex-1">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                                    isCompleted
                                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-white shadow-lg shadow-indigo-200'
                                                        : 'bg-white border-gray-200'
                                                } ${isCurrent ? 'scale-110 ring-4 ring-indigo-100' : ''}`}>
                                                    <span className={`text-xl ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                                                        {step.icon}
                                                    </span>
                                                </div>
                                                <p className={`mt-3 text-xs font-bold text-center ${
                                                    isCompleted ? 'text-indigo-600' : 'text-gray-400'
                                                }`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Informação do Produto */}
                    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                            📦 Produto
                        </h3>
                        
                        <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-3xl">📦</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 mb-1">
                                    {order.product?.name || 'Produto'}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="text-gray-600">
                                        Quantidade: <strong>{order.quantity}</strong>
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-bold text-indigo-600">
                                        {formatKwanza(order.total_price)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dados de Entrega */}
                    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                            🚚 Dados de Entrega
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-xs text-gray-500 mb-1">Nome</p>
                                <p className="font-semibold text-gray-800">{order.buyer_name}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-xs text-gray-500 mb-1">Telefone</p>
                                <p className="font-semibold text-gray-800">{order.buyer_phone}</p>
                            </div>
                            {order.buyer_email && (
                                <div className="p-4 bg-gray-50 rounded-2xl md:col-span-2">
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="font-semibold text-gray-800">{order.buyer_email}</p>
                                </div>
                            )}
                            <div className="p-4 bg-gray-50 rounded-2xl md:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Endereço</p>
                                <p className="font-semibold text-gray-800">{order.buyer_address}</p>
                            </div>
                            {order.buyer_notes && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 md:col-span-2">
                                    <p className="text-xs text-amber-700 mb-1">Observações</p>
                                    <p className="text-sm text-amber-900">{order.buyer_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 text-center">
                        <p className="text-xs text-gray-400">
                            Pedido realizado em {formatDate(order.created_at)}
                        </p>
                    </div>

                    {/* Botão de voltar */}
                    <div className="text-center">
                        <button
                            onClick={() => {
                                setOrder(null);
                                setSearched(false);
                                setTrackingCode('');
                                navigate('/track');
                            }}
                            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all font-semibold"
                        >
                            ← Rastrear outro pedido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;