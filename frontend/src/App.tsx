import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Clientes from './pages/Clientes';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout'; // ✅ Importar
import Register from './pages/Register';
import RoleGuard from './components/RoleGuard';
import ToastContainer from './components/Toast/ToastContainer';
import Profile from './pages/Profile';
import { ToastProvider } from './components/contexts/ToastContext';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import PublicProducts from './pages/PublicProducts';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Rotas Públicas (com PublicLayout) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicProducts />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/track/:code" element={<TrackOrder />} />
          </Route>

          {/* ✅ Rotas de Autenticação (sem layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Rotas Protegidas (com Layout interno) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            
            <Route 
              path="clientes" 
              element={
                <RoleGuard allowedRoles={['ADMIN']} redirectTo="/dashboard">
                  <Clientes />
                </RoleGuard>
              } 
            />
            
            <Route path="produtos" element={<Produtos />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="fornecedores" element={<div>Página de Fornecedores</div>} />
            <Route path="usuarios" element={<div>Página de Usuários</div>} />
            <Route path="configuracoes" element={<div>Página de Configurações</div>} />
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;