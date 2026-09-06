import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { canViewClientes } = usePermissions();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard', show: true },
    { path: '/clientes', icon: '👥', label: 'Clientes', show: canViewClientes() },
    { path: '/produtos', icon: '📦', label: 'Produtos', show: true },
    { path: '/pedidos', icon: '🛒', label: 'Pedidos', show: true },
    { path: '/fornecedores', icon: '🏢', label: 'Fornecedores', show: true },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <>
      {/* Overlay para mobile - com fundo escuro e blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 md:w-72 bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full
        `}
      >
        {/* Logo com fundo branco */}
        <div className="flex-shrink-0 h-16 flex items-center justify-center border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-blue-600">🚀 Aurora CRUD</h1>
        </div>

        {/* Menu com scroll */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Fechar sidebar ao clicar no link (mobile)
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer da Sidebar */}
        <div className="flex-shrink-0 w-full p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500 text-center">
            <p>Versão 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;