import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    setIsAuthenticated(authService.isAuthenticated());
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogin = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-indigo-100/50' 
          : 'bg-white/80 backdrop-blur-md'
        }
        border-b border-gray-100
      `}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300 group-hover:scale-105">
                <span className="text-xl md:text-2xl">🛍️</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                Aurora<span className="text-indigo-600">Crud</span>
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Marketplace
              </p>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive('/') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }
              `}
            >
              🏠 Produtos
            </Link>
            <Link
              to="/track"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive('/track') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }
              `}
            >
              📦 Rastrear
            </Link>
            <a
              href="#sobre"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200"
            >
              Sobre
            </a>
            <a
              href="#contato"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200"
            >
              Contato
            </a>
          </nav>

          {/* Ações do Lado Direito */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogin}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105"
                >
                  👤 Minha Conta
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 text-sm font-semibold"
                >
                  Criar Conta
                </Link>
                <button
                  onClick={handleLogin}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105"
                >
                  Entrar
                </button>
              </>
            )}
          </div>

          {/* Menu Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300
            ${mobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}
          `}
        >
          <nav className="flex flex-col gap-1 pt-2 border-t border-gray-100">
            <Link
              to="/"
              className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors font-medium"
            >
              🏠 Produtos
            </Link>
            <Link
              to="/track"
              className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors font-medium"
            >
              📦 Rastrear Pedido
            </Link>
            <a
              href="#sobre"
              className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors font-medium"
            >
              ℹ️ Sobre
            </a>
            <a
              href="#contato"
              className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors font-medium"
            >
              📞 Contato
            </a>

            <hr className="my-2 border-gray-100" />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-semibold shadow-lg"
              >
                Ir para Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-semibold shadow-lg"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-center font-semibold hover:border-indigo-300 transition-colors"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;