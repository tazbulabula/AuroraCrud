import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden">
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
        <footer className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 px-6 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-gray-600">Sistema Online</span>
              </span>
              <span className="hidden md:inline">·</span>
              <span className="hidden md:inline">AuroraCrud ERP v1.0.0</span>
            </div>

            <div className="flex items-center gap-4">
              <span>🇦🇴 Angola</span>
              <span>·</span>
              <span>Preços em Kwanza (Kz)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;