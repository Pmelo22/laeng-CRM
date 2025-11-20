'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { UsuarioLogado, AuthContext as IAuthContext } from '@/lib/types';
import { temPermissao } from '@/lib/auth/permissions';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verifica sessão ao carregar
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        if (res.ok) {
          const data = await res.json();
          if (data.autenticado && data.usuario) {
            setUsuario({
              id: data.usuario.id,
              login: data.usuario.login,
              nome_completo: data.usuario.login, // Será atualizado com dados completos se necessário
              email: '', // Será atualizado com dados completos se necessário
              cargo: data.usuario.cargo,
              permissoes: data.usuario.permissoes,
            });
          }
        }
      } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
      } finally {
        setIsLoading(false);
      }
    };

    verificarSessao();
  }, []);

  const login = useCallback(async (login: string, senha: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Erro ao fazer login');
      }

      const data = await res.json();
      
      // Atualiza o usuário com os dados completos retornados
      const usuarioData = {
        id: data.usuario.id,
        login: data.usuario.login,
        nome_completo: data.usuario.nome_completo,
        email: data.usuario.email,
        cargo: data.usuario.cargo,
        permissoes: data.usuario.permissoes || [],
      };
      
      setUsuario(usuarioData);

      // Pequeno delay para garantir que o cookie foi recebido antes de redirecionar
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (erro) {
      setUsuario(null);
      setIsLoading(false);
      throw erro;
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUsuario(null);
      router.push('/auth/login');
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const value: IAuthContext = {
    usuario,
    isLoading,
    isAutenticado: !!usuario,
    login,
    logout,
    temPermissao: (recurso, acao) =>
      usuario ? temPermissao(usuario, recurso, acao) : false,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
