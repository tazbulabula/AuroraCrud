import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clienteService } from '@/services/clienteService';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'ADMIN' | 'CLIENT';
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'CLIENT',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Força da senha
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: '', color: '' };
    if (password.length < 8) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Média', color: 'bg-yellow-500' };
    if (score === 3) return { level: 3, label: 'Boa', color: 'bg-blue-500' };
    return { level: 4, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // Validações
    if (formData.password !== formData.password_confirmation) {
      setErro('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setErro('Você precisa aceitar os Termos de Uso');
      setLoading(false);
      return;
    }

    try {
      await clienteService.registrar({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // ✅ Redirecionar para login com mensagem de sucesso
      navigate('/login', {
        state: { message: 'Conta criada com sucesso! Faça login para continuar.' }
      });
    } catch (error: any) {
      console.error(error);
      setErro(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* LADO ESQUERDO - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0ek0yNCAzNGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6bTAtOGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">AuroraCrud</h1>
              <p className="text-xs text-white/70">Marketplace</p>
            </div>
          </Link>

          {/* Conteúdo Central */}
          <div className="max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Comece a vender hoje! 🚀
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Crie a sua conta gratuitamente e comece a vender os seus produtos
              para todo o país.
            </p>

            {/* Benefícios */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <p className="font-semibold">100% Gratuito</p>
                  <p className="text-sm text-white/70">Sem taxas escondidas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📦</span>
                </div>
                <div>
                  <p className="font-semibold">Venda os seus produtos</p>
                  <p className="text-sm text-white/70">Catálogo ilimitado</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="font-semibold">Receba em Kwanza</p>
                  <p className="text-sm text-white/70">Pagamento na entrega</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <p className="font-semibold">Notificações instantâneas</p>
                  <p className="text-sm text-white/70">Saiba quando vender</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            <p>© {new Date().getFullYear()} AuroraCrud. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="w-full max-w-md">
          
          {/* Logo Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Aurora<span className="text-indigo-600">Crud</span>
                </h1>
                <p className="text-xs text-gray-500">Marketplace</p>
              </div>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-500">
              Preencha os dados abaixo para começar
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Erro */}
              {erro && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm text-red-700 font-medium flex-1">{erro}</p>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    👤
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white"
                    placeholder="Ex: João Silva"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    📧
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Tipo de Usuário */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.role === 'CLIENT'
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🛒</span>
                    <p className="font-semibold text-sm text-gray-800">Cliente</p>
                    <p className="text-xs text-gray-500">Comprar produtos</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.role === 'ADMIN'
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🏪</span>
                    <p className="font-semibold text-sm text-gray-800">Vendedor</p>
                    <p className="text-xs text-gray-500">Vender produtos</p>
                  </button>
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {/* Indicador de força */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength.level >= level
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.level === 1 ? 'text-red-600' :
                      passwordStrength.level === 2 ? 'text-yellow-600' :
                      passwordStrength.level === 3 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      Força: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    🔐
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 bg-white ${
                      formData.password_confirmation
                        ? formData.password === formData.password_confirmation
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                          : 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                    placeholder="Repita a senha"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {formData.password_confirmation && (
                  <p className={`text-xs mt-1 font-medium ${
                    formData.password === formData.password_confirmation
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formData.password === formData.password_confirmation
                      ? '✅ As senhas coincidem'
                      : '❌ As senhas não coincidem'}
                  </p>
                )}
              </div>

              {/* Termos */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  Eu aceito os{' '}
                  <a href="#" className="text-indigo-600 hover:underline font-medium">Termos de Uso</a>
                  {' '}e a{' '}
                  <a href="#" className="text-indigo-600 hover:underline font-medium">Política de Privacidade</a>
                </label>
              </div>

              {/* Botão Cadastrar */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    A criar conta...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ✨ Criar Conta
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

            {/* Link para Login */}
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 font-semibold"
            >
              🔑 Já tenho conta
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;