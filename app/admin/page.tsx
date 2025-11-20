import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, CheckCircle } from "lucide-react";
import { AdminUsuariosTable } from "@/components/admin-usuarios-table";

interface Usuario {
  id: string;
  login: string;
  email: string;
  nome_completo: string;
  cargo: string;
  ativo: boolean;
  criado_em: string;
  ultimo_acesso: string | null;
}

export default async function AdminPage() {
  try {
    const supabase = await createAdminClient();

    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select("id, login, email, nome_completo, cargo, ativo, criado_em, ultimo_acesso")
      .order("criado_em", { ascending: false });

    if (usuariosError) {
      throw usuariosError;
    }

    const { data: permissoes, error: permissoesError } = await supabase
      .from("permissoes")
      .select("id, nome, descricao, recurso, acao")
      .order("nome", { ascending: true });

    if (permissoesError) {
      throw permissoesError;
    }

    const totalUsuarios = (usuarios || []).length;
    const totalAdmins = (usuarios || []).filter((u: Usuario) => u.cargo === "admin").length;
    const totalAtivos = (usuarios || []).filter((u: Usuario) => u.ativo).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Administração</h1>
            <p className="text-slate-600 mt-2">Gerencie usuários e permissões do sistema</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total de Usuários</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{totalUsuarios}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Administradores</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{totalAdmins}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{totalAtivos}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-0 shadow-md">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-900">Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AdminUsuariosTable usuarios={usuarios || []} permissoes={permissoes || []} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (erro) {
    console.error("Erro ao carregar página admin:", erro);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">
          Erro ao carregar página de administração
        </p>
      </div>
    );
  }
}
