"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowDownCircle, ArrowUpCircle, Wallet, CreditCard, AlertCircle } from "lucide-react"
import { Pagamentos } from "@/lib/types"

// --- Tipos e Utilitários ---
interface PagamentosReportFullProps {
  data: Pagamentos[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const COLORS = {
  receita: "#22c55e", // green-500
  despesa: "#ef4444", // red-500
  primary: "#3b82f6", // blue-500
  purple: "#8b5cf6",  // violet-500
  gray: "#94a3b8",    // slate-400
  chartPalette: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
}

// --- Componente Principal ---
export function PagamentosReportFull({ data }: PagamentosReportFullProps) {
  // Estado para controlar o que o Gráfico de Rosca exibe
  const [chartMetric, setChartMetric] = useState<string>("type")

  // 1. Cálculos Gerais (Cards Superiores)
  const metrics = useMemo(() => {
    let entradas = 0
    let saidas = 0
    let aReceber = 0
    let aPagar = 0

    data.forEach(p => {
      const val = Number(p.amount) || 0
      if (p.type === "receita") {
        entradas += val
        if (p.status === "not_pago") aReceber += val
      } else {
        saidas += val
        if (p.status === "not_pago") aPagar += val
      }
    })

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      aReceber,
      aPagar
    }
  }, [data])

  // 2. Dados para o Gráfico de Fluxo Diário (Bar Chart)
  const dailyData = useMemo(() => {
    const grouped: Record<string, { date: string; receita: number; despesa: number }> = {}

    data.forEach(p => {
      if (!p.date) return
      // Agrupa por dia (YYYY-MM-DD)
      const dateKey = p.date.split("T")[0] 
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, receita: 0, despesa: 0 }
      }

      const val = Number(p.amount) || 0
      if (p.type === "receita") grouped[dateKey].receita += val
      else grouped[dateKey].despesa += val
    })

    // Ordena por data e pega os últimos 15 dias (ou todos se estiver filtrado)
    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data])

  // 3. Dados Dinâmicos para o Gráfico de Rosca (Donut Chart)
  const donutData = useMemo(() => {
    const grouped: Record<string, number> = {}

    data.forEach(p => {
      let key = "Outros"
      
      switch (chartMetric) {
        case "type":
          key = p.type === "receita" ? "Receitas" : "Despesas"
          break
        case "status":
          key = p.status === "pago" ? "Pago" : "Pendente"
          break
        case "category":
          key = p.category_name || "Sem Categoria"
          break
        case "account":
          key = p.account_name || "Sem Conta"
          break
        case "method":
          key = p.method || "Outros"
          break
        default:
          key = "Geral"
      }

      grouped[key] = (grouped[key] || 0) + (Number(p.amount) || 0)
    })

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Maiores primeiro
      .slice(0, 8) // Top 8 para não poluir
  }, [data, chartMetric])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Seção 1: KPIs Gerais (Topo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo Geral</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.saldo)}</div>
            <p className="text-xs text-gray-400 mt-1">Total consolidado do período</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Contas a Pagar</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.aPagar)}</div>
            <p className="text-xs text-gray-400 mt-1">Valores pendentes na semana/mês</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Contas a Receber</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.aReceber)}</div>
            <p className="text-xs text-gray-400 mt-1">Valores previstos para entrada</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção 2: Layout Principal (Estilo da Imagem + Gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda: Balanço do Mês (Estilo Progress Bar) */}
        <Card className="lg:col-span-1 shadow-md border-0 h-full">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Balanço do Período</CardTitle>
            <CardDescription>Entradas vs Saídas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            
            {/* Barra de Entradas */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entradas</span>
                <span className="font-semibold text-gray-700">{formatCurrency(metrics.entradas)}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Barra de Saídas */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saídas</span>
                <span className="font-semibold text-gray-700">{formatCurrency(metrics.saidas)}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  // Calcula % visual simples (relativo a entradas para dar noção de escala, ou 100% se for maior)
                  style={{ width: metrics.entradas > 0 ? `${Math.min((metrics.saidas / metrics.entradas) * 100, 100)}%` : '100%' }} 
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-medium text-gray-900">Resultado</span>
              <span className={`text-lg font-bold ${metrics.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.saldo)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Coluna Central/Direita: Gráficos (Fluxo Diário e Rosca Dinâmica) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico 1: Fluxo de Caixa Diário */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Fluxo de Caixa Diário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), "dd/MM", { locale: ptBR })}
                      stroke="#94a3b8"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12}
                      tickFormatter={(val) => `R$${val/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => format(parseISO(label), "dd 'de' MMMM", { locale: ptBR })}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="receita" name="Receita" fill={COLORS.receita} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="despesa" name="Despesa" fill={COLORS.despesa} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 2: Distribuição Dinâmica (Rosca) */}
          <Card className="shadow-md border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-700">Distribuição</CardTitle>
              <div className="w-[180px]">
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Agrupar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type">Por Tipo</SelectItem>
                    <SelectItem value="category">Por Categoria</SelectItem>
                    <SelectItem value="status">Por Status</SelectItem>
                    <SelectItem value="account">Por Banco/Conta</SelectItem>
                    <SelectItem value="method">Por Método</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => {
                           let fill = COLORS.chartPalette[index % COLORS.chartPalette.length];
                           // Cores fixas para Tipos e Status
                           if (chartMetric === "type") {
                             fill = entry.name === "Receitas" ? COLORS.receita : COLORS.despesa;
                           }
                           if (chartMetric === "status") {
                             fill = entry.name === "Pago" ? COLORS.receita : COLORS.purple;
                           }
                           return <Cell key={`cell-${index}`} fill={fill} stroke="none" />
                        })}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400 text-sm">Sem dados para este filtro</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}