-- Função para criar perfil automaticamente quando um usuário se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo, cargo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', 'Usuário'),
    coalesce(new.raw_user_meta_data ->> 'cargo', 'funcionario')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger para executar a função quando um novo usuário é criado
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
