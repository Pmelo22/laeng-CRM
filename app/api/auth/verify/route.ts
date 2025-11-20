import { verificarJWT } from '@/lib/auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extrai o token do cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { erro: 'Token não encontrado', autenticado: false },
        { status: 401 }
      );
    }

    // Verifica se o token é válido
    const payload = verificarJWT(token);

    if (!payload) {
      return NextResponse.json(
        { erro: 'Token inválido ou expirado', autenticado: false },
        { status: 401 }
      );
    }

    // Retorna os dados do usuário decodificados do token
    return NextResponse.json(
      {
        autenticado: true,
        usuario: {
          id: payload.usuarioId,
          login: payload.login,
          cargo: payload.cargo,
          permissoes: payload.permissoes,
        },
      },
      { status: 200 }
    );
  } catch (erro) {
    console.error('Erro ao verificar autenticação:', erro);
    return NextResponse.json(
      { erro: 'Erro ao verificar autenticação', autenticado: false },
      { status: 500 }
    );
  }
}
