import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { DashboardFinanceiro, ObraFinanceiro } from "@/lib/types"
import FinanceiraPageContent from "./financeira-page-content"

export const dynamic = 'force-dynamic';

export default async function FinanceiraPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar dados do dashboard
  const { data: dashboardData } = await supabase
    .from("vw_dashboard_financeiro")
    .select("*")
    .single()

  const dashboard = (dashboardData as unknown as DashboardFinanceiro) || {
    total_obras: 0,
    obras_finalizadas: 0,
    obras_em_andamento: 0,
    obras_pendentes: 0,
    receita_total: 0,
    custo_total: 0,
    lucro_total: 0,
    margem_media: 0,
    obras_com_lucro: 0,
    obras_com_prejuizo: 0,
    obras_empate: 0,
  }

  // Buscar obras com dados financeiros
  const { data: obrasData } = await supabase
    .from("vw_obras_financeiro")
    .select("*")
    .order("resultado", { ascending: false })

  const obras = (obrasData as unknown as ObraFinanceiro[]) || []

  return <FinanceiraPageContent dashboard={dashboard} obras={obras} />
}
