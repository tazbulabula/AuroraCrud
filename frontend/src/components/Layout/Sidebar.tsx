import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  BadgeHelp,
  ChartNoAxesCombined,
  CircleUserRound,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  Package,
  Settings,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import BrandMark from '@/components/BrandMark';

interface MenuItem {
  path: string;
  icon: LucideIcon;
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

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { canViewClientes } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();

  const menuGroups: MenuGroup[] = [
    {
      title: 'Visão geral',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Resumo', show: true, exact: true },
      ],
    },
    {
      title: 'Operações',
      items: [
        { path: '/dashboard/pedidos', icon: ClipboardList, label: 'Encomendas', show: true },
        { path: '/dashboard/produtos', icon: Package, label: 'Produtos', show: true },
      ],
    },
    {
      title: 'Gestão',
      items: [
        { path: '/dashboard/clientes', icon: UsersRound, label: 'Utilizadores', show: canViewClientes() },
        { path: '/dashboard/fornecedores', icon: Handshake, label: 'Fornecedores', show: true, disabled: true },
      ],
    },
    {
      title: 'Conta',
      items: [
        { path: '/dashboard/profile', icon: CircleUserRound, label: 'O meu perfil', show: true },
        { path: '/dashboard/configuracoes', icon: Settings, label: 'Definições', show: true, disabled: true },
      ],
    },
  ];

  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-stone-200 bg-white shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[4.5rem] flex-shrink-0 items-center justify-between border-b border-stone-100 px-5">
          <Link to="/dashboard" onClick={closeMobileSidebar} className="group flex items-center gap-3">
            <BrandMark className="h-10 w-10 rounded-xl bg-indigo-700 text-white shadow-sm transition-transform group-hover:scale-105" />
            <span>
              <span className="block text-sm font-extrabold leading-tight text-stone-900">Mercado Aurora</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">Área de gestão</span>
            </span>
          </Link>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden" aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="mx-4 mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-700 text-sm font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-800">{user.name}</p>
                <p className="mt-0.5 text-xs text-stone-500">{user.role === 'ADMIN' ? 'Vendedor' : 'Cliente'}</p>
              </div>
            </div>
          </div>
        )}

        <nav aria-label="Navegação da gestão" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {menuGroups.map(group => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">{group.title}</p>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.disabled ? '#' : item.path}
                        onClick={event => {
                          if (item.disabled) {
                            event.preventDefault();
                            return;
                          }
                          closeMobileSidebar();
                        }}
                        aria-disabled={item.disabled}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${item.disabled ? 'cursor-not-allowed opacity-45' : ''} ${active ? 'bg-indigo-700 text-white shadow-sm shadow-indigo-900/15' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
                      >
                        <Icon aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-white' : 'text-stone-500 group-hover:text-indigo-700'}`} strokeWidth={1.8} />
                        <span className="flex-1">{item.label}</span>
                        {item.disabled && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-800">Breve</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mx-3 mb-3 rounded-2xl bg-[#f2f5ef] p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <BadgeHelp aria-hidden="true" className="h-4 w-4 text-indigo-700" />
            Precisa de ajuda?
          </div>
          <p className="mt-2 text-xs leading-5 text-stone-600">Consulte os seus pedidos e mantenha o catálogo atualizado.</p>
          <Link to="/dashboard/profile" onClick={closeMobileSidebar} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-indigo-800 hover:text-indigo-950">
            Aceder ao perfil <ChartNoAxesCombined aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-[10px] font-medium text-stone-400">
          <span>Mercado Aurora · v1.0</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
