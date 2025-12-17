"use server"

import { createClient } from "@/lib/supabase/server"
import type { Usuario } from "@/lib/types"

export async function getUsuarios(): Promise<Usuario[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_usuarios_com_modulos")

  if (error) {
    console.error("Erro ao buscar usuários:", error)
    return []
  }

  return data as Usuario[]
}
