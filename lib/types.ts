export interface Cliente {
  id: string;
  codigo: number; // Código único sequencial obrigatório
  nome: string;
  responsavel_contato?: string; // Responsável pelo contato (LA, DERLANE, ANINHA, etc)
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteComResumo extends Cliente {
  total_obras: number;
  obras_finalizadas: number;
  obras_em_andamento: number;
  valor_total_obras: number;
  total_pago: number;
  saldo_pendente: number;
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
  status: 'FINALIZADO' | 'EM ANDAMENTO';
  entrada: number; // Valor pago na entrada
  valor_financiado: number; // Valor financiado pela instituição
  subsidio: number; // Subsídio/incentivo fiscal
  valor_total: number; // Entrada + Financiado + Subsídio
  data_conclusao?: string; // Data de conclusão da obra
  valor_terreno: number; // Valor do terreno
  ano_obra?: number;
  local_obra?: string;
  fase?: string;
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
  cliente_email?: string;
}

export interface Contrato {
  id: string;
  cliente_id?: string;
  obra_id?: string;
  data_inicio: string;
  data_conclusao?: string;
  local_obra: string;
  valor_total: number;
  responsavel: string;
  tipo_pagamento: 'Caixa' | 'Particular';
  status: 'Em andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  clientes?: Cliente;
  obras?: Obra;
}

export interface Financeiro {
  id: string;
  obra_id?: string;
  tipo: 'entrada' | 'saida' | 'pagamento' | 'recebimento';
  descricao: string;
  valor: number;
  data_movimentacao: string;
  categoria?: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  obras?: Obra;
}

export interface Profile {
  id: string;
  nome_completo: string;
  cargo: 'admin' | 'funcionario';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_clientes: number;
  obras_ativas: number;
  obras_finalizadas: number;
  total_contratos: number;
  receita_total: number;
  faturamento_por_fase: {
    fase: string;
    valor: number;
  }[];
  obras_por_fase: {
    fase: string;
    quantidade: number;
  }[];
  faturamento_por_ano: {
    ano: number;
    valor: number;
  }[];
  obras_por_ano: {
    ano: number;
    quantidade: number;
  }[];
  locais_obra: {
    local: string;
    quantidade: number;
  }[];
  locais_obra_valor: {
    local: string;
    valor: number;
  }[];
}
