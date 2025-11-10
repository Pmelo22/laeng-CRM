"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react"
import type { DashboardFinanceiro, ObraFinanceiro } from "@/lib/types"

interface FinanceiraPageContentProps {
  dashboard: DashboardFinanceiro
  obras: ObraFinanceiro[]
}

export default function FinanceiraPageContent({ obras }: FinanceiraPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Filtrar apenas obras EM ANDAMENTO e PENDENTE
  const obrasAtivas = obras.filter(o => 
    o.status === 'EM ANDAMENTO' || o.status === 'PENDENTE'
  )

  // Calcular métricas das obras ativas
  const metrics = useMemo(() => {
    const emAndamento = obrasAtivas.filter(o => o.status === 'EM ANDAMENTO').length
    const pendentes = obrasAtivas.filter(o => o.status === 'PENDENTE').length
    const receitaPrevista = obrasAtivas.reduce((sum, o) => sum + (o.valor_total || 0), 0)
    const custoAcumulado = obrasAtivas.reduce((sum, o) => sum + (o.custo_total || 0), 0)
    const saldoReceber = obrasAtivas.reduce((sum, o) => sum + (o.saldo_pendente || 0), 0)
    const recebido = obrasAtivas.reduce((sum, o) => sum + (o.total_medicoes_pagas || 0), 0)
    
    return {
      total: obrasAtivas.length,
      emAndamento,
      pendentes,
      receitaPrevista,
      custoAcumulado,
      saldoReceber,
      recebido,
      resultadoPrevisto: receitaPrevista - custoAcumulado
    }
  }, [obrasAtivas])

  // Filtrar obras para exibição
  const filteredObras = useMemo(() => {
    return obrasAtivas.filter(obra => {
      const term = searchTerm.toLowerCase().replace('#', '')
      const codigoFormatado = String(obra.codigo || 0).padStart(3, '0')
      
      const matchesSearch = !searchTerm || 
        obra.cliente_nome?.toLowerCase().includes(term) ||
        codigoFormatado.includes(term) ||
        obra.codigo?.toString().includes(term)
      
      const matchesStatus = statusFilter === 'all' || obra.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [obrasAtivas, searchTerm, statusFilter])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header com cores do sistema */}
      <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Título e métricas */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight uppercase">
              CONTROLE FINANCEIRO
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="bg-[#F5C800] text-[#1E1E1E] border-[#F5C800] hover:bg-[#F5C800]/90 px-3 py-1.5 font-bold text-sm">
                <Wallet className="h-4 w-4 mr-1.5" />
                <span>{metrics.total}</span>
                <span className="ml-1.5">Obras Ativas</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-red-600 text-white border-red-600 hover:bg-red-700 px-3 py-1.5 font-semibold text-sm">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>{metrics.emAndamento}</span>
                <span className="ml-1.5">Em Andamento</span>
              </Badge>
              <span className="text-[#F5C800] hidden sm:inline">•</span>
              <Badge variant="secondary" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 px-3 py-1.5 font-semibold text-sm">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                <span>{metrics.pendentes}</span>
                <span className="ml-1.5">Pendentes</span>
              </Badge>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#F5C800] transition-colors" />
              <Input
                placeholder="Buscar por cliente, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white border-[#F5C800]/30 text-gray-900 placeholder:text-gray-500 focus:border-[#F5C800] focus:ring-[#F5C800] focus:ring-2 rounded-lg shadow-sm transition-all text-sm sm:text-base"
              />
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:!w-[250px] !h-10 sm:!h-12 px-4 sm:px-6 bg-white border-[#F5C800]/30 rounded-lg shadow-sm hover:border-[#F5C800] transition-colors whitespace-nowrap font-semibold text-[#1E1E1E] text-sm sm:text-base">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#1E1E1E]" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="EM ANDAMENTO">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-600" />
                      Em Andamento
                    </div>
                  </SelectItem>
                  <SelectItem value="PENDENTE">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                      Pendente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Financeiro - Estilo Mobills */}
      <div className="px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* A Receber */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-8 w-8 opacity-80" />
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">A RECEBER</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.saldoReceber)}</p>
              <p className="text-xs opacity-75 mt-2">Saldo pendente de obras ativas</p>
            </CardContent>
          </Card>

          {/* Recebido */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-8 w-8 opacity-80" />
                <DollarSign className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">RECEBIDO</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.recebido)}</p>
              <p className="text-xs opacity-75 mt-2">Total de medições pagas</p>
            </CardContent>
          </Card>

          {/* Custos */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="h-8 w-8 opacity-80" />
                <AlertCircle className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">CUSTOS</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.custoAcumulado)}</p>
              <p className="text-xs opacity-75 mt-2">Total gasto nas obras</p>
            </CardContent>
          </Card>

          {/* Resultado Previsto */}
          <Card className={`border-0 shadow-lg text-white overflow-hidden ${
            metrics.resultadoPrevisto >= 0 
              ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="h-8 w-8 opacity-80" />
                {metrics.resultadoPrevisto >= 0 ? (
                  <TrendingUp className="h-5 w-5 opacity-60" />
                ) : (
                  <TrendingDown className="h-5 w-5 opacity-60" />
                )}
              </div>
              <p className="text-sm opacity-90 mb-1">RESULTADO PREVISTO</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.resultadoPrevisto)}</p>
              <p className="text-xs opacity-75 mt-2">
                {metrics.resultadoPrevisto >= 0 ? 'Lucro esperado' : 'Prejuízo previsto'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Obras - Estilo Mobills com informações detalhadas */}
        <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Obra
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Recebido
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      A Receber
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Custos
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Progresso
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredObras.length > 0 ? (
                    filteredObras.map((obra) => {
                      const percentualRecebido = obra.percentual_pago || 0
                      const resultado = obra.resultado || 0
                      
                      return (
                        <tr key={obra.id} className="hover:bg-gray-50 transition-colors">
                          {/* Obra */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">
                                #{String(obra.codigo).padStart(3, '0')}
                              </span>
                              <span className="text-sm text-gray-600">
                                {obra.cliente_nome}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <Badge
                              variant="secondary"
                              className={
                                obra.status === 'EM ANDAMENTO'
                                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }
                            >
                              {obra.status}
                            </Badge>
                          </td>

                          {/* Valor Total */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(obra.valor_total || 0)}
                            </span>
                          </td>

                          {/* Recebido */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-green-600">
                                {formatCurrency(obra.total_medicoes_pagas || 0)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatPercentage(percentualRecebido)} pago
                              </span>
                            </div>
                          </td>

                          {/* A Receber */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-bold text-blue-600">
                              {formatCurrency(obra.saldo_pendente || 0)}
                            </span>
                          </td>

                          {/* Custos */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-semibold text-red-600">
                              {formatCurrency(obra.custo_total || 0)}
                            </span>
                          </td>

                          {/* Resultado */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-bold ${
                                resultado > 0 ? 'text-green-600' : resultado < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {formatCurrency(resultado)}
                              </span>
                              <span className={`text-xs ${
                                obra.margem_lucro > 0 ? 'text-green-600' : obra.margem_lucro < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {formatPercentage(obra.margem_lucro || 0)}
                              </span>
                            </div>
                          </td>

                          {/* Progresso */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    percentualRecebido === 100
                                      ? 'bg-green-500'
                                      : percentualRecebido >= 50
                                      ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${Math.min(percentualRecebido, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 font-medium">
                                {formatPercentage(percentualRecebido)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 font-medium mb-2">Nenhuma obra ativa encontrada</p>
                        <p className="text-sm text-gray-500">
                          Todas as obras foram finalizadas ou não há obras cadastradas.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Resumo inferior - Estilo Mobills */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Receita Prevista Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.receitaPrevista)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total a Receber</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.saldoReceber)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Margem de Lucro Média</p>
                  <p className={`text-2xl font-bold ${
                    metrics.resultadoPrevisto >= 0 ? 'text-purple-600' : 'text-orange-600'
                  }`}>
                    {metrics.receitaPrevista > 0 
                      ? formatPercentage((metrics.resultadoPrevisto / metrics.receitaPrevista) * 100)
                      : '0%'
                    }
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  metrics.resultadoPrevisto >= 0 ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <Wallet className={`h-6 w-6 ${
                    metrics.resultadoPrevisto >= 0 ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}