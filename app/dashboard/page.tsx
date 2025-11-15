import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Building2, TrendingUp, DollarSign, ArrowUpRight, Activity } from 'lucide-react';
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard-charts";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Buscar estatísticas em paralelo para melhor performance
  const [
    { count: clientesCount },
    { data: obras },
    { count: contratosCount }
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("obras").select("*"),
    supabase.from("contratos").select("*", { count: "exact", head: true })
  ]);

  const obrasAtivas = obras?.filter(o => o.status === 'EM ANDAMENTO').length || 0;

  // Calcular receita total
  const receitaTotal = obras?.reduce((sum, obra) => sum + (Number(obra.valor_total) || 0), 0) || 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase">
          DASHBOARD
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          Bem-vindo ao sistema de gestão de engenharia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-white/90 uppercase">TOTAL DE CLIENTES</CardTitle>
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold">{clientesCount || 0}</div>
            <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 sm:mt-1 flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90 uppercase">OBRAS ATIVAS</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{obrasAtivas}</div>
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90 uppercase">TOTAL DE CONTRATOS</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{contratosCount || 0}</div>
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Todos os contratos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-yellow-500 text-black overflow-hidden relative group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium uppercase">RECEITA TOTAL</CardTitle>
            <div className="p-2 bg-black/20 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(receitaTotal)}
            </div>
            <p className="text-xs opacity-80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Valor total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts obras={obras || []} />

      {/* Main Content Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center gap-2 uppercase">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              ACESSO RÁPIDO
            </CardTitle>
            <CardDescription>
              Principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/clientes" className="group">
                <div className="p-5 border-2 border-slate-100 rounded-xl hover:border-primary hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50 group-hover:from-primary/5 group-hover:to-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                      <Users className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 uppercase">GESTÃO DE CLIENTES</h3>
                  <p className="text-sm text-muted-foreground">Cadastro e controle completo</p>
                </div>
              </Link>

              <Link href="/obras" className="group">
                <div className="p-5 border-2 border-slate-100 rounded-xl hover:border-primary hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50 group-hover:from-primary/5 group-hover:to-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-500 transition-colors">
                      <Building2 className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 uppercase">CONTROLE DE OBRAS</h3>
                  <p className="text-sm text-muted-foreground">Acompanhamento de projetos</p>
                </div>
              </Link>

              <Link href="/financeira" className="group">
                <div className="p-5 border-2 border-slate-100 rounded-xl hover:border-primary hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50 group-hover:from-primary/5 group-hover:to-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-500 transition-colors">
                      <DollarSign className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 uppercase">GESTÃO FINANCEIRA</h3>
                  <p className="text-sm text-muted-foreground">Controle de receitas e despesas</p>
                </div>
              </Link>

              <Link href="/dashboard/contratos" className="group">
                <div className="p-5 border-2 border-slate-100 rounded-xl hover:border-primary hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50 group-hover:from-primary/5 group-hover:to-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition-colors">
                      <FileText className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 uppercase">CONTRATOS</h3>
                  <p className="text-sm text-muted-foreground">Gestão de contratos</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center gap-2 uppercase">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              ATIVIDADES
            </CardTitle>
            <CardDescription>
              Últimas atualizações
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistema iniciado</p>
                  <p className="text-xs text-muted-foreground mt-1">Pronto para uso</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
