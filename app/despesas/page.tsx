import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext";
import { Pagamentos } from "@/lib/types";
import { calculateFinancialMetrics } from "@/components/pagamentos/libs/pagamentos-financial";
import DespesasPageContent from "@/components/pagamentos/despesas-page-content"

export const dynamic = 'force-dynamic';

export default async function DespesasPage() {

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
        id,
        name,
        categories:categories_id (
          id,
          name
        )
      ),
      clientes:cliente_id (
        nome
      )
    `)
        .order("updated_at", { ascending: false })

    const { data: categoriasData } = await supabase.from("categories").select("id , name")
    const { data: subcategoriasData } = await supabase.from("subcategories").select("id, name, categories_id")

    // Maps

    const pagamentos: Pagamentos[] = (pagamentosData || []).map((transaction: any) => ({
        ...transaction,
        category_id: transaction.subcategories?.categories?.id,
        category_name: transaction.subcategories?.categories?.name || 'Sem Categoria',
        subcategory_name: transaction.subcategories?.name || 'Sem Subcategoria',
        cliente_nome: transaction.clientes?.nome || null
    }));

    const categoryOptions = categoriasData?.map((cat) => ({ label: cat.name, value: cat.id })) || []

    const metrics = calculateFinancialMetrics(pagamentos)

    return <DespesasPageContent metrics={metrics} pagamentos={pagamentos} categories={categoryOptions} subcategories={subcategoriasData || []} userPermissions={userPermissions} />
}
