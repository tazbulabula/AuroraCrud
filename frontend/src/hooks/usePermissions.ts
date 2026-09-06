import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'ADMIN' | 'CLIENT';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isClient = (): boolean => {
    return hasRole('CLIENT');
  };

  const canManageUsers = (): boolean => {
    // Apenas ADMIN pode gerenciar usuários
    return isAdmin();
  };

  const canViewClientes = (): boolean => {
    // Apenas ADMIN pode ver clientes
    return isAdmin();
  };

  const canCreateClientes = (): boolean => {
    return isAdmin();
  };

  const canEditClientes = (): boolean => {
    return isAdmin();
  };

  const canDeleteClientes = (): boolean => {
    return isAdmin();
  };

  return {
    hasRole,
    isAdmin,
    isClient,
    canManageUsers,
    canViewClientes,
    canCreateClientes,
    canEditClientes,
    canDeleteClientes,
  };
};