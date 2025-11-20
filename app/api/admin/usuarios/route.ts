import { createClient } from '@/lib/supabase/server';
import { obterUsuarioAutenticado } from '@/lib/auth/server';
import { hashSenha } from '@/lib/auth/bcrypt';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const usuario = await obterUsuarioAutenticado();

    // Apenas admin pode listar usuários
    if (!usuario || usuario.cargo !== 'admin') {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, login, email, nome_completo, cargo, ativo, criado_em, ultimo_acesso')
      .order('criado_em', { ascending: false });

    if (error) {
      return NextResponse.json(
        { erro: 'Erro ao buscar usuários' },
        { status: 500 }
      );
    }

    return NextResponse.json({ usuarios });
  } catch (erro) {
    console.error('Erro no GET /api/admin/usuarios:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const usuario = await obterUsuarioAutenticado();

    // Apenas admin pode criar usuários
    if (!usuario || usuario.cargo !== 'admin') {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { login, senha, email, nome_completo, cargo, permissoes } = await request.json();

    // Validações
    if (!login || !senha || !cargo) {
      return NextResponse.json(
        { erro: 'Login, senha e cargo são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['admin', 'funcionario'].includes(cargo)) {
      return NextResponse.json(
        { erro: 'Cargo inválido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verifica se login já existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('login', login)
      .single();

    if (usuarioExistente) {
      return NextResponse.json(
        { erro: 'Login já existe' },
        { status: 409 }
      );
    }

    // Hash da senha
    const senhaHash = await hashSenha(senha);

    // Cria novo usuário
    const { data: novoUsuario, error: erroInsert } = await supabase
      .from('usuarios')
      .insert({
        login,
        senha_hash: senhaHash,
        email: email || null,
        nome_completo: nome_completo || login,
        cargo,
        ativo: true,
        criado_por: usuario.usuarioId,
      })
      .select()
      .single();

    if (erroInsert) {
      console.error('Erro ao inserir usuário:', erroInsert);
      return NextResponse.json(
        { erro: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Se houver permissões específicas para funcionário, insere-as
    if (cargo === 'funcionario' && permissoes && Array.isArray(permissoes) && permissoes.length > 0) {
      const permissoesSuecial = permissoes.map(permissao_id => ({
        usuario_id: novoUsuario.id,
        permissao_id,
      }));

      await supabase
        .from('usuario_permissoes_especiais')
        .insert(permissoesSuecial);
    }

    return NextResponse.json(
      {
        sucesso: true,
        usuario: {
          id: novoUsuario.id,
          login: novoUsuario.login,
          email: novoUsuario.email,
          nome_completo: novoUsuario.nome_completo,
          cargo: novoUsuario.cargo,
        },
      },
      { status: 201 }
    );
  } catch (erro) {
    console.error('Erro no POST /api/admin/usuarios:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const usuario = await obterUsuarioAutenticado();

    // Apenas admin pode atualizar usuários
    if (!usuario || usuario.cargo !== 'admin') {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { usuarioId, email, nome_completo, cargo, ativo, senha, permissoes } = await request.json();

    if (!usuarioId) {
      return NextResponse.json(
        { erro: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (nome_completo !== undefined) updateData.nome_completo = nome_completo;
    if (cargo !== undefined && ['admin', 'funcionario'].includes(cargo)) {
      updateData.cargo = cargo;
    }
    if (ativo !== undefined) updateData.ativo = ativo;
    if (senha) {
      updateData.senha_hash = await hashSenha(senha);
    }

    const { error: erroUpdate } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', usuarioId);

    if (erroUpdate) {
      return NextResponse.json(
        { erro: 'Erro ao atualizar usuário' },
        { status: 500 }
      );
    }

    // Atualiza permissões se fornecidas
    if (permissoes && Array.isArray(permissoes)) {
      // Remove permissões anteriores
      await supabase
        .from('usuario_permissoes_especiais')
        .delete()
        .eq('usuario_id', usuarioId);

      // Insere novas permissões
      if (permissoes.length > 0) {
        const permissoesSuecial = permissoes.map(permissao_id => ({
          usuario_id: usuarioId,
          permissao_id,
        }));

        await supabase
          .from('usuario_permissoes_especiais')
          .insert(permissoesSuecial);
      }
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error('Erro no PUT /api/admin/usuarios:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const usuario = await obterUsuarioAutenticado();

    // Apenas admin pode deletar usuários
    if (!usuario || usuario.cargo !== 'admin') {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { usuarioId } = await request.json();

    if (!usuarioId) {
      return NextResponse.json(
        { erro: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Não permite deletar a si mesmo
    if (usuarioId === usuario.usuarioId) {
      return NextResponse.json(
        { erro: 'Você não pode deletar sua própria conta' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Remove permissões especiais
    await supabase
      .from('usuario_permissoes_especiais')
      .delete()
      .eq('usuario_id', usuarioId);

    // Remove usuário
    const { error: erroDelete } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', usuarioId);

    if (erroDelete) {
      return NextResponse.json(
        { erro: 'Erro ao deletar usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error('Erro no DELETE /api/admin/usuarios:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
