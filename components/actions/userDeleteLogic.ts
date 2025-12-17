"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function deletarUsuarioAction(userId: string) {
  
  const { supabase, adminAuthClient } = await createAdminClient()

  try {
    // 1. Deleta permissões primeiro
    const { error: permError } = await supabase
      .from("usuario_permissoes_funcionalidades")
      .delete()
      .eq("usuario_id", userId)

    if (permError) {
      console.warn("⚠️ Aviso ao remover permissões:", permError.message)
      // Não falha se não houver permissões
    }

    // 2. Deleta o profile (referência na tabela public.profiles)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.warn("⚠️ Aviso ao remover profile:", profileError.message)
      // Não falha se não houver profile
    }

    // 3. Deleta o usuário da Auth
    try {
      const { error: deleteAuthError } = await adminAuthClient.deleteUser(userId)

      if (deleteAuthError) {
        console.error("❌ Erro Supabase Auth:", deleteAuthError)
        // Se o erro for about non-existent user ou similar, aceita
        if (deleteAuthError.message && (
          deleteAuthError.message.includes("not found") || 
          deleteAuthError.message.includes("não encontrado")
        )) {
          console.log("✅ Usuário já estava deletado na Auth")
        } else {
          throw new Error("Erro ao deletar usuário na Auth: " + deleteAuthError.message)
        }
      }
    } catch (authError: any) {
      // Se der erro na auth, tenta continuar se o profile foi deletado
      if (profileError) {
        throw authError
      }
      console.warn("⚠️ Aviso ao deletar da Auth:", authError.message)
    }

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
