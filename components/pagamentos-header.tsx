"use client"

import { Input } from "@/components/ui/input"
import { Search, Filter, Wallet, TrendingUp, TrendingDown, LayoutDashboard, CheckCircle2, Clock, Banknote, Calendar, CreditCard, RotateCcw, Layers } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/pagamentos-financial"
import type { FinancialMetrics, PaymentFiltersState } from "@/lib/types"

const MONTHS = [
  { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" }, { value: "3", label: "Abril" },
  { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
  { value: "6", label: "Julho" }, { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" }, { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
]

export type ViewMode = 'table' | 'report'

interface PagamentosHeaderProps {
  metrics: FinancialMetrics
  searchTerm: string
  setSearchTerm: (term: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  filters: PaymentFiltersState
  updateFilter: (key: keyof PaymentFiltersState, value: string) => void
  clearFilters: () => void
  availableYears: number[]
  availableMonth: number[]
  availableWeeks: number[]
  categories: { label: string; value: string }[]
  subcategories: { label: string; value: string }[]
  accounts: { label: string; value: string }[]
}

export function PagamentosHeader({
  metrics,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  filters,
  updateFilter,
  clearFilters,
  availableYears,
  availableMonth,
  availableWeeks,
  categories,
  subcategories,
  accounts
}: PagamentosHeaderProps) {

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg sticky top-0 z-30">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        
        {/* Cabeçalho e Métricas (Sem alterações) */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <Wallet className="h-6 w-6 text-[#F5C800]" />
            Gestão de Pagamentos
          </h1>

          <div className="flex flex-col items-start sm:items-end">
             <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Saldo Realizado (Filtrado)</span>
             <span className={`text-2xl sm:text-3xl font-bold ${metrics.saldoRealizado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
               {formatCurrency(metrics.saldoRealizado)}
             </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
             <Badge variant="outline" className="border-0 bg-transparent text-green-500 hover:bg-transparent font-bold">
                <TrendingUp className="h-3 w-3 mr-1.5" /> Receitas
             </Badge>
             <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
             <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border-0 mr-1">
                <CheckCircle2 className="h-3 w-3 mr-1" /> {formatCurrency(metrics.recPaga)}
             </Badge>
             <Badge className="bg-green-900/20 text-green-600 hover:bg-green-900/30 border-dashed border-green-800 border">
                <Clock className="h-3 w-3 mr-1" /> {formatCurrency(metrics.recPendente)}
             </Badge>
          </div>

          <span className="text-[#F5C800] hidden md:inline">•</span>

          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
             <Badge variant="outline" className="border-0 bg-transparent text-red-500 hover:bg-transparent font-bold">
                <TrendingDown className="h-3 w-3 mr-1.5" /> Despesas
             </Badge>
             <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
             <Badge className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-0 mr-1">
                <CheckCircle2 className="h-3 w-3 mr-1" /> {formatCurrency(metrics.despPaga)}
             </Badge>
             <Badge className="bg-red-900/20 text-red-600 hover:bg-red-900/30 border-dashed border-red-800 border">
                <Clock className="h-3 w-3 mr-1" /> {formatCurrency(metrics.despPendente)}
             </Badge>
          </div>
           <span className="text-gray-500 text-xs font-medium whitespace-nowrap ml-auto sm:ml-2">
              {metrics.totalCount} lançamentos
           </span>
        </div>

        {/* --- ÁREA DE CONTROLES --- */}
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          
          {/* LINHA 1: Busca e Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
              {/* Busca ocupa todo o espaço disponível */}
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
                <Input
                    placeholder="Buscar por descrição, cliente, categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
                />
              </div>
              
              {/* Botões ficam à direita */}
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

          {/* LINHA 2: Grid de Filtros (Abaixo da busca) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
              
              <FilterSelect value={filters.type} onChange={(v: string) => updateFilter('type', v)} placeholder="Tipo" icon={Filter}>
                  <SelectItem value="all">Tipos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
              </FilterSelect>

              <FilterSelect value={filters.status} onChange={(v: string) => updateFilter('status', v)} placeholder="Status" icon={Banknote}>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="not_pago">Pendente</SelectItem>
              </FilterSelect>

              <FilterSelect value={filters.week} onChange={(v: string) => updateFilter('week', v)} placeholder="Semana" icon={Calendar}>
                  <SelectItem value="all">Semanas</SelectItem>
                  {availableWeeks.map(week => <SelectItem key={week} value={String(week)}>{week}ª Semana</SelectItem>)}
              </FilterSelect>

              <FilterSelect value={filters.month} onChange={(v: string) => updateFilter('month', v)} placeholder="Mês" icon={Calendar}>
                  <SelectItem value="all">  Meses</SelectItem>
                  {availableMonth.map(monthIndex => (<SelectItem key={monthIndex} value={String(monthIndex)}>{MONTHS[monthIndex]?.label || monthIndex} </SelectItem> ))}
              </FilterSelect>

              <FilterSelect value={filters.year} onChange={(v: string) => updateFilter('year', v)} placeholder="Ano" icon={Calendar}>
                  <SelectItem value="all">Ano</SelectItem>
                  {availableYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
              </FilterSelect>

               <FilterSelect value={filters.category} onChange={(v: string) => updateFilter('category', v)} placeholder="Categoria" icon={Layers}>
                  <SelectItem value="all">Categorias</SelectItem>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </FilterSelect>

              <FilterSelect value={filters.account} onChange={(v: string) => updateFilter('account', v)} placeholder="Banco" icon={Wallet}>
                  <SelectItem value="all">Bancos</SelectItem>
                  {accounts.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </FilterSelect>

              <FilterSelect value={filters.method} onChange={(v: string) => updateFilter('method', v)} placeholder="Método" icon={CreditCard}>
                  <SelectItem value="all">Métodos</SelectItem>
                  <SelectItem value="cartao_credito">Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Débito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Transferf.</SelectItem>
              </FilterSelect>

              <FilterSelect value={filters.installments} onChange={(v: string) => updateFilter('installments', v)} placeholder="Parc." icon={Layers}>
                  <SelectItem value="all">Parcelas</SelectItem>
                  <SelectItem value="single">À vista</SelectItem>
                  <SelectItem value="multi">Parcelado</SelectItem>
              </FilterSelect>

          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ value, onChange, placeholder, icon: Icon, children }: any) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-10 text-xs w-full px-2">
                 <div className="flex items-center truncate">
                    <Icon className="h-3 w-3 mr-2 text-[#F5C800] shrink-0" />
                    <span className="truncate block text-left">
                        <SelectValue placeholder={placeholder} />
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent>
                {children}
            </SelectContent>
        </Select>
    )
}