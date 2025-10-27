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

  // Buscar clientes
  const { data: clientesData } = await supabase
    .from("clientes")
    .select("*")
    .order("codigo", { ascending: true })

  const clientes = (clientesData as Cliente[]) || []

  // Buscar obras para cada cliente e calcular totais
  const { data: obrasData } = await supabase
    .from("obras")
    .select("cliente_id, valor_terreno, entrada, valor_financiado, subsidio, valor_total")

  // Criar um mapa de totais por cliente
  const clienteTotais = new Map()
  
  if (obrasData) {
    obrasData.forEach((obra) => {
      if (!clienteTotais.has(obra.cliente_id)) {
        clienteTotais.set(obra.cliente_id, {
          valor_terreno: 0,
          entrada: 0,
          valor_financiado: 0,
          subsidio: 0,
          valor_total: 0
        })
      }
      
      const totais = clienteTotais.get(obra.cliente_id)
      totais.valor_terreno += Number(obra.valor_terreno) || 0
      totais.entrada += Number(obra.entrada) || 0
      totais.valor_financiado += Number(obra.valor_financiado) || 0
      totais.subsidio += Number(obra.subsidio) || 0
      totais.valor_total += Number(obra.valor_total) || 0
    })
  }

  // Adicionar totais aos clientes
  const clientesComTotais = clientes.map(cliente => ({
    ...cliente,
    ...(clienteTotais.get(cliente.id) || {
      valor_terreno: 0,
      entrada: 0,
      valor_financiado: 0,
      subsidio: 0,
      valor_total: 0
    })
  }))

  return <ClientesPageContent clientes={clientesComTotais} />
}
