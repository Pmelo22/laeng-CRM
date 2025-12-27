import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PagamentosPageContent from "./pagamentos-page-content"
import { getUserContext } from "../auth/context/userContext";
import { Pagamentos } from "@/lib/types";
import { calculateFinancialMetrics } from "@/lib/financial";

export const dynamic = 'force-dynamic';

export default async function PagamentosPage() {
  const supabase = await createClient()

  const { userPermissions } = await getUserContext();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: pagamentosData } = await supabase
    .from("transactions")
    .select(`
      *,
      categories:category_id (
        name
      ),
      accounts:account_id (
        name
      ),
      clientes:cliente_id (
        nome
      )
    `)
    .order("date", { ascending: false })

  const pagamentos: Pagamentos[] = (pagamentosData || []).map((transaction: any) => ({
    ...transaction,
    category_name: transaction.categories?.name || 'Sem Categoria',
    account_name: transaction.accounts?.name || 'Conta desconhecida',
    cliente_nome: transaction.clientes?.nome || null 
  }));

  const metrics = calculateFinancialMetrics(pagamentos)

  return <PagamentosPageContent metrics={metrics} pagamentos={pagamentos} userPermissions={userPermissions} />
}