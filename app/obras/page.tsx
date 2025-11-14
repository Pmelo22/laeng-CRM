import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ObraComCliente } from "@/lib/types"
import ObrasPageContent from "./obras-page-content"

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar obras com informações do cliente
  const { data: obrasData } = await supabase
    .from("obras")
    .select(`
      *,
      clientes:cliente_id (
        nome,
        endereco,
        cidade,
        telefone
      )
    `)
    .order("codigo", { ascending: true })

  // Transformar dados para incluir informações do cliente
  const obras: ObraComCliente[] = (obrasData || []).map((obra) => ({
    ...obra,
    cliente_nome: (obra.clientes as { nome?: string })?.nome || 'Cliente não encontrado',
    cliente_endereco: (obra.clientes as { endereco?: string })?.endereco || '',
    cliente_cidade: (obra.clientes as { cidade?: string })?.cidade || '',
    cliente_telefone: (obra.clientes as { telefone?: string })?.telefone || '',
  }))

  return <ObrasPageContent obras={obras} />
}
