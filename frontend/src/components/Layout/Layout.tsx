import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Banknote, MapPin } from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f5]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isGuest={!user}
        />

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer ERP */}
        <footer className="flex-shrink-0 border-t border-stone-200 bg-white px-6 py-3">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-stone-500 md:flex-row">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-stone-600">Sistema online</span>
              </span>
              <span className="hidden md:inline">·</span>
              <span className="hidden md:inline">Mercado Aurora · Área de gestão</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Angola</span>
              <span>·</span>
              <Banknote aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Preços em Kwanza (Kz)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;