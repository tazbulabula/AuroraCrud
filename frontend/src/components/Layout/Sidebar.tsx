import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

// ✅ Interfaces
interface MenuItem {
  path: string;
  icon: string;
  label: string;
  show: boolean;
  exact?: boolean;
  disabled?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { canViewClientes } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();

  const menuGroups: MenuGroup[] = [
    {
      title: 'Principal',
      items: [
        { 
          path: '/dashboard', 
          icon: '📊', 
          label: 'Dashboard', 
          show: true,
          exact: true 
        },
      ],
    },
    {
      title: 'Vendas',
      items: [
        { 
          path: '/dashboard/pedidos', 
          icon: '🛒', 
          label: 'Pedidos', 
          show: true 
        },
        { 
          path: '/dashboard/produtos', 
          icon: '📦', 
          label: 'Produtos', 
          show: true 
        },
      ],
    },
    {
      title: 'Gestão',
      items: [
        { 
          path: '/dashboard/clientes', 
          icon: '👥', 
          label: 'Clientes', 
          show: canViewClientes() 
        },
        { 
          path: '/dashboard/fornecedores', 
          icon: '🏢', 
          label: 'Fornecedores', 
          show: true,
          disabled: true 
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { 
          path: '/dashboard/profile', 
          icon: '👤', 
          label: 'Meu Perfil', 
          show: true 
        },
        { 
          path: '/dashboard/configuracoes', 
          icon: '⚙️', 
          label: 'Configurações', 
          show: true,
          disabled: true 
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-white via-white to-indigo-50/30
          shadow-2xl lg:shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full
          border-r border-gray-100
        `}
      >
        {/* Logo */}
        <div className="flex-shrink-0 h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 group"
            onClick={handleLinkClick}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-xl">🚀</span>
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

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info do Utilizador */}
        {user && (
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                user.role === 'ADMIN'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'bg-gradient-to-br from-indigo-500 to-blue-500'
              }`}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {user.name}
                </p>
                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'ADMIN' ? '🏪 VENDEDOR' : '🛒 CLIENTE'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((group, groupIndex) => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIndex}>
                <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = item.exact 
                      ? location.pathname === item.path
                      : location.pathname.startsWith(item.path);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.disabled ? '#' : item.path}
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                            return;
                          }
                          handleLinkClick();
                        }}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-200 relative
                          ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          ${isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className={`text-xl flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`}>
                          {item.icon}
                        </span>
                        <span className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : ''}`}>
                          {item.label}
                        </span>

                        {item.disabled && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            BREVE
                          </span>
                        )}

                        {isActive && (
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Card de Suporte */}
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 border border-white/30">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="font-bold text-sm mb-1">Precisa de ajuda?</h3>
              <p className="text-xs text-white/80 mb-3 leading-relaxed">
                Consulte a documentação ou contacte o suporte.
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-semibold transition-colors border border-white/30">
                Ver Documentação →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span className="font-semibold">v1.0.0</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-semibold">Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;