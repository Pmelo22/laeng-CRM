import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminPageContent from "./admin-page-content"
import type { Usuario } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  // Verifica autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // implementar backend, adicionar verificação de permissão admin
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("cargo")
  //   .eq("id", user.id)
  //   .single()
  //
  // if (!profile || profile.cargo !== 'admin') {
  //   redirect("/dashboard")
  // }

  // implementar backend, buscar usuários reais do banco quando pronto
  // const { data: usuarios } = await supabase
  //   .from("usuarios")
  //   .select("*")
  //   .order("created_at", { ascending: false })

  const usuarios: Usuario[] = []

  return <AdminPageContent usuarios={usuarios} />
}
