import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-gray-300 mt-16">
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Sobre */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🛍️</span>
              </div>
              <h3 className="text-white font-bold text-lg">
                Aurora<span className="text-indigo-400">Crud</span>
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Seu marketplace de confiança em Angola. Compre e venda produtos
              de forma simples, segura e com entrega em casa.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span>🇦🇴</span>
              <span>Feito em Angola</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Links Rápidos
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Produtos
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Rastrear Pedido
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Criar Conta
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Entrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Ajuda
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span>→</span> Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Siga-nos
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="w-11 h-11 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <span className="text-lg">📘</span>
              </a>
              <a
                href="#"
                className="w-11 h-11 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-pink-600 hover:border-pink-500 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <span className="text-lg">📷</span>
              </a>
              <a
                href="#"
                className="w-11 h-11 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-sky-500 hover:border-sky-400 transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <span className="text-lg">🐦</span>
              </a>
              <a
                href="#"
                className="w-11 h-11 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-green-600 hover:border-green-500 transition-all duration-300 hover:scale-110"
                aria-label="WhatsApp"
              >
                <span className="text-lg">💬</span>
              </a>
            </div>
            
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">Formas de pagamento</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">💵 Dinheiro</span>
                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">📱 Multicaixa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} AuroraCrud. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-2">
            <span>🇦🇴</span>
            <span>Preços em Kwanza (Kz)</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;