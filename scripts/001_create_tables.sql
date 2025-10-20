-- Tabela de perfis de usuários (estende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  cargo text check (cargo in ('admin', 'funcionario')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS na tabela profiles
alter table public.profiles enable row level security;

-- Políticas RLS para profiles
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Tabela de clientes
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf_cnpj text,
  telefone text,
  email text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  observacoes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS na tabela clientes
alter table public.clientes enable row level security;

-- Políticas RLS para clientes (todos os usuários autenticados podem ver e gerenciar)
create policy "Usuários autenticados podem ver clientes"
  on public.clientes for select
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem inserir clientes"
  on public.clientes for insert
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar clientes"
  on public.clientes for update
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem deletar clientes"
  on public.clientes for delete
  using (auth.role() = 'authenticated');

-- Tabela de contratos/obras
create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete cascade not null,
  data_inicio date not null,
  local_obra text not null,
  valor_total numeric(12, 2) not null,
  responsavel text not null,
  tipo_pagamento text check (tipo_pagamento in ('Caixa', 'Particular')) not null,
  status text check (status in ('Em andamento', 'Concluído', 'Cancelado')) default 'Em andamento',
  observacoes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS na tabela contratos
alter table public.contratos enable row level security;

-- Políticas RLS para contratos
create policy "Usuários autenticados podem ver contratos"
  on public.contratos for select
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem inserir contratos"
  on public.contratos for insert
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar contratos"
  on public.contratos for update
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem deletar contratos"
  on public.contratos for delete
  using (auth.role() = 'authenticated');

-- Índices para melhor performance
create index if not exists idx_clientes_nome on public.clientes(nome);
create index if not exists idx_contratos_cliente_id on public.contratos(cliente_id);
create index if not exists idx_contratos_status on public.contratos(status);
