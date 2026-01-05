"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCategoryAction(name: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("categories").insert({ name })
    if (error) throw error
    revalidatePath("/pagamentos") 
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function updateCategoryAction(id: string, name: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("categories").update({ name }).eq("id", id)
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteCategoryAction(id: string) {
  const supabase = await createClient()
  try {
    const { count, error: countError } = await supabase
      .from("subcategories")
      .select("*", { count: 'exact', head: true })
      .eq("categories_id", id)

    if (countError) throw countError
    if (count && count > 0) {
      return { ok: false, error: "Não é possível excluir: Esta categoria possui subcategorias vinculadas." }
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/pagamentos")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
