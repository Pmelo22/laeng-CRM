"use server"

import { createClient } from "@supabase/supabase-js"
import { mapPermissoesToModulos } from "@/components/actions/mapPermissionsToUser"
import type { PermissoesUsuario } from "@/lib/types"

interface CreateUserInput {  login: string,  senha: string, cargo: "admin" | "funcionario", permissoes: PermissoesUsuario, nomeCompleto: string }

export async function criarUsuarioAction(input: CreateUserInput) {

  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  //NÃO CONFUDIR ESSE CREATECLIENT COM O DO SERVER.TS. ESSE DAQUI VEM DE OUTRO IMPORT https://supabase.com/docs/reference/javascript/admin-api
  const supabase = createClient(supabase_url, service_role_key, {
      auth: {
          autoRefreshToken: false,
          persistSession: false,
      },
  })

  const adminAuthClient = supabase.auth.admin

  const { login, senha, cargo, permissoes } = input

  const fakeEmail = `${login}@mockup.local`

  try {

    //Tabela Auth do Supabase
    const { data: authUser, error: authError } = await adminAuthClient.createUser({
      email: fakeEmail,
      password: senha,
      email_confirm: true,
      user_metadata: { login},
    })

    if (authError) throw new Error("Erro ao criar usuário na Auth: " + authError.message)

    const userId = authUser.user.id

    //Atualiza cargo em profiles
    const { error: profileError } = await supabase.from("profiles").update({ cargo, login, nome_completo: input.nomeCompleto }).eq("id", userId)

    if (profileError) throw new Error("Erro ao atualizar profile: " + profileError.message)

    //Permissões da Aplicação
    const modulosJson = mapPermissoesToModulos(permissoes)

    const { error: permError } = await supabase .from("usuario_permissoes_funcionalidades").insert({  usuario_id: userId,  modulos: modulosJson,})

    if (permError) throw new Error("Erro ao salvar permissões: " + permError.message)

    
    return {
      ok: true,
      userId,
    }

  } catch (e: any) {
    console.error("❌ Erro na criação do usuário:", e)
    return {
      ok: false,
      error: e.message ?? "Erro desconhecido"
    }
  }
}
