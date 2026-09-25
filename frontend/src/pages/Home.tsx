import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { productService } from '@/services/productService';
import productApi from '@/services/productApi';
import { formatKwanza, formatDate, formatNumber } from '@/utils/format';

interface DashboardStats {
  totalProdutos: number;
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosConfirmados: number;
  pedidosEntregues: number;
  pedidosCancelados: number;
  faturamento: number;
  faturamentoMes: number;
  ticketMedio: number;
  clientesUnicos: number;
  stockBaixo: number;
  stockTotal: number;
  valorInventario: number;
}

interface Order {
  id: number;
  buyer_name: string;
  total_price: number;
  status: string;
  created_at: string;
  product: { name: string; price: number };
}

interface TopProduct {
  name: string;
  total_vendido: number;
  quantidade: number;
}

const Home: React.FC = () => {
  const user = authService.getUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalProdutos: 0,
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosConfirmados: 0,
    pedidosEntregues: 0,
    pedidosCancelados: 0,
    faturamento: 0,
    faturamentoMes: 0,
    ticketMedio: 0,
    clientesUnicos: 0,
    stockBaixo: 0,
    stockTotal: 0,
    valorInventario: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [produtosRes, ordersRes] = await Promise.allSettled([
        productService.listarTodos(),
        productApi.get('/orders'),
      ]);

      const produtosData = produtosRes.status === 'fulfilled' ? produtosRes.value : [];
      const pedidosData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

      setProdutos(produtosData);

      // ===== CÁLCULOS FINANCEIROS =====
      const pedidosValidos = pedidosData.filter((o: Order) => o.status !== 'cancelled');
      
      const faturamento = pedidosValidos.reduce(
        (sum: number, o: Order) => sum + Number(o.total_price), 0
      );

      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const faturamentoMes = pedidosValidos
        .filter((o: Order) => new Date(o.created_at) >= inicioMes)
        .reduce((sum: number, o: Order) => sum + Number(o.total_price), 0);

      const ticketMedio = pedidosValidos.length > 0 
        ? faturamento / pedidosValidos.length 
        : 0;

      const clientesUnicos = new Set(
        pedidosValidos.map((o: Order) => o.buyer_name)
      ).size;

      // ===== CÁLCULOS DE STOCK =====
      const stockBaixo = produtosData.filter(
        (p: any) => Number(p.stock) <= 5 && Number(p.stock) > 0
      ).length;

      const stockTotal = produtosData.reduce(
        (sum: number, p: any) => sum + Number(p.stock), 0
      );

      const valorInventario = produtosData.reduce(
        (sum: number, p: any) => sum + (Number(p.stock) * Number(p.price)), 0
      );

      // ===== STATUS DOS PEDIDOS =====
      const pedidosPendentes = pedidosData.filter((o: Order) => o.status === 'pending').length;
      const pedidosConfirmados = pedidosData.filter((o: Order) => o.status === 'confirmed').length;
      const pedidosEntregues = pedidosData.filter((o: Order) => o.status === 'delivered').length;
      const pedidosCancelados = pedidosData.filter((o: Order) => o.status === 'cancelled').length;

      setStats({
        totalProdutos: produtosData.length,
        totalPedidos: pedidosData.length,
        pedidosPendentes,
        pedidosConfirmados,
        pedidosEntregues,
        pedidosCancelados,
        faturamento,
        faturamentoMes,
        ticketMedio,
        clientesUnicos,
        stockBaixo,
        stockTotal,
        valorInventario,
      });

      setOrders(
        pedidosData
          .sort((a: Order, b: Order) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 6)
      );

      // ===== TOP PRODUTOS =====
      const productSales: Record<string, { name: string; total: number; qty: number }> = {};
      pedidosValidos.forEach((order: Order) => {
        const name = order.product?.name || 'Desconhecido';
        if (!productSales[name]) {
          productSales[name] = { name, total: 0, qty: 0 };
        }
        productSales[name].total += Number(order.total_price);
        productSales[name].qty += 1;
      });

      setTopProducts(
        Object.values(productSales)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map(p => ({ name: p.name, total_vendido: p.total, quantidade: p.qty }))
      );

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string; icon: string }> = {
      pending: { label: 'Pendente', bg: 'bg-amber-100', text: 'text-amber-800', icon: '⏳' },
      confirmed: { label: 'Confirmado', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
      delivered: { label: 'Entregue', bg: 'bg-blue-100', text: 'text-blue-800', icon: '📦' },
      cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
    };
    return map[status] || map.pending;
  };

  // ===== KPIs PRINCIPAIS =====
  const kpiCards = [
    {
      label: 'Faturamento Total',
      value: stats.faturamento,
      icon: '💰',
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'from-emerald-50 to-teal-50',
      isCurrency: true,
      subtitle: `${formatKwanza(stats.faturamentoMes)} este mês`,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Ticket Médio',
      value: stats.ticketMedio,
      icon: '🎯',
      gradient: 'from-indigo-500 to-purple-500',
      bg: 'from-indigo-50 to-purple-50',
      isCurrency: true,
      subtitle: `${stats.totalPedidos} pedidos`,
      trend: '+5.2%',
      trendUp: true,
    },
    {
      label: 'Clientes Únicos',
      value: stats.clientesUnicos,
      icon: '👥',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-50 to-cyan-50',
      subtitle: 'Compradores',
      trend: '+8.1%',
      trendUp: true,
    },
    {
      label: 'Valor do Inventário',
      value: stats.valorInventario,
      icon: '📦',
      gradient: 'from-amber-500 to-orange-500',
      bg: 'from-amber-50 to-orange-50',
      isCurrency: true,
      subtitle: `${formatNumber(stats.stockTotal)} un. em stock`,
      trend: stats.stockBaixo > 0 ? `${stats.stockBaixo} baixo` : 'OK',
      trendUp: stats.stockBaixo === 0,
    },
  ];

  // ===== STATUS DOS PEDIDOS =====
  const orderStatus = [
    { label: 'Pendentes', value: stats.pedidosPendentes, color: 'bg-amber-500', icon: '⏳' },
    { label: 'Confirmados', value: stats.pedidosConfirmados, color: 'bg-emerald-500', icon: '✅' },
    { label: 'Entregues', value: stats.pedidosEntregues, color: 'bg-blue-500', icon: '📦' },
    { label: 'Cancelados', value: stats.pedidosCancelados, color: 'bg-red-500', icon: '❌' },
  ];

  const totalOrders = stats.totalPedidos || 1;

  return (
    <div className="space-y-6">

      {/* ===== HEADER DO ERP ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0ek0yNCAzNGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                🏢 ERP
              </span>
              <span className="text-xs font-bold bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-300">
                ● SISTEMA ONLINE
              </span>
            </div>
            <p className="text-white/70 text-sm font-medium mb-1">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Utilizador'}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Painel de Gestão Empresarial
            </h1>
            <p className="text-white/70 text-sm">
              Visão consolidada · Atualizado em {new Date().toLocaleString('pt-AO')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
            >
              <option value="7d" className="text-gray-800">Últimos 7 dias</option>
              <option value="30d" className="text-gray-800">Últimos 30 dias</option>
              <option value="90d" className="text-gray-800">Últimos 90 dias</option>
            </select>
            <span className={`px-4 py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm border ${
              user?.role === 'ADMIN'
                ? 'bg-purple-500/30 border-purple-300/30 text-white'
                : 'bg-blue-500/30 border-blue-300/30 text-white'
            }`}>
              {user?.role === 'ADMIN' ? '🏪 Vendedor' : '🛒 Cliente'}
            </span>
          </div>
        </div>
      </div>

      {/* ===== ALERTA DE STOCK BAIXO ===== */}
      {stats.stockBaixo > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 animate-pulse-slow">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">
              Alerta de Stock Baixo
            </h3>
            <p className="text-sm text-red-800">
              <strong>{stats.stockBaixo} produto(s)</strong> estão com stock crítico (≤ 5 unidades).
              Reponha o stock para não perder vendas.
            </p>
          </div>
          <Link
            to="/dashboard/produtos"
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold shadow-md flex-shrink-0"
          >
            Gerir Stock →
          </Link>
        </div>
      )}

      {/* ===== KPIs PRINCIPAIS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                {card.trend && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    card.trendUp 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {card.trendUp ? '▲' : '▼'} {card.trend}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                {card.label}
              </p>

              {loading ? (
                <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                  {card.isCurrency 
                    ? formatKwanza(card.value) 
                    : formatNumber(card.value)
                  }
                </p>
              )}

              {card.subtitle && (
                <p className="text-xs text-gray-400">
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===== GRID PRINCIPAL ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== STATUS DOS PEDIDOS ===== */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              📊 Status dos Pedidos
            </h2>
            <p className="text-sm text-gray-500">
              Distribuição por estado
            </p>
          </div>

          <div className="p-6 space-y-4">
            {orderStatus.map((item, index) => {
              const percent = (item.value / totalOrders) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== TOP PRODUTOS ===== */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                🏆 Top Produtos
              </h2>
              <p className="text-sm text-gray-500">
                Produtos mais vendidos
              </p>
            </div>
            <Link
              to="/dashboard/produtos"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  Sem dados de vendas ainda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-indigo-50/50 rounded-xl transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                      'bg-gradient-to-br from-indigo-400 to-purple-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.quantidade} venda(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {formatKwanza(product.total_vendido)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== PEDIDOS RECENTES ===== */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              📋 Pedidos Recentes
            </h2>
            <p className="text-sm text-gray-500">
              Últimas transações registadas
            </p>
          </div>
          <Link
            to="/dashboard/pedidos"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📭</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                Nenhum pedido recebido ainda
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Data
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="text-center py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-base">📦</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">
                            {order.product?.name || 'Produto'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700">{order.buyer_name}</p>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <p className="text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="text-sm font-bold text-gray-800">
                          {formatKwanza(order.total_price)}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.text} whitespace-nowrap`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===== AÇÕES RÁPIDAS ===== */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            ⚡ Operações Rápidas
          </h2>
          <p className="text-sm text-gray-500">
            Ações mais frequentes do sistema
          </p>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/dashboard/produtos"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-2xl">➕</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">Novo Produto</p>
              <p className="text-xs text-gray-500">Adicionar ao catálogo</p>
            </div>
          </Link>

          <Link
            to="/dashboard/pedidos"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">Pedidos</p>
              <p className="text-xs text-gray-500">
                {stats.pedidosPendentes > 0 ? `${stats.pedidosPendentes} pendentes` : 'Todos'}
              </p>
            </div>
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/dashboard/clientes"
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">Clientes</p>
                <p className="text-xs text-gray-500">Gerir utilizadores</p>
              </div>
            </Link>
          )}

          <Link
            to="/dashboard/profile"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50/50 transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-2xl">👤</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">Meu Perfil</p>
              <p className="text-xs text-gray-500">Editar informações</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== FOOTER DO ERP ===== */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <p className="font-bold text-sm">AuroraCrud ERP</p>
              <p className="text-xs text-white/60">Sistema de Gestão Empresarial</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/60">
            <span>v1.0.0</span>
            <span>·</span>
            <span>🇦🇴 Angola</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Sistema Online
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;