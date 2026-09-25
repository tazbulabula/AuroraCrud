import productApi from './productApi';

export interface Order {
  id: number;
  product_id: number;
  user_id: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  buyer_email?: string;
  buyer_notes?: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  tracking_code: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface CreateOrderDTO {
  product_id: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  buyer_email?: string;
  buyer_notes?: string;
  quantity: number;
  guest_id?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  order_id: number;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  order?: Order;
}

export const orderService = {
  // ✅ Criar pedido (público - guest)
  async criar(data: CreateOrderDTO): Promise<{ message: string; order: any }> {
    const { data: response } = await productApi.post('/orders', data);
    return response;
  },

  // ✅ Rastrear pedido (público)
  async rastrear(trackingCode: string): Promise<Order> {
    const { data } = await productApi.get<Order>(`/orders/track/${trackingCode}`);
    return data;
  },

  // ✅ Listar pedidos do vendedor (autenticado)
  async listarTodos(): Promise<Order[]> {
    const { data } = await productApi.get<Order[]>('/orders');
    return data;
  },

  // ✅ Confirmar pedido
  async confirmar(orderId: number): Promise<Order> {
    const { data } = await productApi.post<Order>(`/orders/${orderId}/confirm`);
    return data;
  },

  // ✅ Marcar como entregue
  async entregar(orderId: number): Promise<Order> {
    const { data } = await productApi.post<Order>(`/orders/${orderId}/deliver`);
    return data;
  },
};

export const notificationService = {
  // ✅ Listar notificações do vendedor
  async listarTodas(): Promise<Notification[]> {
    const { data } = await productApi.get<Notification[]>('/notifications');
    return data;
  },

  // ✅ Marcar como lida
  async marcarComoLida(notificationId: number): Promise<void> {
    await productApi.post(`/notifications/${notificationId}/read`);
  },
};