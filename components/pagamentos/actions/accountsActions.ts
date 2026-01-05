"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createAccountAction(name: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("accounts").insert({ name })
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function updateAccountAction(id: string, name: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("accounts")
      .update({ name })
      .eq("id", id)
    
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteAccountAction(id: string) {
  const supabase = await createClient()
  try {
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: 'exact', head: true })
      .eq("account_id", id)

    if (countError) throw countError
    
    if (count && count > 0) {
      return { 
        ok: false, 
        error: "Não é possível excluir: Existem transações financeiras vinculadas a este Banco/Conta." 
      }
    }

    const { error } = await supabase.from("accounts").delete().eq("id", id)
    if (error) throw error
    
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}