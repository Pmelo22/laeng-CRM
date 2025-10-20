export interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contrato {
  id: string;
  cliente_id: string;
  data_inicio: string;
  local_obra: string;
  valor_total: number;
  responsavel: string;
  tipo_pagamento: 'Caixa' | 'Particular';
  status: 'Em andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  clientes?: Cliente;
}

export interface Profile {
  id: string;
  nome_completo: string;
  cargo: 'admin' | 'funcionario';
  created_at: string;
  updated_at: string;
}
