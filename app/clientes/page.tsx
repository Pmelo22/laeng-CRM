import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Cliente } from "@/lib/types"
import ClientesPageContent from "./clientes-page-content"

export const dynamic = 'force-dynamic';

// Server Component wrapper
export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar clientes com dados agregados da VIEW (muito mais eficiente!)
  const { data: clientesData } = await supabase
    .from("vw_clientes_financeiro")
    .select("*")
    .order("codigo", { ascending: true })

  const clientes = (clientesData as Cliente[]) || []

  return <ClientesPageContent clientes={clientes} />
}
