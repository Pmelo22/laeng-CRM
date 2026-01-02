"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSubcategoryAction(name: string, categories_id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("subcategories").insert({ name, categories_id })
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function updateSubcategoryAction(id: string, name: string, categories_id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("subcategories")
      .update({ name, categories_id })
      .eq("id", id)
    
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteSubcategoryAction(id: string) {
  const supabase = await createClient()
  try {
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: 'exact', head: true })
      .eq("subcategories_id", id)

    if (countError) throw countError
    if (count && count > 0) {
      return { ok: false, error: "Não é possível excluir: Existem transações usando esta subcategoria." }
    }

    const { error } = await supabase.from("subcategories").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
