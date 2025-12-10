"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateClienteStatus(
  clienteId: string,
  newStatus: "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE"
) {
  const supabase = await createClient();

  try {
    // 1. Atualizar status do cliente
    const { error: clienteError } = await supabase
      .from("clientes")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clienteId);

    if (clienteError) throw clienteError;

    // 2. Atualizar status de todas as obras associadas
    const { error: obrasError } = await supabase
      .from("obras")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("cliente_id", clienteId);

    if (obrasError) console.warn("Aviso ao atualizar obras:", obrasError);

    // 3. Revalidar caches
    // A VIEW vw_clientes_financeiro recalcula agregados automaticamente
    // pois faz JOIN com obras. Apenas precisamos revalidar o cache.
    revalidatePath("/dashboard", "layout");
    revalidatePath("/clientes", "layout");
    revalidatePath(`/clientes/${clienteId}`, "layout");
    revalidatePath("/financeira", "layout");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}
