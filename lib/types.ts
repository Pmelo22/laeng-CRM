// ============ AUTENTICAÇÃO & AUTORIZAÇÃO ============

export interface Usuario {
  id: string;
  login: string;
  email: string;
  nome_completo: string;
  cargo: 'admin' | 'funcionario';
  ativo: boolean;
  ultimo_acesso?: string;
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
}

export interface UsuarioComSenha extends Usuario {
  senha_hash: string;
}

export interface Permissao {
  id: string;
  nome: string;
  descricao?: string;
  recurso: 'clientes' | 'obras' | 'financeira' | 'usuarios' | 'relatorios' | 'auditoria';
  acao: 'visualizar' | 'criar' | 'editar' | 'deletar' | 'gerenciar';
  criado_em: string;
}

export interface UsuarioPermissaoEspecial {
  id: string;
  usuario_id: string;
  tipo: 'cliente_restrito' | 'obra_restrita' | 'projeto_restrito';
  recurso_id: string;
  recurso_tipo?: string;
  criado_em: string;
  criado_por?: string;
}

export interface AuditoriaLogin {
  id: string;
  usuario_id?: string;
  login_em: string;
  logout_em?: string;
  ip_address?: string;
  user_agent?: string;
  sucesso: boolean;
  motivo_falha?: string;
}

export interface UsuarioLogado {
  id: string;
  login: string;
  nome_completo: string;
  email: string;
  cargo: 'admin' | 'funcionario';
  permissoes: string[];
  permissoes_especiais?: UsuarioPermissaoEspecial[];
}

export interface AuthContext {
  usuario: UsuarioLogado | null;
  isLoading: boolean;
  isAutenticado: boolean;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  temPermissao: (recurso: string, acao: string) => boolean;
}

// ============ CLIENTES & OBRAS ============

export interface Cliente {
  id: string;
  codigo: number; // Código único sequencial obrigatório
  nome: string;
  status?: 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE'; // Status do cliente
  endereco?: string; // Endereço ou cidade
  data_contrato?: string; // Data do contrato do cliente
  cpf_cnpj?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  // Campos agregados das obras (calculados automaticamente pela VIEW)
  valor_total?: number; // Soma de valor_total de todas as obras
  entrada_total?: number; // Soma de entrada de todas as obras
  valor_financiado_total?: number; // Soma de valor_financiado de todas as obras
  subsidio_total?: number; // Soma de subsidio de todas as obras
  total_obras?: number; // Contagem de obras
  obras_finalizadas?: number;
  obras_em_andamento?: number;
  obras_pendentes?: number;
}

export interface Obra {
  id: string;
  codigo: number; // Código da obra
  cliente_id: string; // Foreign key para clientes
  responsavel: string; // Responsável pela obra
  entidade?: string; // CUS., S.J., A.F.G, PARTICULAR, PREFEITURA
  tipo_contrato?: 'PARTICULAR' | 'PREFEITURA' | 'CAIXA' | 'FINANCIAMENTO' | 'OUTRO';
  endereco: string; // Endereço da obra
  endereco_obra?: string;
  cidade_obra?: string;
  estado_obra?: string;
  status: 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE';
  entrada: number; // Valor pago na entrada
  valor_financiado: number; // Valor financiado pela instituição
  subsidio: number; // Subsídio/incentivo fiscal
  valor_total: number; // Entrada + Financiado + Subsídio
  data_conclusao?: string; // Data de conclusão da obra
  valor_terreno: number; // Valor do terreno
  // Campos de custos detalhados
  empreiteiro?: number;
  empreiteiro_nome?: string;
  empreiteiro_valor_pago?: number;
  empreiteiro_saldo?: number;
  empreiteiro_percentual?: number;
  terceirizado?: number;
  material?: number;
  mao_de_obra?: number;
  pintor?: number;
  eletricista?: number;
  gesseiro?: number;
  azulejista?: number;
  manutencao?: number;
  valor_obra?: number; // Valor total da obra (custo)
  ano_obra?: number;
  local_obra?: string;
  fase?: string;
  // Campos de medições
  medicao_01?: number;
  medicao_02?: number;
  medicao_03?: number;
  medicao_04?: number;
  medicao_05?: number;
  medicao_01_data_computacao?: string;
  medicao_02_data_computacao?: string;
  medicao_03_data_computacao?: string;
  medicao_04_data_computacao?: string;
  medicao_05_data_computacao?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ObraComCliente extends Obra {
  cliente_nome: string;
  cliente_endereco: string;
  cliente_cidade: string;
  cliente_telefone?: string;
}

// ============ TIPOS FINANCEIROS ============

export interface Medicao {
  id: string;
  obra_id: string;
  numero_medicao: number; // 1 a 5
  valor: number;
  data_pagamento: string;
  forma_pagamento?: 'DINHEIRO' | 'PIX' | 'TRANSFERENCIA' | 'CHEQUE' | 'BOLETO';
  observacoes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FluxoCaixa {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: string;
  valor: number;
  data_movimentacao: string;
  obra_id?: string;
  cliente_id?: string;
  descricao: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ObraFinanceiro {
  id: string;
  codigo: number;
  cliente_nome: string;
  status: string;
  valor_terreno: number;
  entrada: number;
  valor_financiado: number;
  subsidio: number;
  valor_total: number;
  valor_obra: number;
  custo_total: number;
  resultado: number;
  margem_lucro: number;
  total_medicoes_pagas: number;
  saldo_pendente: number;
  percentual_pago: number;
  empreiteiro?: number;
  empreiteiro_nome?: string;
  empreiteiro_valor_pago?: number;
  empreiteiro_saldo?: number;
  empreiteiro_percentual?: number;
  terceirizado?: number;
  material?: number;
  mao_de_obra?: number;
  pintor?: number;
  eletricista?: number;
  gesseiro?: number;
  azulejista?: number;
  manutencao?: number;
  medicao_01?: number;
  medicao_02?: number;
  medicao_03?: number;
  medicao_04?: number;
  medicao_05?: number;
  medicao_01_data_computacao?: string;
  medicao_02_data_computacao?: string;
  medicao_03_data_computacao?: string;
  medicao_04_data_computacao?: string;
  medicao_05_data_computacao?: string;
}

export interface DashboardFinanceiro {
  total_obras: number;
  obras_finalizadas: number;
  obras_em_andamento: number;
  obras_pendentes: number;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  margem_media: number;
  obras_com_lucro: number;
  obras_com_prejuizo: number;
  obras_empate: number;
}

export interface Aviso {
  id: string;
  titulo: string;
  descricao?: string;
  urgencia: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  status: 'PENDENTE' | 'CONCLUÍDO';
  criado_por: string;
  criado_por_nome?: string;
  atribuido_para?: string;
  atribuido_para_nome?: string;
  data_vencimento?: string;
  data_conclusao?: string;
  created_at: string;
  updated_at: string;
}

export interface FluxoResumo {
  mes: string;
  total_entradas: number;
  total_saidas: number;
  saldo_periodo: number;
}
