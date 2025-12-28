"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Wallet, TrendingUp, TrendingDown, LayoutDashboard, Table as TableIcon, BarChart3, CheckCircle2, Clock, Banknote, Calendar, CreditCard, RotateCcw, Layers } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, calculateFinancialMetrics } from "@/lib/financial"
import type { Pagamentos, FinancialMetrics } from "@/lib/types"
import { PagamentosTableFull } from "@/components/pagamento-table-full"
import { getMonth, getYear, parseISO } from "date-fns"

const PagamentosReportFull = ({ data }: { data: Pagamentos[] }) => (
  <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-lg min-h-[300px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
    <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
    <p>Relatórios Gerenciais ({data.length} registros filtrados)</p>
  </div>
)

interface PagamentoPageContentProps {
  pagamentos: Pagamentos[]
  categories: { label: string; value: string }[]
  accounts: { label: string; value: string }[]
  metrics: FinancialMetrics 
  userPermissions: Record<string, any>
}

type ViewMode = 'table' | 'report'

const MONTHS = [
  { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" }, { value: "3", label: "Abril" },
  { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
  { value: "6", label: "Julho" }, { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" }, { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
]

export default function PagamentoPageContent({ pagamentos, categories, accounts, userPermissions }: PagamentoPageContentProps) {
  
  // --- Estados de Filtro ---
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    category: "all",
    account: "all",
    method: "all",
    installments: "all", // all, single, multi
    month: "all",
    year: "all"
  })

  // Extrair anos únicos disponíveis nos dados para o filtro
  const availableYears = useMemo(() => {
    const years = new Set(pagamentos.map(p => p.date ? getYear(parseISO(p.date)) : new Date().getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }, [pagamentos])

  // --- Lógica de Filtragem ---
  const filteredPagamentos = useMemo(() => {
    return pagamentos.filter(pg => {
      // 1. Busca textual
      const term = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        pg.description?.toLowerCase().includes(term) ||
        pg.category_name?.toLowerCase().includes(term) ||
        pg.account_name?.toLowerCase().includes(term)

      // 2. Filtros Diretos
      if (filters.type !== 'all' && pg.type !== filters.type) return false
      if (filters.status !== 'all' && pg.status !== filters.status) return false
      if (filters.category !== 'all' && String(pg.category_id) !== filters.category) return false
      if (filters.account !== 'all' && String(pg.account_id) !== filters.account) return false
      if (filters.method !== 'all' && pg.method !== filters.method) return false

      // 3. Filtro de Parcelas
      if (filters.installments === 'single' && (pg.installments_total && pg.installments_total > 1)) return false
      if (filters.installments === 'multi' && (!pg.installments_total || pg.installments_total <= 1)) return false

      // 4. Filtro de Data (Mês/Ano)
      if (pg.date) {
        const dateObj = parseISO(pg.date)
        if (filters.year !== 'all' && getYear(dateObj) !== parseInt(filters.year)) return false
        if (filters.month !== 'all' && getMonth(dateObj) !== parseInt(filters.month)) return false
      } else if (filters.year !== 'all' || filters.month !== 'all') {
        // Se tem filtro de data mas o registro não tem data, exclui
        return false
      }

      return matchesSearch
    })
  }, [pagamentos, searchTerm, filters])

  // --- Recalcular Métricas com base nos filtros ---
  const currentMetrics = useMemo(() => {
    return calculateFinancialMetrics(filteredPagamentos)
  }, [filteredPagamentos])

  // Função helper para atualizar filtros
  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: "all", status: "all", category: "all", account: "all",
      method: "all", installments: "all", month: "all", year: "all"
    })
    setSearchTerm("")
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg sticky top-0 z-30">
        <div className="px-3 sm:px-6 lg:px-8 py-4">
          
          {/* Header & Saldo */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
              <Wallet className="h-6 w-6 text-[#F5C800]" />
              Gestão de Pagamentos
            </h1>

            <div className="flex flex-col items-start sm:items-end">
               <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Saldo Realizado (Filtrado)</span>
               <span className={`text-2xl sm:text-3xl font-bold ${currentMetrics.saldoRealizado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 {formatCurrency(currentMetrics.saldoRealizado)}
               </span>
            </div>
          </div>

          {/* Cards de Métricas (Responsivo ao Filtro) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
               <Badge variant="outline" className="border-0 bg-transparent text-green-500 hover:bg-transparent font-bold">
                  <TrendingUp className="h-3 w-3 mr-1.5" /> Receitas
               </Badge>
               <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
               <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border-0 mr-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {formatCurrency(currentMetrics.recPaga)}
               </Badge>
               <Badge className="bg-green-900/20 text-green-600 hover:bg-green-900/30 border-dashed border-green-800 border">
                  <Clock className="h-3 w-3 mr-1" /> {formatCurrency(currentMetrics.recPendente)}
               </Badge>
            </div>

            <span className="text-[#F5C800] hidden md:inline">•</span>

            <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
               <Badge variant="outline" className="border-0 bg-transparent text-red-500 hover:bg-transparent font-bold">
                  <TrendingDown className="h-3 w-3 mr-1.5" /> Despesas
               </Badge>
               <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
               <Badge className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-0 mr-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {formatCurrency(currentMetrics.despPaga)}
               </Badge>
               <Badge className="bg-red-900/20 text-red-600 hover:bg-red-900/30 border-dashed border-red-800 border">
                  <Clock className="h-3 w-3 mr-1" /> {formatCurrency(currentMetrics.despPendente)}
               </Badge>
            </div>
            
             <span className="text-gray-500 text-xs font-medium whitespace-nowrap ml-auto sm:ml-2">
                {currentMetrics.totalCount} lançamentos
             </span>
          </div>

          {/* Área de Filtros Expandida */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
            
            {/* Linha 1: Busca e Visualização */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
                <Input
                    placeholder="Buscar por descrição, cliente, categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm"
                />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                        <SelectTrigger className="w-full sm:w-[140px] h-10 bg-[#F5C800] text-[#1E1E1E] border-0 font-bold">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="table">Tabela</SelectItem>
                        <SelectItem value="report">Relatórios</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {activeFiltersCount > 0 && (
                        <Button variant="destructive" onClick={clearFilters} size="icon" className="h-10 w-10 shrink-0" title="Limpar Filtros">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Linha 2: Grid de Filtros */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                
                {/* 1. Tipo */}
                <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Filter className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Tipos</SelectItem>
                        <SelectItem value="receita">Receitas</SelectItem>
                        <SelectItem value="despesa">Despesas</SelectItem>
                    </SelectContent>
                </Select>

                {/* 2. Status */}
                <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Banknote className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="not_pago">Pendente</SelectItem>
                    </SelectContent>
                </Select>

                {/* 3. Mês */}
                <Select value={filters.month} onValueChange={(v) => updateFilter('month', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Calendar className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo Ano</SelectItem>
                        {MONTHS.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 4. Ano */}
                <Select value={filters.year} onValueChange={(v) => updateFilter('year', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Calendar className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Histórico</SelectItem>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                 {/* 5. Categoria */}
                 <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Layers className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas Cats.</SelectItem>
                        {categories.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 6. Banco */}
                <Select value={filters.account} onValueChange={(v) => updateFilter('account', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Wallet className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Banco" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Bancos</SelectItem>
                        {accounts.map(a => (
                            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 7. Método */}
                <Select value={filters.method} onValueChange={(v) => updateFilter('method', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <CreditCard className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Método" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Mét.</SelectItem>
                        <SelectItem value="cartao_credito">Crédito</SelectItem>
                        <SelectItem value="cartao_debito">Débito</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                </Select>

                {/* 8. Parcelas */}
                <Select value={filters.installments} onValueChange={(v) => updateFilter('installments', v)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-9 text-xs">
                        <Layers className="h-3 w-3 mr-2 text-[#F5C800]" />
                        <SelectValue placeholder="Parcelas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas Parc.</SelectItem>
                        <SelectItem value="single">Única (À vista)</SelectItem>
                        <SelectItem value="multi">Parcelado (+1)</SelectItem>
                    </SelectContent>
                </Select>

            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden min-h-[500px]">
          <CardContent className="p-0">
            {viewMode === 'table' ? (
              <PagamentosTableFull 
                data={filteredPagamentos} 
                userPermissions={userPermissions} 
                categories={categories} 
                accounts={accounts} 
              />
            ) : (
              <PagamentosReportFull data={filteredPagamentos} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}