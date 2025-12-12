"use server"

import { createClient } from "@supabase/supabase-js"
import { mapPermissoesToModulos } from "@/components/actions/mapPermissionsToUser"
import type { PermissoesUsuario } from "@/lib/types"

interface EditUserInput {
  userId: string
  login: string
  nomeCompleto: string
  cargo: "admin" | "funcionario"
  senha?: string | null
  permissoes: PermissoesUsuario
}

export async function editarUsuarioAction(input: EditUserInput) {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { userId, login, nomeCompleto, cargo, senha, permissoes } = input
  const adminAuthClient = supabase.auth.admin

  try {

    //Atualiza profile
    const { error: profileError } = await supabase.from("profiles").update({  login,  nome_completo: nomeCompleto,  cargo,}).eq("id", userId)

    if (profileError)
      throw new Error("Erro ao atualizar profile: " + profileError.message)

    // Atualiza senha
    if (senha) { const { error: passwordError } = await adminAuthClient.updateUserById(  userId,  { password: senha, })
    if (passwordError)  throw new Error("Erro ao redefinir senha: " + passwordError.message)}

    //Permissões da aplicação
    const modulosJson = mapPermissoesToModulos(permissoes)

    const { data: existingPerm, error: permSelectError } = await supabase.from("usuario_permissoes_funcionalidades").select("id").eq("usuario_id", userId).maybeSingle()

    if (permSelectError) throw new Error("Erro ao buscar permissões: " + permSelectError.message)

    if (existingPerm) {const { error: permUpdateError } = await supabase.from("usuario_permissoes_funcionalidades").update({ modulos: modulosJson }).eq("usuario_id", userId)

    if (permUpdateError) throw new Error( "Erro ao atualizar permissões: " + permUpdateError.message)
    } else { const { error: permInsertError } = await supabase.from("usuario_permissoes_funcionalidades").insert({ usuario_id: userId, modulos: modulosJson,})

      if (permInsertError)throw new Error("Erro ao criar permissões: " + permInsertError.message)
    }

    return {
      ok: true,
      userId,
    }
    
  } catch (e: any) {
    console.error("❌ Erro ao editar usuário:", e)
    return {
      ok: false,
      error: e.message ?? "Erro desconhecido",
    }
  }
}
