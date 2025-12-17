import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserContext = {
  user: any;
  userRole: string;
  userPermissions: Record<string, any>;
};

export async function getUserContext(): Promise<UserContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Cargo do usuário
  let userRole = "funcionario";

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("cargo")
      .eq("id", user.id)
      .single();

    if (profile?.cargo) {
      userRole = profile.cargo;
    }
  } catch (err) {
    console.warn("Erro ao buscar cargo do usuário:", err);
  }

  // Permissões
  let userPermissions: Record<string, any> = {};

  try {
    const { data: perms } = await supabase
      .from("usuario_permissoes_funcionalidades")
      .select("modulos")
      .eq("usuario_id", user.id)
      .single();

    if (perms?.modulos) {
      userPermissions = perms.modulos;
    }
  } catch (err) {
    console.warn("Erro ao buscar permissões do usuário:", err);
  }

  return {
    user,
    userRole,
    userPermissions,
  };
}
