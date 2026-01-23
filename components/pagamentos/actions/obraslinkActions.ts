"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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