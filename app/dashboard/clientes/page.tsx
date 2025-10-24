import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Cliente } from "@/lib/types"
import ClientesPageContent from "./clientes-page-content"

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

  // Buscar clientes
  const { data: clientesData } = await supabase
    .from("clientes")
    .select("*")
    .order("codigo", { ascending: true })

  const clientes = (clientesData as Cliente[]) || []

  return <ClientesPageContent clientes={clientes} />
}
