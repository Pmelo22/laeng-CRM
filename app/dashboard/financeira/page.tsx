import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FinanceiroChart } from "@/components/financeiro-chart";

export const dynamic = 'force-dynamic';

export default async function FinanceiraPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/login");
  }

  // Buscar todas as obras para calcular totais
  const { data: obras } = await supabase.from("obras").select("*");

  // Calcular métricas financeiras
  const totalReceitas = obras?.reduce((sum, obra) => sum + (Number(obra.valor_total) || 0), 0) || 0;
  const totalEntradas = obras?.reduce((sum, obra) => sum + (Number(obra.entrada) || 0), 0) || 0;
  const totalFinanciado = obras?.reduce((sum, obra) => sum + (Number(obra.valor_financiado) || 0), 0) || 0;
  const totalSubsidio = obras?.reduce((sum, obra) => sum + (Number(obra.subsidio) || 0), 0) || 0;
  const totalTerreno = obras?.reduce((sum, obra) => sum + (Number(obra.valor_terreno) || 0), 0) || 0;

  // Obras por status
  const obrasFinalizadas = obras?.filter(o => o.status === 'FINALIZADO') || [];
  const obrasAndamento = obras?.filter(o => o.status === 'EM ANDAMENTO') || [];
  
  const receitasFinalizadas = obrasFinalizadas.reduce((sum, obra) => sum + (Number(obra.valor_total) || 0), 0);
  const receitasEmAndamento = obrasAndamento.reduce((sum, obra) => sum + (Number(obra.valor_total) || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase">GESTÃO FINANCEIRA</h1>
          <p className="text-muted-foreground">Controle financeiro e análise de receitas</p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90 uppercase">TOTAL DE RECEITAS</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReceitas)}</div>
              <p className="text-xs text-white/80">Todas as obras</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90 uppercase">OBRAS FINALIZADAS</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(receitasFinalizadas)}</div>
              <p className="text-xs text-white/80">{obrasFinalizadas.length} obras</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90 uppercase">EM ANDAMENTO</CardTitle>
              <Building2 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(receitasEmAndamento)}</div>
              <p className="text-xs text-white/80">{obrasAndamento.length} obras</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-yellow-500 text-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase">TOTAL SUBSÍDIOS</CardTitle>
              <Wallet className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSubsidio)}</div>
              <p className="text-xs opacity-80">Subsídios recebidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento Financeiro */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalEntradas)}</div>
              <p className="text-sm text-muted-foreground mt-1">Pagamentos iniciais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valor Financiado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalFinanciado)}</div>
              <p className="text-sm text-muted-foreground mt-1">Total financiado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valor Terrenos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{formatCurrency(totalTerreno)}</div>
              <p className="text-sm text-muted-foreground mt-1">Investimento em terrenos</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Análise Financeira */}
        <FinanceiroChart obras={obras || []} />
      </div>
    </div>
  );
}
