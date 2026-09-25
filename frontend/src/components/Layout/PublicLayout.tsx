import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <PublicHeader />
      
      {/* Espaço para o header fixo */}
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;