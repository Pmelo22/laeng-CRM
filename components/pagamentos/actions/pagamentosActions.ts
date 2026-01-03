"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Definição do tipo para os dados recebidos (pode ser importado de @/lib/types se preferir)
interface TransactionPayload {
  description: string
  amount: number
  date: string
  type: string
  method: string
  status: string
  subcategories_id: string | null
  account_id: string | null
  installments_current: number
  installments_total: number
}

export async function saveTransactionAction(data: TransactionPayload, id?: string) {
  const supabase = await createClient()

  // Prepara o payload final
  const payload = {
    ...data,
    // Garante que strings vazias virem null para chaves estrangeiras
    subcategories_id: data.subcategories_id || null, 
    account_id: data.account_id || null,
    updated_at: new Date().toISOString(),
  }

  try {
    if (id) {
      // --- UPDATE ---
      const { error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", id)

      if (error) throw error
    } else {
      // --- INSERT ---
      const { error } = await supabase
        .from("transactions")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })

      if (error) throw error
    }

    // Atualiza a página/cache para mostrar os novos dados
    revalidatePath("/pagamentos") // Ajuste para a rota onde sua lista aparece
    
    return { success: true, message: "Salvo com sucesso" }

  } catch (error: any) {
    console.error("Erro na Server Action:", error)
    return { success: false, message: error.message || "Erro desconhecido" }
  }
}