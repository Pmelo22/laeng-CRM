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
import { ArrowDownCircle, ArrowUpCircle, Wallet, AlertCircle } from "lucide-react"
import { Pagamentos } from "@/lib/types"

// --- Tipos e Utilitários ---
interface PagamentosDashboardProps {
  data: Pagamentos[]
  periodLabel?: string 
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const COLORS = {
  receita: "#22c55e", 
  despesa: "#ef4444", 
  primary: "#3b82f6", 
  purple: "#8b5cf6",  
  gray: "#94a3b8",    
  chartPalette: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ff7300", "#387908"]
}

export function PagamentosDashboard({ data, periodLabel = "Geral" }: PagamentosDashboardProps) {
  const [chartMetric, setChartMetric] = useState<string>("category")

  // 1. Cálculos Gerais (KPIs)
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

    return { entradas, saidas, saldo: entradas - saidas, aReceber, aPagar }
  }, [data])

  // 2. Cálculo de Balanço por Categoria (NOVO)
  const categoryBalances = useMemo(() => {
    const groups: Record<string, { entradas: number; saidas: number }> = {}

    data.forEach(p => {
      // Usamos category_name ou fallback
      const cat = p.category_name || "Sem Categoria"
      if (!groups[cat]) groups[cat] = { entradas: 0, saidas: 0 }

      const val = Number(p.amount) || 0
      if (p.type === "receita") groups[cat].entradas += val
      else groups[cat].saidas += val
    })

    // Converte para array e ordena por volume total (entradas + saídas) para mostrar os mais relevantes primeiro
    return Object.entries(groups)
      .map(([name, vals]) => ({ 
        name, 
        ...vals, 
        saldo: vals.entradas - vals.saidas,
        volume: vals.entradas + vals.saidas
      }))
      .sort((a, b) => b.volume - a.volume)
  }, [data])

  // 3. Gráfico de Barras (Fluxo Diário)
  const dailyData = useMemo(() => {
    const grouped: Record<string, { date: string; receita: number; despesa: number }> = {}

    data.forEach(p => {
      if (!p.date) return
      const dateKey = p.date.split("T")[0] 
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, receita: 0, despesa: 0 }
      }

      const val = Number(p.amount) || 0
      if (p.type === "receita") grouped[dateKey].receita += val
      else grouped[dateKey].despesa += val
    })

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data])

  // 4. Dados Dinâmicos para os Gráficos de Rosca
  const { donutReceitas, donutDespesas } = useMemo(() => {
    const receitasMap: Record<string, number> = {}
    const despesasMap: Record<string, number> = {}

    data.forEach(p => {
      if (p.status !== "pago") return

      let key = "Outros"
      switch (chartMetric) {
        case "category": key = p.category_name || "Sem Categoria"; break
        case "subcategory": key = p.subcategory_name || "Sem Subcategoria"; break
        case "account": key = p.account_name || "Sem Conta"; break
        case "method": key = p.method || "Outros"; break
        default: key = "Geral"
      }

      const val = Number(p.amount) || 0
      if (p.type === "receita") receitasMap[key] = (receitasMap[key] || 0) + val
      else despesasMap[key] = (despesasMap[key] || 0) + val
    })

    const processData = (map: Record<string, number>) => 
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    return {
      donutReceitas: processData(receitasMap),
      donutDespesas: processData(despesasMap)
    }
  }, [data, chartMetric])

  // Helper para calcular porcentagem da barra de progresso (evita divisão por zero)
  const calculateProgress = (val: number, total: number) => {
    if (total === 0) return val > 0 ? 100 : 0
    return Math.min((val / total) * 100, 100)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo Geral</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.saldo)}</div>
            <p className="text-xs text-gray-400 mt-1">Total consolidado</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Contas a Pagar</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.aPagar)}</div>
            <p className="text-xs text-gray-400 mt-1">Pendentes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Contas a Receber</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.aReceber)}</div>
            <p className="text-xs text-gray-400 mt-1">Previstos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Balanços e Métricas */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Balanço Geral do Período */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Balanço do Período</CardTitle>
              <CardDescription className="capitalize">{periodLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Entradas</span>
                  <span className="font-semibold text-gray-700">{formatCurrency(metrics.entradas)}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saídas</span>
                  <span className="font-semibold text-gray-700">{formatCurrency(metrics.saidas)}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  {/* Barra de Saída proporcional à Entrada */}
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${calculateProgress(metrics.saidas, metrics.entradas)}%` }} 
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

          {/* Card 2: Balanço por Categorias (NOVO) */}
          <Card className="shadow-md border-0 flex flex-col max-h-[500px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-700">Balanço por Categoria</CardTitle>
              <CardDescription>Entradas e saídas agrupadas</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-2">
              {categoryBalances.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados para exibir.</p>
              )}
              
              {categoryBalances.map((cat, idx) => (
                <div key={idx} className="space-y-2 border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-slate-700 truncate max-w-[150px]" title={cat.name}>
                      {cat.name}
                    </span>
                    <span className={`text-xs font-bold ${cat.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cat.saldo > 0 ? '+' : ''}{formatCurrency(cat.saldo)}
                    </span>
                  </div>

                  {/* Barra de Entradas da Categoria */}
                  {cat.entradas > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                       <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-green-500/80" style={{ width: '100%' }} />
                      </div>
                      <span className="text-gray-500 w-16 text-right">{formatCurrency(cat.entradas)}</span>
                    </div>
                  )}

                  {/* Barra de Saídas da Categoria */}
                  {cat.saidas > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden flex-1">
                        <div 
                          className="h-full bg-red-500/80" 
                          style={{ width: `${cat.entradas > 0 ? calculateProgress(cat.saidas, cat.entradas) : 100}%` }} 
                        />
                      </div>
                      <span className="text-gray-500 w-16 text-right">{formatCurrency(cat.saidas)}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA/CENTRAL: Gráficos Maiores*/}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico Fluxo Diário */}
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
                      labelFormatter={(label) => format(parseISO(label), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="receita" name="Receita" fill={COLORS.receita} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="despesa" name="Despesa" fill={COLORS.despesa} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos de Distribuição (Rosca) */}
          <Card className="shadow-md border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg text-slate-700">Distribuição (Pagos)</CardTitle>
                <CardDescription>Visão detalhada de valores efetivados</CardDescription>
              </div>
              <div className="w-[200px]">
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Agrupar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Por Categoria</SelectItem>
                    <SelectItem value="subcategory">Por Subcategoria</SelectItem>
                    <SelectItem value="account">Por Banco/Conta</SelectItem>
                    <SelectItem value="method">Por Método</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gráfico 1: Receitas */}
                <div className="flex flex-col items-center">
                  <h4 className="text-sm font-semibold text-green-600 mb-2">Receitas</h4>
                  <div className="h-[250px] w-full">
                    {donutReceitas.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutReceitas}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {donutReceitas.map((entry, index) => (
                              <Cell key={`cell-r-${index}`} fill={COLORS.chartPalette[index % COLORS.chartPalette.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        Sem receitas pagas
                      </div>
                    )}
                  </div>
                </div>

                {/* Gráfico 2: Despesas */}
                <div className="flex flex-col items-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">Despesas</h4>
                  <div className="h-[250px] w-full">
                    {donutDespesas.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutDespesas}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {donutDespesas.map((entry, index) => (
                              <Cell key={`cell-d-${index}`} fill={COLORS.chartPalette[index % COLORS.chartPalette.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        Sem despesas pagas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}