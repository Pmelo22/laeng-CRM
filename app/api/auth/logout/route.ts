import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Remove o cookie de autenticação
    const response = NextResponse.json(
      { sucesso: true, mensagem: 'Logout realizado com sucesso' },
      { status: 200 }
    );

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (erro) {
    console.error('Erro no logout:', erro);
    return NextResponse.json(
      { erro: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
