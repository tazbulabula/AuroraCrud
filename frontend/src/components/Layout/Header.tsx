import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import productApi from '@/services/productApi';

interface HeaderProps {
  toggleSidebar: () => void;
  isGuest?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isGuest = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // ✅ Carregar notificações
  const loadNotifications = async () => {
    try {
      const { data } = await productApi.get('/notifications');
      setNotifications(data.slice(0, 5));
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (err) {
      // Silencioso - pode falhar se não estiver logado
    }
  };

  useEffect(() => {
    if (!isGuest && user) {
      loadNotifications();
      // Recarregar a cada 30s
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isGuest, user]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/dashboard/produtos?search=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  // ============================================================
  // ✅ HEADER PARA GUEST (Visitante)
  // ============================================================
  if (isGuest) {
    return (
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-xl">🛍️</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                Aurora<span className="text-indigo-600">Crud</span>
              </h1>
              <p className="text-xs text-gray-500 leading-tight">Marketplace</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/track"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-medium"
            >
              📦 Rastrear
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 border-2 border-gray-200 hover:border-indigo-300 rounded-xl transition-all"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 hover:scale-105 transition-all"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // ============================================================
  // ✅ HEADER PARA USUÁRIO AUTENTICADO
  // ============================================================
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
        
        {/* ===== LADO ESQUERDO ===== */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Botão Sidebar (mobile) */}
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="hidden lg:flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-lg">🚀</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-tight">
                Aurora<span className="text-indigo-600">Crud</span>
              </h1>
              <p className="text-[10px] text-gray-500 leading-tight uppercase tracking-wider font-semibold">
                ERP System
              </p>
            </div>
          </Link>

          {/* Busca Global (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos, pedidos..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded">
                Ctrl K
              </kbd>
            </div>
          </form>
        </div>

        {/* ===== LADO DIREITO ===== */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          
          {/* Botão Busca (mobile) */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Buscar"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notificações */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Notificações"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">🔔 Notificações</h3>
                    <p className="text-xs text-gray-500">{unreadCount} não lidas</p>
                  </div>
                  {unreadCount > 0 && (
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                      Marcar todas
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🔕</span>
                      </div>
                      <p className="text-sm text-gray-500">Sem notificações</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            !notif.read ? 'bg-indigo-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleString('pt-AO')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/dashboard/pedidos"
                  onClick={() => setNotificationsOpen(false)}
                  className="block px-4 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
                >
                  Ver todas as notificações →
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown do Usuário */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
                user?.role === 'ADMIN'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-200'
                  : 'bg-gradient-to-br from-indigo-500 to-blue-500 shadow-indigo-200'
              }`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                  {user?.name?.split(' ')[0] || 'Utilizador'}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight uppercase tracking-wider font-semibold">
                  {user?.role === 'ADMIN' ? 'Vendedor' : 'Cliente'}
                </p>
              </div>
              <svg
                className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {/* Info do Utilizador */}
                <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                      user?.role === 'ADMIN'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-indigo-500 to-blue-500'
                    }`}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        user?.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role === 'ADMIN' ? '🏪 VENDEDOR' : '🛒 CLIENTE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="py-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                  >
                    <span className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                      📊
                    </span>
                    <span className="font-medium">Dashboard</span>
                  </Link>

                  <Link
                    to="/dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                  >
                    <span className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                      👤
                    </span>
                    <span className="font-medium">Meu Perfil</span>
                  </Link>

                  <Link
                    to="/dashboard/produtos"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                  >
                    <span className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                      📦
                    </span>
                    <span className="font-medium">Meus Produtos</span>
                  </Link>

                  <Link
                    to="/dashboard/pedidos"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                  >
                    <span className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                      🛒
                    </span>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-medium">Pedidos</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>

                <hr className="border-gray-100" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                >
                  <span className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                    🚪
                  </span>
                  <span className="font-semibold">Terminar Sessão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== BUSCA MOBILE ===== */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSearch} className="mt-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos, pedidos..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;