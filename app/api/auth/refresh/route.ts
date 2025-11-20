import { verificarJWT, gerarJWT } from '@/lib/auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extrai o token do cookie
    const tokenAntigo = request.cookies.get('auth_token')?.value;

    if (!tokenAntigo) {
      return NextResponse.json(
        { erro: 'Token não encontrado' },
        { status: 401 }
      );
    }

    // Verifica se o token atual é válido
    const payload = verificarJWT(tokenAntigo);

    if (!payload) {
      return NextResponse.json(
        { erro: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Gera um novo token com os mesmos dados
    const novoToken = gerarJWT({
      usuarioId: payload.usuarioId,
      login: payload.login,
      cargo: payload.cargo,
      permissoes: payload.permissoes,
    });

    // Retorna resposta com o novo token
    const response = NextResponse.json(
      { sucesso: true, mensagem: 'Token renovado com sucesso' },
      { status: 200 }
    );

    response.cookies.set('auth_token', novoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/',
    });

    return response;
  } catch (erro) {
    console.error('Erro ao renovar token:', erro);
    return NextResponse.json(
      { erro: 'Erro ao renovar token' },
      { status: 500 }
    );
  }
}
