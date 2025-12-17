"use server";

import { createClient } from "@/lib/supabase/server"; 

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  try {
    const { data: email, error: rpcError } = await supabase.rpc(
      "get_email_by_username_for_login",
      { p_username: username }
    );

    if (rpcError || !email) {
      return { error: "Usuário ou senha inválidos" };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { error: "Usuário ou senha inválidos" };
    }

    return { success: true };

  } catch (err) {
    return { error: "Erro no servidor ao fazer login" };
  }
}
