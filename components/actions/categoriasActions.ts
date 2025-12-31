"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"


//Categorias 

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

// Subcategorias

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

//Bancos

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