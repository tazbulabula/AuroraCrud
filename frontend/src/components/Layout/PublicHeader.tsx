import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CircleUserRound, Menu, PackageCheck, X } from 'lucide-react';
import { authService } from '@/services/authService';
import BrandMark from '@/components/BrandMark';

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  const closeMenu = () => setMobileMenuOpen(false);
  const accountPath = isAuthenticated ? '/dashboard' : '/login';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-white/95 shadow-sm shadow-stone-900/5 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 lg:h-20 lg:px-8">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-3">
          <BrandMark className="h-10 w-10 rounded-2xl bg-indigo-700 text-white shadow-lg shadow-indigo-900/15 transition-transform group-hover:-rotate-3 group-hover:scale-105" />
          <span>
            <span className="block text-base font-extrabold leading-tight tracking-tight text-stone-900 sm:text-lg">
              Mercado <span className="text-indigo-700">Aurora</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Descubra Angola
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          <Link to="/" className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}>
            Produtos
          </Link>
          <Link to="/track" className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${location.pathname.startsWith('/track') ? 'bg-indigo-50 text-indigo-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}>
            <PackageCheck aria-hidden="true" className="h-4 w-4" />
            Rastrear encomenda
          </Link>
          <a href="/#sobre" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
            Como funciona
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isAuthenticated && (
            <Link to="/register" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
              Criar conta
            </Link>
          )}
          <button
            type="button"
            onClick={() => navigate(accountPath)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-900/15 transition hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            <CircleUserRound aria-hidden="true" className="h-4 w-4" />
            {isAuthenticated ? 'A minha conta' : 'Entrar'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(open => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100 md:hidden"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Navegação móvel" className="border-t border-stone-100 bg-white px-4 py-3 shadow-xl md:hidden">
          <Link to="/" onClick={closeMenu} className="block rounded-xl px-4 py-3 font-semibold text-stone-700 hover:bg-stone-50">
            Produtos
          </Link>
          <Link to="/track" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-stone-700 hover:bg-stone-50">
            <PackageCheck className="h-4 w-4 text-indigo-700" />
            Rastrear encomenda
          </Link>
          <a href="/#sobre" onClick={closeMenu} className="block rounded-xl px-4 py-3 font-semibold text-stone-700 hover:bg-stone-50">
            Como funciona
          </a>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
            {!isAuthenticated && (
              <Link to="/register" onClick={closeMenu} className="rounded-xl border border-stone-200 px-4 py-3 text-center text-sm font-bold text-stone-700">
                Criar conta
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                closeMenu();
                navigate(accountPath);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white"
            >
              {isAuthenticated ? 'A minha conta' : 'Entrar'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default PublicHeader;
