import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Buscar dados do usuário NO SERVIDOR (não no cliente)
  let userRole = "funcionario"; // default
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

  // Buscar permissões do usuário
  let userPermissions: Record<string, any> = {};

  try {
    const { data: perms } = await supabase
      .from("usuario_permissoes_funcionalidades")
      .select("modulos")
      .eq("usuario_id", user.id)
      .single();

    console.log(perms)
    if (perms?.modulos) {
      userPermissions = perms.modulos;
    }
  } catch (err) {
    console.warn("Erro ao buscar permissões do usuário:", err);
  }



  return <DashboardLayoutClient user={user} userRole={userRole} userPermissions={userPermissions}>{children}</DashboardLayoutClient>;
}

