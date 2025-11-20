import { createAdminClient } from '@/lib/supabase/server';
import { compararSenha } from '@/lib/auth/bcrypt';
import { gerarJWT } from '@/lib/auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { login, senha } = await request.json();

    // Validação básica
    if (!login || !senha) {
      return NextResponse.json(
        { erro: 'Login e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // 1. Busca o usuário pelo login
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('login', login)
      .eq('ativo', true)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
    }

    if (error || !usuario) {
      console.log('Usuário não encontrado:', { login, error });
      // Log de falha de login
      try {
        await supabase.from('auditoria_login').insert({
          login_em: new Date().toISOString(),
          sucesso: false,
          motivo_falha: 'Usuário não encontrado ou inativo',
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        });
      } catch (e) {
        console.error('Erro ao logar falha:', e);
      }

      return NextResponse.json(
        { erro: 'Usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // 2. Valida a senha
    console.log('Comparando senha...');
    const senhaValida = await compararSenha(senha, usuario.senha_hash);
    console.log('Senha válida?', senhaValida);
    
    if (!senhaValida) {
      console.log('Senha incorreta para usuário:', login);
      // Log de falha
      try {
        await supabase.from('auditoria_login').insert({
          usuario_id: usuario.id,
          login_em: new Date().toISOString(),
          sucesso: false,
          motivo_falha: 'Senha incorreta',
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        });
      } catch (e) {
        console.error('Erro ao logar falha:', e);
      }

      return NextResponse.json(
        { erro: 'Usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // 3. Busca as permissões do usuário pelo seu cargo
    const { data: permissoes } = await supabase
      .from('role_permissoes')
      .select('permissao_id')
      .eq('role', usuario.cargo);

    // 4. Gera o JWT token
    const jwtToken = gerarJWT({
      usuarioId: usuario.id,
      login: usuario.login,
      cargo: usuario.cargo,
      permissoes: permissoes?.map((p: { permissao_id: string }) => p.permissao_id) || [],
    });

    // 5. Atualiza último acesso
    await supabase
      .from('usuarios')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', usuario.id);

    // 6. Log de sucesso
    await supabase.from('auditoria_login').insert({
      usuario_id: usuario.id,
      login_em: new Date().toISOString(),
      sucesso: true,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent'),
    });

    // 7. Retorna resposta com cookie httpOnly
    const response = NextResponse.json(
      {
        sucesso: true,
        usuario: {
          id: usuario.id,
          login: usuario.login,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cargo: usuario.cargo,
          permissoes: permissoes?.map((p: { permissao_id: string }) => p.permissao_id) || [],
        },
      },
      { status: 200 }
    );

    // Cookie seguro httpOnly
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/',
    });

    return response;
  } catch (erro) {
    console.error('Erro no login:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
