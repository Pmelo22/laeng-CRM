"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Wallet, TrendingUp, TrendingDown, LayoutDashboard, Table as TableIcon, BarChart3, CheckCircle2, Clock, Banknote } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/financial"
import type { Pagamentos, FinancialMetrics, Categories, Account } from "@/lib/types"
import { PagamentosTableFull } from "@/components/pagamento-table-full"


const PagamentosReportFull = ({ data }: { data: Pagamentos[] }) => (
  <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-lg min-h-[300px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
    <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
    <p>Mockup: Relatórios Gerenciais</p>
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

export default function PagamentoPageContent({ pagamentos, metrics, categories, accounts, userPermissions }: PagamentoPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  const filteredPagamentos = useMemo(() => {
    return pagamentos.filter(pg => {
      const term = searchTerm.toLowerCase()
      
      const matchesSearch = !searchTerm ||
        pg.description?.toLowerCase().includes(term) ||
        pg.cliente_nome?.toLowerCase().includes(term) ||
        pg.category_name?.toLowerCase().includes(term) ||
        pg.account_name?.toLowerCase().includes(term)

      const matchesType = typeFilter === 'all' || pg.type === typeFilter
      const matchesStatus = statusFilter === 'all' || pg.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [pagamentos, searchTerm, typeFilter, statusFilter])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-[#F5C800]" />
              GESTÃO DE PAGAMENTOS
            </h1>

            <div className="flex flex-col items-start sm:items-end">
               <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Saldo Realizado (Caixa)</span>
               <span className={`text-2xl sm:text-3xl font-bold ${metrics.saldoRealizado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 {formatCurrency(metrics.saldoRealizado)}
               </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            
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
            
             <span className="text-[#F5C800] hidden md:inline">•</span>

             <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
                {metrics.totalCount} lançamentos
             </span>

          </div>

          <div className="flex flex-col xl:flex-row gap-2 sm:gap-3 items-stretch">
            
            <div className="flex-1 relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#F5C800] transition-colors" />
              <Input
                placeholder="Buscar por descrição, cliente, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white border-[#F5C800]/30 text-gray-900 placeholder:text-gray-500 focus:border-[#F5C800] focus:ring-[#F5C800] focus:ring-2 rounded-lg shadow-sm transition-all text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full xl:w-auto">
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px] !h-10 sm:!h-12 px-3 bg-white border-[#F5C800]/30 rounded-lg shadow-sm hover:border-[#F5C800] transition-colors whitespace-nowrap font-semibold text-[#1E1E1E]">
                  <Filter className="h-4 w-4 mr-2 text-[#1E1E1E]" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tipos</SelectItem>
                  <SelectItem value="Receitas">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-green-500" /> Receitas
                    </div>
                  </SelectItem>
                  <SelectItem value="Despesas">
                     <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-red-400" /> Despesas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] !h-10 sm:!h-12 px-3 bg-white border-[#F5C800]/30 rounded-lg shadow-sm hover:border-[#F5C800] transition-colors whitespace-nowrap font-semibold text-[#1E1E1E]">
                  <Banknote className="h-4 w-4 mr-2 text-[#1E1E1E]" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="Pago">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-green-500" /> Pago
                    </div>
                  </SelectItem>
                  <SelectItem value="Não Pago">
                     <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-red-400" /> Pendente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 sm:col-span-1 sm:flex-1 xl:flex-none">
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                    <SelectTrigger className="w-full sm:w-[200px] !h-10 sm:!h-12 px-4 bg-[#F5C800] text-[#1E1E1E] border-[#F5C800] hover:bg-[#F5C800]/90 rounded-lg shadow-sm font-bold transition-colors">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="table">
                        <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        Tabela
                        </div>
                    </SelectItem>
                    <SelectItem value="report">
                        <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Relatórios
                        </div>
                    </SelectItem>
                    </SelectContent>
                </Select>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden min-h-[500px]">
         
          <CardContent className="p-0">
            {viewMode === 'table' ? (
              <PagamentosTableFull data={filteredPagamentos} userPermissions={userPermissions} categories={categories} accounts={accounts} />
            ) : (
              <PagamentosReportFull data={filteredPagamentos} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}