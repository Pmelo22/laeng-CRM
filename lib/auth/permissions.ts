import { UsuarioLogado } from '@/lib/types';

interface PermissaoRegistro {
  recurso: string;
  acao: string;
  restricted?: boolean;
}

const PERMISSOES_POR_ROLE: Record<string, PermissaoRegistro[]> = {
  admin: [
    // Clientes
    { recurso: 'clientes', acao: 'visualizar' },
    { recurso: 'clientes', acao: 'criar' },
    { recurso: 'clientes', acao: 'editar' },
    { recurso: 'clientes', acao: 'deletar' },
    // Obras
    { recurso: 'obras', acao: 'visualizar' },
    { recurso: 'obras', acao: 'criar' },
    { recurso: 'obras', acao: 'editar' },
    { recurso: 'obras', acao: 'deletar' },
    // Financeira
    { recurso: 'financeira', acao: 'visualizar' },
    { recurso: 'financeira', acao: 'editar' },
    // Usuários
    { recurso: 'usuarios', acao: 'gerenciar' },
    // Auditoria
    { recurso: 'auditoria', acao: 'visualizar' },
    // Relatórios
    { recurso: 'relatorios', acao: 'visualizar' },
  ],
  funcionario: [
    // Clientes - apenas visualizar (restrito por permissões especiais)
    { recurso: 'clientes', acao: 'visualizar', restricted: true },
    // Obras - visualizar, criar e editar (restrito)
    { recurso: 'obras', acao: 'visualizar', restricted: true },
    { recurso: 'obras', acao: 'criar', restricted: true },
    { recurso: 'obras', acao: 'editar', restricted: true },
    // Financeira - apenas visualizar
    { recurso: 'financeira', acao: 'visualizar', restricted: true },
    // Relatórios - apenas visualizar
    { recurso: 'relatorios', acao: 'visualizar', restricted: true },
  ],
};

/**
 * Verifica se um usuário tem permissão para uma ação em um recurso
 * @param usuario Usuário logado
 * @param recurso Nome do recurso (ex: 'clientes', 'obras')
 * @param acao Ação a ser realizada (ex: 'visualizar', 'criar')
 * @returns true se o usuário tem permissão
 */
export function temPermissao(
  usuario: UsuarioLogado,
  recurso: string,
  acao: string
): boolean {
  // Admin tem acesso a tudo
  if (usuario.cargo === 'admin') return true;

  // Busca as permissões do role do usuário
  const permissoesRole = PERMISSOES_POR_ROLE[usuario.cargo] || [];
  
  return permissoesRole.some(p => p.recurso === recurso && p.acao === acao);
}

/**
 * Verifica se a permissão para um recurso é restrita por usuário
 * @param usuario Usuário logado
 * @param recurso Nome do recurso
 * @returns true se a permissão é restrita (ex: funcionário só vê certos clientes)
 */
export function permissaoRestrita(usuario: UsuarioLogado, recurso: string): boolean {
  if (usuario.cargo === 'admin') return false;

  const permissoesRole = PERMISSOES_POR_ROLE[usuario.cargo] || [];
  const permissao = permissoesRole.find(p => p.recurso === recurso);
  
  return permissao?.restricted || false;
}

/**
 * Verifica se um usuário pode visualizar um recurso específico
 * Considera permissões especiais
 * @param usuario Usuário logado
 * @param recursoTipo Tipo do recurso (ex: 'cliente', 'obra')
 * @param recursoId ID do recurso específico
 * @returns true se pode visualizar
 */
export function podeVisualizarRecurso(
  usuario: UsuarioLogado,
  recursoTipo: string,
  recursoId: string
): boolean {
  // Admin sempre pode visualizar
  if (usuario.cargo === 'admin') return true;

  // Se não tem permissão base, não pode visualizar
  if (!temPermissao(usuario, recursoTipo, 'visualizar')) return false;

  // Se não há restrições especiais, deixa passar
  if (!usuario.permissoes_especiais || usuario.permissoes_especiais.length === 0) {
    return true;
  }

  // Verifica se há permissão especial para este recurso
  const temPermissaoEspecial = usuario.permissoes_especiais.some(
    p => p.recurso_tipo === recursoTipo && p.recurso_id === recursoId
  );

  return temPermissaoEspecial;
}

/**
 * Retorna uma lista de IDs de recursos que um usuário pode acessar
 * @param usuario Usuário logado
 * @param recursoTipo Tipo do recurso
 * @returns Array de IDs permitidos, ou null se acesso irrestrito (admin)
 */
export function obterRecursosPermitidos(
  usuario: UsuarioLogado,
  recursoTipo: string
): string[] | null {
  // Admin tem acesso a todos
  if (usuario.cargo === 'admin') return null;

  // Se não há permissões especiais, retorna array vazio (nenhum acesso)
  if (!usuario.permissoes_especiais || usuario.permissoes_especiais.length === 0) {
    // Se é um funcionário com permissão geral, retorna null (sem filtro)
    if (temPermissao(usuario, recursoTipo, 'visualizar')) {
      return null;
    }
    return [];
  }

  // Retorna os IDs permitidos para este recurso
  return usuario.permissoes_especiais
    .filter(p => p.recurso_tipo === recursoTipo)
    .map(p => p.recurso_id);
}
