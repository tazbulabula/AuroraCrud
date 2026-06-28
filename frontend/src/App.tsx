
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Clientes from './pages/Clientes';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div>
      
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Home />
              </PrivateRoute>
            } />
          <Route path="/clientes" element={
            <PrivateRoute>
              <Clientes />
            </PrivateRoute>
          
            } />
          <Route path="/produtos" element={
            <PrivateRoute>
              <Produtos />
            </PrivateRoute>
            
            } />
            <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;