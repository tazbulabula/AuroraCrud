import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface Order {
    id: number;
    product_id: number;
    buyer_name: string;
    buyer_phone: string;
    buyer_address: string;
    buyer_notes: string;
    quantity: number;
    total_price: number;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    viewed: boolean;
    product: {
        name: string;
        price: number;
    };
    notifications: any[];
    created_at: string;
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ordersRes, notifsRes] = await Promise.all([
                api.get('/api/orders'),
                api.get('/api/notifications'),
            ]);
            setOrders(ordersRes.data);
            setNotifications(notifsRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (orderId: number) => {
        try {
            await api.post(`/api/orders/${orderId}/confirm`);
            await loadData();
        } catch (err) {
            console.error('Erro ao confirmar pedido:', err);
        }
    };

    const handleMarkRead = async (notificationId: number) => {
        try {
            await api.post(`/api/notifications/${notificationId}/read`);
            await loadData();
        } catch (err) {
            console.error('Erro ao marcar notificação:', err);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Carregando...</div>;
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📦 Meus Pedidos</h1>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        {unreadCount} notificações novas
                    </span>
                )}
            </div>

            {/* Notificações */}
            {notifications.length > 0 && (
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <h2 className="font-semibold text-gray-700 mb-2">🔔 Notificações</h2>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-3 rounded-lg mb-2 flex justify-between items-center ${!notif.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}
                        >
                            <span className="text-gray-700">{notif.message}</span>
                            <div className="flex items-center gap-2">
                                {!notif.read && (
                                    <button
                                        onClick={() => handleMarkRead(notif.id)}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        Marcar como lida
                                    </button>
                                )}
                                <span className="text-xs text-gray-400">
                                    {new Date(notif.created_at).toLocaleString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pedidos */}
            {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Nenhum pedido recebido ainda.
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {order.product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Comprador: {order.buyer_name}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Telefone: {order.buyer_phone}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Endereço: {order.buyer_address}
                                    </p>
                                    {order.buyer_notes && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            Obs: {order.buyer_notes}
                                        </p>
                                    )}
                                    <div className="mt-2">
                                        <span className="text-sm font-medium">
                                            Quantidade: {order.quantity}
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-green-600">
                                            Total: R$ {order.total_price.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(order.created_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            order.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order.status === 'confirmed'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'delivered'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {order.status === 'pending' && '⏳ Pendente'}
                                        {order.status === 'confirmed' && '✅ Confirmado'}
                                        {order.status === 'delivered' && '📦 Entregue'}
                                        {order.status === 'cancelled' && '❌ Cancelado'}
                                    </span>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleConfirmOrder(order.id)}
                                            className="mt-2 block w-full bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                                        >
                                            Confirmar Pedido
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;