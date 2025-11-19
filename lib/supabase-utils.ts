import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Busca o próximo código sequencial disponível para uma tabela
 * @param supabase - Cliente Supabase
 * @param tableName - Nome da tabela
 * @returns Próximo código disponível
 */
export async function getNextCode(
  supabase: SupabaseClient,
  tableName: string
): Promise<number> {
  const { data: ultimoRegistro, error } = await supabase
    .from(tableName)
    .select("codigo")
    .order("codigo", { ascending: false })
    .limit(1)
    .single()

  // PGRST116 = nenhum registro encontrado (primeira inserção)
  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return ultimoRegistro ? ultimoRegistro.codigo + 1 : 1
}
