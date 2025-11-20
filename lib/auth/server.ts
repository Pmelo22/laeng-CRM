import { cookies } from 'next/headers';
import { verificarJWT, JWTPayload } from './jwt';

/**
 * Verifica o JWT do cookie e retorna o usuário autenticado
 * Função para ser usada em Server Components
 */
export async function obterUsuarioAutenticado(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const payload = verificarJWT(token);
    return payload;
  } catch (erro) {
    console.error('Erro ao verificar autenticação:', erro);
    return null;
  }
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export async function podeAcessar(recurso: string, acao: string): Promise<boolean> {
  const usuario = await obterUsuarioAutenticado();
  
  if (!usuario) {
    return false;
  }

  // Admin tem acesso a tudo
  if (usuario.cargo === 'admin') {
    return true;
  }

  // Funcionário pode ter permissões específicas
  return usuario.permissoes.includes(`${recurso}:${acao}`);
}
