export interface Cliente {
  id: string;
  codigo: number; // Código único sequencial obrigatório
  nome: string;
  status?: 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE'; // Status do cliente
  endereco?: string; // Endereço ou cidade
  data_cadastro?: string; // Data de cadastro do cliente
  responsavel_contato?: string; // Responsável pelo contato (LA, DERLANE, ANINHA, etc)
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  // Campos agregados das obras
  valor_terreno?: number;
  entrada?: number;
  valor_financiado?: number;
  subsidio?: number;
  valor_total?: number;
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
