import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 dias em segundos

export interface JWTPayload {
  usuarioId: string;
  login: string;
  cargo: 'admin' | 'funcionario';
  permissoes: string[];
}

/**
 * Gera um JWT token
 * @param payload Dados a serem codificados no token
 * @param expiresIn Tempo de expiração em segundos (padrão: 7 dias)
 * @returns JWT token assinado
 */
export function gerarJWT(payload: JWTPayload, expiresIn: number = JWT_EXPIRES_IN): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifica e decodifica um JWT token
 * @param token JWT token a ser verificado
 * @returns JWTPayload se válido, null se inválido/expirado
 */
export function verificarJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 * @param authHeader Header Authorization (ex: "Bearer token")
 * @returns Token extraído ou null
 */
export function extrairTokenDoHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
