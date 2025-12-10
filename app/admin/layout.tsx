import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "../dashboard/layout-client";

export default async function AdminLayout({
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

  // Buscar dados do usuário NO SERVIDOR
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

  return <DashboardLayoutClient user={user} userRole={userRole}>{children}</DashboardLayoutClient>;
}
