import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash uma senha em texto plano
 * @param senha Senha em texto plano
 * @returns Promise com o hash bcrypt
 */
export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com seu hash
 * @param senhaPlain Senha em texto plano
 * @param senhaHash Hash da senha armazenado no banco
 * @returns Promise<boolean> true se as senhas coincidem
 */
export async function compararSenha(
  senhaPlain: string,
  senhaHash: string
): Promise<boolean> {
  return bcrypt.compare(senhaPlain, senhaHash);
}
