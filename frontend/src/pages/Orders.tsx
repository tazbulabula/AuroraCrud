import React, { useState, useEffect } from 'react';
import { orderService, notificationService, Order, Notification } from '@/services/orderService';
import { formatKwanza, formatDate } from '@/utils/format';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/contexts/ToastContext';

const Orders: React.FC = () => {
    const { success, error: toastError } = useToast();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        orderId: 0,
        action: '' as 'confirm' | 'deliver',
        loading: false,
    });

    useEffect(() => {
        loadData();
    }, []);

    // ✅ Usar orderService e notificationService
    const loadData = async () => {
        try {
            setLoading(true);
            const [ordersData, notifsData] = await Promise.all([
                orderService.listarTodos(),
                notificationService.listarTodas(),
            ]);
            setOrders(ordersData);
            setNotifications(notifsData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            toastError('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Confirmar pedido
    const handleConfirmOrder = async (orderId: number) => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await orderService.confirmar(orderId);
            success('Pedido confirmado com sucesso!');
            await loadData();
            setConfirmDialog({ isOpen: false, orderId: 0, action: 'confirm', loading: false });
        } catch (err) {
            console.error('Erro ao confirmar pedido:', err);
            toastError('Erro ao confirmar pedido');
            setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
    };

    // ✅ Marcar como entregue
    const handleDeliverOrder = async (orderId: number) => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await orderService.entregar(orderId);
            success('Pedido marcado como entregue!');
            await loadData();
            setConfirmDialog({ isOpen: false, orderId: 0, action: 'deliver', loading: false });
        } catch (err) {
            console.error('Erro ao entregar pedido:', err);
            toastError('Erro ao marcar como entregue');
            setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
    };

    // ✅ Marcar notificação como lida
    const handleMarkRead = async (notificationId: number) => {
        try {
            await notificationService.marcarComoLida(notificationId);
            await loadData();
        } catch (err) {
            console.error('Erro ao marcar notificação:', err);
        }
    };

    // ✅ Marcar todas como lidas
    const handleMarkAllRead = async () => {
        try {
            const unread = notifications.filter(n => !n.read);
            await Promise.all(
                unread.map(n => notificationService.marcarComoLida(n.id))
            );
            success('Todas as notificações marcadas como lidas!');
            await loadData();
        } catch (err) {
            console.error('Erro ao marcar todas:', err);
            toastError('Erro ao marcar notificações');
        }
    };

    const openConfirmDialog = (orderId: number, action: 'confirm' | 'deliver') => {
        setConfirmDialog({ isOpen: true, orderId, action, loading: false });
    };

    // ✅ Filtrar pedidos
    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = 
            order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // ✅ Estatísticas
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        faturamento: orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + Number(o.total_price), 0),
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
        pending: { label: 'Pendente', bg: 'bg-amber-100', text: 'text-amber-800', icon: '⏳' },
        confirmed: { label: 'Confirmado', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
        delivered: { label: 'Entregue', bg: 'bg-blue-100', text: 'text-blue-800', icon: '📦' },
        cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">A carregar pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ===== HEADER ===== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        🛒 Gestão de Pedidos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Acompanhe e gerencie todos os pedidos recebidos
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-indigo-200 text-sm"
                    >
                        🔔 Marcar todas como lidas ({unreadCount})
                    </button>
                )}
            </div>

            {/* ===== CARDS DE ESTATÍSTICAS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md mb-3">
                        <span className="text-lg">📋</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md mb-3">
                        <span className="text-lg">⏳</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md mb-3">
                        <span className="text-lg">✅</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Confirmados</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.confirmed}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md mb-3">
                        <span className="text-lg">💰</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Faturamento</p>
                    <p className="text-lg font-bold text-emerald-600">
                        {formatKwanza(stats.faturamento)}
                    </p>
                </div>
            </div>

            {/* ===== NOTIFICAÇÕES ===== */}
            {notifications.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">🔔 Notificações</h2>
                            <p className="text-sm text-gray-500">
                                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
                            </p>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 10).map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 border-b border-gray-50 flex items-center justify-between gap-3 transition-colors ${
                                    !notif.read ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                        !notif.read ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300'
                                    }`}></div>
                                    <p className={`text-sm flex-1 ${!notif.read ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!notif.read && (
                                        <button
                                            onClick={() => handleMarkRead(notif.id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold whitespace-nowrap"
                                        >
                                            Marcar
                                        </button>
                                    )}
                                    <span className="text-xs text-gray-400 whitespace-nowrap hidden md:block">
                                        {formatDate(notif.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== FILTROS E BUSCA ===== */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por cliente, produto ou código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                                filter === 'all'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Todos ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                                filter === 'pending'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            ⏳ Pendentes ({stats.pending})
                        </button>
                        <button
                            onClick={() => setFilter('confirmed')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                                filter === 'confirmed'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            ✅ Confirmados ({stats.confirmed})
                        </button>
                        <button
                            onClick={() => setFilter('delivered')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                                filter === 'delivered'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            📦 Entregues ({stats.delivered})
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== LISTA DE PEDIDOS ===== */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📭</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                        {searchTerm || filter !== 'all' 
                            ? 'Nenhum resultado encontrado'
                            : 'Nenhum pedido recebido ainda'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm || filter !== 'all'
                            ? 'Tente ajustar os filtros ou a busca'
                            : 'Quando alguém comprar os seus produtos, aparecerá aqui'}
                    </p>
                    {(searchTerm || filter !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilter('all'); }}
                            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                    {/* Info Principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl">📦</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-800 truncate">
                                                    {order.product?.name || 'Produto'}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-mono">
                                                    {order.tracking_code}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span>👤</span>
                                                <span className="truncate">{order.buyer_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span>📞</span>
                                                <span>{order.buyer_phone}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                                                <span>📍</span>
                                                <span className="flex-1">{order.buyer_address}</span>
                                            </div>
                                            {order.buyer_notes && (
                                                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 rounded-xl p-3 sm:col-span-2">
                                                    <span>📝</span>
                                                    <span className="flex-1 text-sm">{order.buyer_notes}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 mt-4">
                                            <span className="text-sm text-gray-600">
                                                Quantidade: <strong>{order.quantity}</strong>
                                            </span>
                                            <span className="text-sm font-bold text-emerald-600">
                                                {formatKwanza(order.total_price)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status e Ações */}
                                    <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.bg} ${status.text}`}>
                                            {status.icon} {status.label}
                                        </span>

                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => openConfirmDialog(order.id, 'confirm')}
                                                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all text-sm font-semibold shadow-md shadow-emerald-200"
                                            >
                                                ✅ Confirmar
                                            </button>
                                        )}

                                        {order.status === 'confirmed' && (
                                            <button
                                                onClick={() => openConfirmDialog(order.id, 'deliver')}
                                                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all text-sm font-semibold shadow-md shadow-blue-200"
                                            >
                                                📦 Marcar Entregue
                                            </button>
                                        )}

                                        {order.status === 'delivered' && (
                                            <span className="text-xs text-emerald-600 font-semibold">
                                                ✓ Concluído
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== DIÁLOGO DE CONFIRMAÇÃO ===== */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={() => 
                    confirmDialog.action === 'confirm'
                        ? handleConfirmOrder(confirmDialog.orderId)
                        : handleDeliverOrder(confirmDialog.orderId)
                }
                title={confirmDialog.action === 'confirm' ? 'Confirmar Pedido' : 'Marcar como Entregue'}
                message={
                    confirmDialog.action === 'confirm'
                        ? 'Confirma este pedido? O cliente será notificado.'
                        : 'Marcar este pedido como entregue? O cliente será notificado.'
                }
                confirmText={confirmDialog.action === 'confirm' ? 'Confirmar' : 'Marcar Entregue'}
                cancelText="Cancelar"
                confirmColor={confirmDialog.action === 'confirm' ? 'green' : 'blue'}
                loading={confirmDialog.loading}
            />
        </div>
    );
};

export default Orders;