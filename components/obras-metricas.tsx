"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Obra } from "@/lib/types";

interface ObrasMetricasProps {
  obras: Obra[];
  receitaTotal: number;
  custoTotal: number;
  lucroTotal: number;
  margemLucro: string | number;
}

export function ObrasMetricas({
  obras,
  receitaTotal,
  custoTotal,
  lucroTotal,
  margemLucro,
}: ObrasMetricasProps) {
  // Faturamento por Fase
  const faturamentoPorFase = obras.reduce((acc, obra) => {
    const fase = obra.fase || 'Não definido';
    const existing = acc.find(item => item.fase === fase);
    if (existing) {
      existing.valor += Number(obra.valor_total) || 0;
    } else {
      acc.push({ fase, valor: Number(obra.valor_total) || 0 });
    }
    return acc;
  }, [] as { fase: string; valor: number }[]);

  // Obras por Status
  const obrasPorStatus = obras.reduce((acc, obra) => {
    const status = obra.status || 'Não definido';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-4">
      {/* 4 Cards embaixo - 2 Gráficos + 2 Métricas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Gráfico: Faturamento por Fase */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Faturamento x Fase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faturamentoPorFase}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fase" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip 
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '12px' }}
                />
                <Bar dataKey="valor" fill="#F5C800" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico: Obras por Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Obras por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={obrasPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#F5C800"
                  dataKey="value"
                >
                  {obrasPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#F5C800', '#1E1E1E', '#8B8B8B'][index]} />
                  ))}
                </Pie>
                  <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métrica: Faturamento Total */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(receitaTotal)}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Custo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(custoTotal)}
            </p>
          </CardContent>
        </Card>

        {/* Métrica: Lucro por Obra */}
        <Card className={`border-0 shadow-lg bg-gradient-to-br ${lucroTotal >= 0 ? 'from-green-50 to-green-100/50' : 'from-red-50 to-red-100/50'} hover:shadow-xl transition-shadow`}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase">Lucratividade Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl sm:text-3xl font-bold ${lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {((lucroTotal / (obras?.length || 1))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} por obra
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Margem geral: <span className={`font-bold ${parseFloat(margemLucro as string) > 0 ? 'text-green-600' : 'text-red-600'}`}>{margemLucro}%</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
