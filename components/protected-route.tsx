'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'funcionario';
}

/**
 * Componente que protege rotas, redirecionando para login se não autenticado
 * @param children Conteúdo a ser renderizado
 * @param requiredRole Role requerido (opcional)
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { usuario, isLoading, isAutenticado } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAutenticado) {
      router.push('/auth/login');
    } else if (
      !isLoading &&
      requiredRole &&
      usuario?.cargo !== requiredRole
    ) {
      router.push('/dashboard');
    }
  }, [isLoading, isAutenticado, usuario, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5C800]"></div>
      </div>
    );
  }

  if (!isAutenticado) {
    return null;
  }

  if (requiredRole && usuario?.cargo !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
