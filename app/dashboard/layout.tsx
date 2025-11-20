import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";
import { obterUsuarioAutenticado } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obterUsuarioAutenticado();

  if (!usuario) {
    redirect("/auth/login");
  }

  // Busca dados completos do usuário no banco
  const supabase = await createAdminClient();
  const { data: usuarioCompleto } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', usuario.usuarioId)
    .single();

  // Converte para formato esperado pelo layout-client
  const user = {
    id: usuario.usuarioId,
    email: usuarioCompleto?.email || '',
    user_metadata: {
      name: usuarioCompleto?.nome_completo || usuarioCompleto?.login,
    },
    cargo: usuarioCompleto?.cargo || 'funcionario',
  };

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}