import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // ✅ Redireciona para a página pública
  }

  return <>{children}</>;
};

export default PrivateRoute;