"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Obra } from "@/lib/types";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

interface FinanceiroChartProps {
  obras: Obra[];
}

export function FinanceiroChart({ obras }: FinanceiroChartProps) {
  const COLORS = {
    yellow: '#F5C800',
    black: '#1E1E1E',
    gray: '#8B8B8B',
    green: '#10B981',
    blue: '#3B82F6',
    orange: '#F97316',
  };

  // Distribuição de valores por componente
  const distribuicaoValores = [
    {
      name: 'Entradas',
      valor: obras.reduce((sum, obra) => sum + (Number(obra.entrada) || 0), 0),
      color: COLORS.green,
    },
    {
      name: 'Financiado',
      valor: obras.reduce((sum, obra) => sum + (Number(obra.valor_financiado) || 0), 0),
      color: COLORS.blue,
    },
    {
      name: 'Subsídio',
      valor: obras.reduce((sum, obra) => sum + (Number(obra.subsidio) || 0), 0),
      color: COLORS.yellow,
    },
    {
      name: 'Terreno',
      valor: obras.reduce((sum, obra) => sum + (Number(obra.valor_terreno) || 0), 0),
      color: COLORS.orange,
    },
  ];

  // Faturamento por responsável
  const faturamentoPorResponsavel = obras.reduce((acc, obra) => {
    const responsavel = obra.responsavel || 'Não definido';
    const existing = acc.find(item => item.responsavel === responsavel);
    if (existing) {
      existing.valor += Number(obra.valor_total) || 0;
      existing.quantidade += 1;
    } else {
      acc.push({ 
        responsavel, 
        valor: Number(obra.valor_total) || 0,
        quantidade: 1 
      });
    }
    return acc;
  }, [] as { responsavel: string; valor: number; quantidade: number }[])
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  // Evolução mensal (últimos 12 meses)
  const evolucaoMensal = obras.reduce((acc, obra) => {
    const date = obra.data_conclusao ? new Date(obra.data_conclusao) : new Date(obra.created_at);
    const mesAno = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const existing = acc.find(item => item.mes === mesAno);
    if (existing) {
      existing.valor += Number(obra.valor_total) || 0;
      existing.obras += 1;
    } else {
      acc.push({ 
        mes: mesAno, 
        valor: Number(obra.valor_total) || 0,
        obras: 1 
      });
    }
    return acc;
  }, [] as { mes: string; valor: number; obras: number }[])
    .sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/').map(Number);
      const [mesB, anoB] = b.mes.split('/').map(Number);
      return (anoA * 12 + mesA) - (anoB * 12 + mesB);
    })
    .slice(-12);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Distribuição de Valores */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            Distribuição de Valores
          </CardTitle>
          <CardDescription>Composição financeira das obras</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoValores}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.valor)}`}
                outerRadius={100}
                dataKey="valor"
              >
                {distribuicaoValores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Faturamento por Responsável */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Faturamento por Responsável
          </CardTitle>
          <CardDescription>Top 5 responsáveis por receita</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faturamentoPorResponsavel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="responsavel" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Bar dataKey="valor" fill={COLORS.yellow} name="Faturamento" />
              <Bar dataKey="quantidade" fill={COLORS.black} name="Nº Obras" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução Temporal */}
      <Card className="border-0 shadow-lg lg:col-span-2">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Evolução Mensal
          </CardTitle>
          <CardDescription>Faturamento e quantidade de obras nos últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Faturamento') return formatCurrency(value);
                  return value;
                }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="valor" 
                stroke={COLORS.yellow} 
                strokeWidth={3}
                name="Faturamento"
                dot={{ fill: COLORS.yellow, r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="obras" 
                stroke={COLORS.blue} 
                strokeWidth={2}
                name="Quantidade de Obras"
                dot={{ fill: COLORS.blue, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
