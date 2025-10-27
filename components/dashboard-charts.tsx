"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Obra } from "@/lib/types";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  obras: Obra[];
}

export function DashboardCharts({ obras }: DashboardChartsProps) {
  // Cores da identidade visual (amarelo e preto)
  const COLORS = {
    yellow: '#F5C800',
    black: '#1E1E1E',
    gray: '#8B8B8B',
    lightYellow: '#FFD700',
    darkYellow: '#D4A800',
  };

  const PIE_COLORS = [COLORS.yellow, COLORS.black, COLORS.gray];

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

  // Obras por Fase (Pie Chart)
  const obrasPorFase = obras.reduce((acc, obra) => {
    const status = obra.status || 'Não definido';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Adicionar total geral para o pie chart
  const totalObras = obras.length;
  const obrasPorFaseComTotal = [
    ...obrasPorFase,
    { name: 'Total geral', value: totalObras }
  ];

  // Faturamento por Ano (Line Chart)
  const faturamentoPorAno = obras.reduce((acc, obra) => {
    const ano = obra.ano_obra || new Date(obra.data_conclusao || obra.created_at).getFullYear();
    const existing = acc.find(item => item.ano === ano);
    if (existing) {
      existing.valor += Number(obra.valor_total) || 0;
    } else {
      acc.push({ ano, valor: Number(obra.valor_total) || 0 });
    }
    return acc;
  }, [] as { ano: number; valor: number }[]).sort((a, b) => a.ano - b.ano);

  // Obras por Ano (Line Chart)
  const obrasPorAno = obras.reduce((acc, obra) => {
    const ano = obra.ano_obra || new Date(obra.data_conclusao || obra.created_at).getFullYear();
    const existing = acc.find(item => item.ano === ano);
    if (existing) {
      existing.quantidade += 1;
    } else {
      acc.push({ ano, quantidade: 1 });
    }
    return acc;
  }, [] as { ano: number; quantidade: number }[]).sort((a, b) => a.ano - b.ano);

  // Locais de Obra
  const locaisObra = obras.reduce((acc, obra) => {
    const local = obra.local_obra || obra.endereco || 'Não definido';
    const existing = acc.find(item => item.local === local);
    if (existing) {
      existing.quantidade += 1;
    } else {
      acc.push({ local, quantidade: 1 });
    }
    return acc;
  }, [] as { local: string; quantidade: number }[]).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);

  // Locais de Obra por Valor
  const locaisObraValor = obras.reduce((acc, obra) => {
    const local = obra.local_obra || obra.endereco || 'Não definido';
    const existing = acc.find(item => item.local === local);
    if (existing) {
      existing.valor += Number(obra.valor_total) || 0;
    } else {
      acc.push({ local, valor: Number(obra.valor_total) || 0 });
    }
    return acc;
  }, [] as { local: string; valor: number }[]).sort((a, b) => b.valor - a.valor).slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Faturamento por Fase */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            FATURAMENTO x FASE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faturamentoPorFase}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fase" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar dataKey="valor" fill={COLORS.yellow} name="Valor Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Obras por Fase */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            OBRAS x FASE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={obrasPorFaseComTotal}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill={COLORS.yellow}
                dataKey="value"
              >
                {obrasPorFaseComTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Faturamento por Ano */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            FATURAMENTO x ANO
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={faturamentoPorAno}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke={COLORS.darkYellow} 
                strokeWidth={2}
                name="Faturamento"
                dot={{ fill: COLORS.yellow, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Obras por Ano */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            OBRA x ANO
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={obrasPorAno}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quantidade" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Quantidade de Obras"
                dot={{ fill: '#3B82F6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Locais de Obra */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            LOCAIS DE OBRA
          </CardTitle>
          <CardDescription>Top 5 locais com mais obras</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={locaisObra}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="local" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quantidade" 
                stroke={COLORS.darkYellow} 
                strokeWidth={2}
                name="Quantidade"
                dot={{ fill: COLORS.yellow, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Locais de Obra por Valor */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            LOCAIS DE OBRA x VALOR
          </CardTitle>
          <CardDescription>Top 5 locais por faturamento</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={locaisObraValor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="local" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke={COLORS.darkYellow} 
                strokeWidth={2}
                name="Valor Total"
                dot={{ fill: COLORS.yellow, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
