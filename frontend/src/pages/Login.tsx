import { authService } from '@/services/authService';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Banknote, Bell, Eye, EyeOff, LockKeyhole, Mail, MapPin, Package } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      await authService.login(email, senha);
      navigate('/dashboard');
    } catch (error: any) {
      console.log(error);
      setErro(
        error.response?.data?.error ||
        error.message ||
        'Erro ao fazer login. Verifique as suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* LADO ESQUERDO - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0ek0yNCAzNGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <BrandMark className="h-12 w-12 rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-sm" iconClassName="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Mercado Aurora</h1>
              <p className="text-xs text-white/70">Marketplace</p>
            </div>
          </Link>

          {/* Conteúdo Central */}
          <div className="max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Gerencie os seus produtos, acompanhe os seus pedidos e receba
              notificações em tempo real.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Package aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Gestão de Produtos</p>
                  <p className="text-sm text-white/70">Crie e gerencie o seu catálogo</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Bell aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Notificações em Tempo Real</p>
                  <p className="text-sm text-white/70">Saiba quando alguém compra</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Banknote aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Preços em Kwanza</p>
                  <p className="flex items-center gap-1.5 text-sm text-white/70"><MapPin aria-hidden="true" className="h-3.5 w-3.5" /> Adaptado para Angola</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            <p>© {new Date().getFullYear()} Mercado Aurora. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="w-full max-w-md">
          
          {/* Logo Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <BrandMark className="h-12 w-12 rounded-xl bg-indigo-700 text-white shadow-lg shadow-indigo-200" iconClassName="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Mercado <span className="text-emerald-700">Aurora</span>
                </h1>
                <p className="text-xs text-gray-500">Marketplace</p>
              </div>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Entrar
            </h1>
            <p className="text-gray-500">
              Introduza as suas credenciais para continuar
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Erro */}
              {erro && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                  <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700 font-medium flex-1">{erro}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  <a
                    href="#"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <LockKeyhole aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Lembrar-me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Lembrar-me neste dispositivo
                </label>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    A entrar...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Entrar <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-white text-gray-400 font-semibold tracking-wider">
                  ou
                </span>
              </div>
            </div>

            {/* Link para Registro */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 font-semibold"
            >
              Criar uma conta nova
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Ao entrar, você concorda com os nossos{' '}
            <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;