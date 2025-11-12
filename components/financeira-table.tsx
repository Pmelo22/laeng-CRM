"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { ObraFinanceiro } from "@/lib/types"

interface FinanceiraTableProps {
  obras: ObraFinanceiro[]
}

type SortField = 'codigo' | 'cliente_nome' | 'status' | 'valor_total' | 'total_medicoes_pagas' | 'saldo_pendente' | 'custo_total' | 'resultado' | 'percentual_pago'
type SortDirection = 'asc' | 'desc' | 'none'

export function FinanceiraTable({ obras }: FinanceiraTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('none')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection('none')
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1 text-[#F5C800]" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 ml-1 text-[#F5C800]" />
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
  }

  const sortedObras = useMemo(() => {
    if (!sortField || sortDirection === 'none') {
      return [...obras].sort((a, b) => (a.codigo || 0) - (b.codigo || 0))
    }

    return [...obras].sort((a, b) => {
      let aValue: string | number | null
      let bValue: string | number | null

      switch (sortField) {
        case 'codigo':
          aValue = a.codigo || 0
          bValue = b.codigo || 0
          break
        case 'cliente_nome':
          aValue = a.cliente_nome?.toLowerCase() || ''
          bValue = b.cliente_nome?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        case 'valor_total':
          aValue = a.valor_total || 0
          bValue = b.valor_total || 0
          break
        case 'total_medicoes_pagas':
          aValue = a.total_medicoes_pagas || 0
          bValue = b.total_medicoes_pagas || 0
          break
        case 'saldo_pendente':
          aValue = a.saldo_pendente || 0
          bValue = b.saldo_pendente || 0
          break
        case 'custo_total':
          aValue = a.custo_total || 0
          bValue = b.custo_total || 0
          break
        case 'resultado':
          aValue = a.resultado || 0
          bValue = b.resultado || 0
          break
        case 'percentual_pago':
          aValue = a.percentual_pago || 0
          bValue = b.percentual_pago || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [obras, sortField, sortDirection])

  const toggleRow = (obraId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(obraId)) {
        newSet.delete(obraId)
      } else {
        newSet.add(obraId)
      }
      return newSet
    })
  }

  // Cálculo de paginação
  const totalPages = Math.ceil(sortedObras.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedObras = sortedObras.slice(startIndex, endIndex)

  // Gerar números de página para exibição
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
      <div className="overflow-x-auto relative">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
            <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
              <TableHead 
                className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('codigo')}
              >
                <div className="flex items-center">
                  CÓD.
                  {getSortIcon('codigo')}
                </div>
              </TableHead>
              <TableHead 
                className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('cliente_nome')}
              >
                <div className="flex items-center">
                  CLIENTE
                  {getSortIcon('cliente_nome')}
                </div>
              </TableHead>
              <TableHead 
                className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  STATUS
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('valor_total')}
              >
                <div className="flex items-center">
                  VALOR TOTAL
                  {getSortIcon('valor_total')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('total_medicoes_pagas')}
              >
                <div className="flex items-center">
                  RECEBIDO
                  {getSortIcon('total_medicoes_pagas')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('saldo_pendente')}
              >
                <div className="flex items-center">
                  A RECEBER
                  {getSortIcon('saldo_pendente')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('custo_total')}
              >
                <div className="flex items-center">
                  CUSTOS
                  {getSortIcon('custo_total')}
                </div>
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('resultado')}
              >
                <div className="flex items-center">
                  RESULTADO
                  {getSortIcon('resultado')}
                </div>
              </TableHead>
              <TableHead 
                className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('percentual_pago')}
              >
                <div className="flex items-center justify-center">
                  PROGRESSO
                  {getSortIcon('percentual_pago')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedObras.length > 0 ? (
              paginatedObras.map((obra) => {
                const percentualRecebido = obra.percentual_pago || 0
                const resultado = obra.resultado || 0
                
                return (
                  <>
                    <TableRow key={obra.id} className="hover:bg-[#F5C800]/5 border-b">
                      {/* Código */}
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                          #{String(obra.codigo).padStart(3, '0')}
                        </Badge>
                      </TableCell>

                      {/* Cliente */}
                      <TableCell className="font-medium py-3">
                        <span className="font-semibold text-sm">{obra.cliente_nome}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            obra.status === 'EM ANDAMENTO'
                              ? 'bg-orange-100 text-orange-700 border-orange-200'
                              : obra.status === 'FINALIZADO'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }
                        >
                          {obra.status}
                        </Badge>
                      </TableCell>

                      {/* Valor Total */}
                      <TableCell className="py-3 text-left min-w-[140px]">
                        <span className="text-sm font-bold text-black">
                          {formatCurrency(obra.valor_total || 0)}
                        </span>
                      </TableCell>

                      {/* Recebido */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-green-600">{formatCurrency(obra.total_medicoes_pagas || 0)}</div>
                          <Button
                            size="sm"
                            onClick={() => toggleRow(obra.id)}
                            className="h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"
                            title={expandedRows.has(obra.id) ? "Recolher detalhes" : "Ver detalhes das medições"}
                          >
                            {expandedRows.has(obra.id) ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>

                      {/* A Receber */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(obra.saldo_pendente || 0)}
                        </span>
                      </TableCell>

                      {/* Custos */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(obra.custo_total || 0)}
                        </span>
                      </TableCell>

                      {/* Resultado */}
                      <TableCell className="py-3 text-left min-w-[140px]">
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold ${
                            resultado > 0 ? 'text-green-600' : resultado < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatCurrency(resultado)}
                          </span>
                          <span className={`text-xs font-bold ${
                            obra.margem_lucro > 0 ? 'text-green-600' : obra.margem_lucro < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {formatPercentage(obra.margem_lucro || 0)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Progresso */}
                      <TableCell className="py-3">
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
                          <span className="text-xs font-bold text-gray-600">
                            {formatPercentage(percentualRecebido)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Linha Expandida - Detalhamento de Medições */}
                    {expandedRows.has(obra.id) && (
                      <TableRow key={`${obra.id}-details`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-5 uppercase">
                              Detalhamento de Medições
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {/* Medição 01 */}
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 01</p>
                                <p className="text-base font-bold text-[#1E1E1E]">
                                  {formatCurrency(obra.medicao_01 || 0)}
                                </p>
                              </div>
                              
                              {/* Medição 02 */}
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 02</p>
                                <p className="text-base font-bold text-[#1E1E1E]">
                                  {formatCurrency(obra.medicao_02 || 0)}
                                </p>
                              </div>
                              
                              {/* Medição 03 */}
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 03</p>
                                <p className="text-base font-bold text-[#1E1E1E]">
                                  {formatCurrency(obra.medicao_03 || 0)}
                                </p>
                              </div>
                              
                              {/* Medição 04 */}
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 04</p>
                                <p className="text-base font-bold text-[#1E1E1E]">
                                  {formatCurrency(obra.medicao_04 || 0)}
                                </p>
                              </div>
                              
                              {/* Medição 05 */}
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 05</p>
                                <p className="text-base font-bold text-[#1E1E1E]">
                                  {formatCurrency(obra.medicao_05 || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="px-4 py-12 text-center">
                  <p className="text-gray-600 font-medium mb-2">Nenhuma obra encontrada</p>
                  <p className="text-sm text-gray-500">
                    Ajuste os filtros para ver mais resultados.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-semibold">
            Mostrando {startIndex + 1} - {Math.min(endIndex, sortedObras.length)} de {sortedObras.length} obras
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Obras por página:
            </span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px] h-9 border-[#F5C800]/30 focus:ring-[#F5C800] bg-background font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                <SelectItem value="20" className="cursor-pointer font-semibold">20</SelectItem>
                <SelectItem value="50" className="cursor-pointer font-semibold">50</SelectItem>
                <SelectItem value="100" className="cursor-pointer font-semibold">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navegação de páginas */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground font-semibold">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
                      : "border-[#F5C800]/30 hover:bg-[#F5C800]/10 font-semibold"
                  }
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
