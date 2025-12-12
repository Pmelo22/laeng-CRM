"use server"

import { createClient } from "@supabase/supabase-js"

export async function deletarUsuarioAction(userId: string) {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const adminAuthClient = supabase.auth.admin

  try {
    
    //Deleta permissoes primeiro
    const { error: permError } = await supabase
      .from("usuario_permissoes_funcionalidades")
      .delete()
      .eq("usuario_id", userId)

    if (permError)
      throw new Error("Erro ao remover permissões do usuário: " + permError.message)

    // Deleta auth
    const { error: deleteAuthError } = await adminAuthClient.deleteUser(userId)

    if (deleteAuthError)
      throw new Error("Erro ao deletar usuário na Auth: " + deleteAuthError.message)

    return {
      ok: true,
      userId,
    }

  } catch (e: any) {
    console.error("❌ Erro ao deletar usuário:", e)
    return {
      ok: false,
      error: e.message ?? "Erro desconhecido",
    }
  }
}
