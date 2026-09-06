
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Clientes from './pages/Clientes';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Layout from './components/Layout/Layout';
import Register from './pages/Register';
import RoleGuard from './components/RoleGuard';
import { ToastProvider } from './components/contexts/ToastContext';
import Profile from './pages/Profile';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota de Login (sem layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Protegidas (com Layout) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="clientes" element={<RoleGuard allowedRoles={['ADMIN']} redirectTo="/">
                <Clientes />
              </RoleGuard>} />
            <Route path="produtos" element={<Produtos />} />
            
            {/* Rotas futuras */}
            <Route path="pedidos" element={<div>Página de Pedidos</div>} />
            <Route path="fornecedores" element={<div>Página de Fornecedores</div>} />
            <Route path="usuarios" element={<div>Página de Usuários</div>} />
            <Route path="configuracoes" element={<div>Página de Configurações</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
    
  );
}

export default App;