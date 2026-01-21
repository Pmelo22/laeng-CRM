"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

//Função marcada como deprected
export async function getFinanceiroForLinkAction() {
  const supabase = await createClient()
  try {
    console.log("--- INICIANDO BUSCA DE RECEITAS (CLIENTES/OBRAS) ---")

    const { data, error } = await supabase
      .from("obras")
      .select(`
        id, 
        codigo,
        cliente_id,
        entrada,
        valor_financiado,
        subsidio,
        clientes:cliente_id (
          nome
        )
      `)

    if (error) { throw error }

    const formattedData = data.map((item: any) => ({
      ...item,
      cliente_nome: item.clientes?.nome || `Cliente ID: ${item.cliente_id} (Não encontrado)`
    }))

    return { ok: true, data: formattedData }
  } catch (e: any) {
    console.error("❌ ERRO CATCH FINANCEIRO:", e.message)
    return { ok: false, error: e.message }
  }
}

export async function createBulkTransactionsAction(transactions: any[]) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("transactions").insert(transactions)

    if (error) throw error


    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function getObrasForReceitaAction() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("obras")
      .select(`
        id, 
        cliente_id,
        medicao_01,
        medicao_02,
        medicao_03,
        medicao_04,
        medicao_05,
        clientes:cliente_id (
          nome
        )
      `)

    if (error) { throw error }

    const formattedData = data.map((item: any) => ({
      ...item,
      cliente_nome: item.clientes?.nome || `Cliente ID: ${item.cliente_id} (Não encontrado)`
    }))

    return { ok: true, data: formattedData }
  } catch (e: any) {
    console.error("❌ ERRO CATCH OBRAS RECEITA:", e.message)
    return { ok: false, error: e.message }
  }
}