import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PagamentosPageContent from "./pagamentos-page-content"
import { getUserContext } from "../auth/context/userContext";
import { Account, Categories, Pagamentos } from "@/lib/types";
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

  const {data: categoriasData} = await supabase.from("categories").select("id , name")
  const {data: accountsData} = await supabase.from("accounts").select("id, name")

  const pagamentos: Pagamentos[] = (pagamentosData || []).map((transaction: any) => ({
    ...transaction,
    category_name: transaction.categories?.name || 'Sem Categoria',
    account_name: transaction.accounts?.name || 'Conta desconhecida',
    cliente_nome: transaction.clientes?.nome || null 
  }));

  const categories: Categories[] = categoriasData || []

  const categoryOptions = categoriasData?.map((cat) => ({label: cat.name, value: cat.id })) || []

  const accountOptions = accountsData?.map((cat) => ({label: cat.name, value: cat.id })) || []

  console.log(categoryOptions)

  const accounts: Account[] = accountsData || []

  const metrics = calculateFinancialMetrics(pagamentos)

  console.log(pagamentos)
  console.log(categories)
  console.log(accounts)

  return <PagamentosPageContent metrics={metrics} pagamentos={pagamentos} categories={categoryOptions} accounts={accountOptions} userPermissions={userPermissions} />
}