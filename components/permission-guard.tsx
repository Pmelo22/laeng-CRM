'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-context';

interface PermissionGuardProps {
  recurso: string;
  acao: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tiver permissão
 * @param recurso Nome do recurso (ex: 'clientes', 'obras')
 * @param acao Ação requerida (ex: 'criar', 'editar')
 * @param fallback O que mostrar se não tiver permissão
 * @param children Conteúdo a ser renderizado
 */
export function PermissionGuard({
  recurso,
  acao,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { temPermissao } = useAuth();

  if (!temPermissao(recurso, acao)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
