import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "../auth/context/userContext";
import { Pagamentos } from "@/lib/types";
import { calculateFinancialMetrics } from "@/lib/pagamentos-financial";
import PagamentosPageContent from "./pagamentos-page-content"

export const dynamic = 'force-dynamic';

export default async function PagamentosPage() {

  // Fetch
  const supabase = await createClient()

  const { userPermissions } = await getUserContext();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  //Query

  const { data: pagamentosData } = await supabase
    .from("transactions")
    .select(`
      *,
      subcategories:subcategories_id (
        name,
        categories:categories_id (
          id,
          name
        )
      ),
      accounts:account_id (
        name
      ),
      clientes:cliente_id (
        nome
      )
    `)
    .order("updated_at", { ascending: false })

  const {data: categoriasData} = await supabase.from("categories").select("id , name")
  const {data: subcategoriasData} = await supabase.from("subcategories").select("id, name")
  const {data: accountsData} = await supabase.from("accounts").select("id, name") 
  

  // Maps

  const pagamentos: Pagamentos[] = (pagamentosData || []).map((transaction: any) => ({
    ...transaction,
    category_name: transaction.subcategories?.categories?.name || 'Sem Categoria',
    subcategory_name: transaction.subcategories?.name || 'Sem Subcategoria',
    account_name: transaction.accounts?.name || 'Conta desconhecida',
    cliente_nome: transaction.clientes?.nome || null 
  }));

  const categoryOptions = categoriasData?.map((cat) => ({label: cat.name, value: cat.id })) || []

  const subcategoriaOptions = subcategoriasData?.map((cat) => ({label: cat.name, value: cat.id })) || []

  const accountOptions = accountsData?.map((cat) => ({label: cat.name, value: cat.id })) || []

  console.log(pagamentos)

  const metrics = calculateFinancialMetrics(pagamentos) 

  return <PagamentosPageContent metrics={metrics} pagamentos={pagamentos} categories={categoryOptions} subcategories={subcategoriaOptions} accounts={accountOptions} userPermissions={userPermissions} />
}