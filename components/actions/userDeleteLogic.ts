"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function deletarUsuarioAction(userId: string) {
  
  const { supabase, adminAuthClient } = await createAdminClient()

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
