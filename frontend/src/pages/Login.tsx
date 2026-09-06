import { authService } from '@/services/authService';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      await authService.login(email, senha);
      navigate('/');
    } catch (error) {
      console.log(error);
      setErro('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Aurora CRUD
        </h1>
        
        <form onSubmit={handleSubmit}>
          {erro && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {erro}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        {/* Links abaixo do formulário */}
        <div className="mt-6 space-y-3 text-center">
          {/* Link para Registrar */}
          <div className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
              Registre-se
            </Link>
          </div>
          
          {/* Link para Esqueceu a senha */}
          <div className="text-sm text-gray-600">
            <a href="#" className="text-gray-500 hover:text-gray-700 hover:underline transition-colors">
              Esqueceu a senha?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;