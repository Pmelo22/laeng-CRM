"use client"

import { useState, useMemo, Fragment } from "react"
import type { ObraComCliente } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Pencil, ChevronUp, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ObraEditModal } from "@/components/obra-edit-modal"
import { formatCurrency } from "@/lib/utils"
import { getObraStatusBadge } from "@/lib/status-utils"

interface ObrasTableFullProps {
  obras: ObraComCliente[]
  highlightId?: string | null
}

type SortField = 'codigo' | 'cliente_nome' | 'status' | 'empreiteiro' | 'material' | 'terceirizado' | 'valor_total'
type SortDirection = 'asc' | 'desc' | 'none'

export function ObrasTableFull({ obras, highlightId }: ObrasTableFullProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('none')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedObra, setSelectedObra] = useState<ObraComCliente | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedEmpreiteiro, setExpandedEmpreiteiro] = useState<Set<string>>(new Set())

  const handleEditObra = (obra: ObraComCliente) => {
    setSelectedObra(obra)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedObra(null)
  }

  const toggleRowExpansion = (obraId: string) => {
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

  const toggleEmpreiteiroExpansion = (obraId: string) => {
    setExpandedEmpreiteiro(prev => {
      const newSet = new Set(prev)
      if (newSet.has(obraId)) {
        newSet.delete(obraId)
      } else {
        newSet.add(obraId)
      }
      return newSet
    })
  }

  // Função para alternar ordenação
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

  // Renderizar ícone de ordenação
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

  // Obras ordenadas
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
        case 'empreiteiro':
          aValue = a.empreiteiro || 0
          bValue = b.empreiteiro || 0
          break
        case 'material':
          aValue = a.material || 0
          bValue = b.material || 0
          break
        case 'terceirizado':
          // Calcular total terceirizado para ordenação
          aValue = (a.terceirizado || 0) + (a.pintor || 0) + (a.eletricista || 0) + (a.gesseiro || 0) + (a.azulejista || 0) + (a.manutencao || 0)
          bValue = (b.terceirizado || 0) + (b.pintor || 0) + (b.eletricista || 0) + (b.gesseiro || 0) + (b.azulejista || 0) + (b.manutencao || 0)
          break
        case 'valor_total':
          aValue = a.valor_total || 0
          bValue = b.valor_total || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [obras, sortField, sortDirection])

  // Calcular paginação
  const totalPages = Math.ceil(sortedObras.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedObras = sortedObras.slice(startIndex, endIndex)

  // Resetar para página 1 quando mudar itens por página
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  // Gerar números de página
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (obras.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma obra cadastrada ainda.</div>
  }

  return (
    <div className="space-y-4">
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
                  className="text-center text-[#F5C800] font-bold py-3 cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
                  onClick={() => handleSort('empreiteiro')}
                >
                  <div className="flex items-center justify-center">
                    EMPREITEIRO
                    {getSortIcon('empreiteiro')}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center text-[#F5C800] font-bold py-3 cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
                  onClick={() => handleSort('material')}
                >
                  <div className="flex items-center justify-center">
                    MATERIAL (R$)
                    {getSortIcon('material')}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center text-[#F5C800] font-bold py-3 cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
                  onClick={() => handleSort('terceirizado')}
                >
                  <div className="flex items-center justify-center">
                    TERCEIRIZADO (R$)
                    {getSortIcon('terceirizado')}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center text-[#F5C800] font-bold py-3 cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
                  onClick={() => handleSort('valor_total')}
                >
                  <div className="flex items-center justify-center">
                    VALOR TOTAL DA OBRA (R$)
                    {getSortIcon('valor_total')}
                  </div>
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedObras.map((obra) => {
                const isExpanded = expandedRows.has(obra.id)
                const isEmpreiteiroExpanded = expandedEmpreiteiro.has(obra.id)
                // Total Terceirizado = terceirizado base + especialistas (SEM mão de obra, que é o empreiteiro)
                const totalTerceirizado = (obra.terceirizado || 0) + (obra.pintor || 0) + (obra.eletricista || 0) + (obra.gesseiro || 0) + (obra.azulejista || 0) + (obra.manutencao || 0)
                
                // Calcular dados do empreiteiro (mão de obra = empreiteiro)
                const valorEmpreiteiro = obra.empreiteiro || 0
                const valorPago = obra.empreiteiro_valor_pago || 0
                const saldo = valorEmpreiteiro - valorPago
                const percentualPago = valorEmpreiteiro > 0 ? (valorPago / valorEmpreiteiro) * 100 : 0
                
                // Valor total da obra = Empreiteiro + Material + Terceirizado
                const valorTotalObra = valorEmpreiteiro + (obra.material || 0) + totalTerceirizado
                
                const isHighlighted = highlightId === obra.id
                
                return (
                  <Fragment key={obra.id}>
                    <TableRow 
                      id={`obra-${obra.id}`}
                      className={`hover:bg-[#F5C800]/5 border-b transition-all duration-300 ${isHighlighted ? 'bg-[#F5C800]/20' : ''}`}
                    >
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                          #{String(obra.codigo || 0).padStart(3, '0')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium py-3">
                        <span className="font-semibold text-sm">{obra.cliente_nome}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        {getObraStatusBadge(obra.status)}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="min-w-[120px] text-left">
                            <div className="text-sm font-semibold">{obra.empreiteiro_nome || 'SEM EMPREITEIRO'}</div>
                            <div className="text-xs font-bold text-black">{formatCurrency(valorEmpreiteiro)}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => toggleEmpreiteiroExpansion(obra.id)}
                            className="h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"
                            title={isEmpreiteiroExpanded ? "Recolher demonstrativo" : "Ver demonstrativo financeiro"}
                          >
                            {isEmpreiteiroExpanded ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 font-bold">
                        <span className="text-sm text-black">{formatCurrency(obra.material || 0)}</span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-bold text-black min-w-[120px]">{formatCurrency(totalTerceirizado)}</span>
                          <Button
                            size="sm"
                            onClick={() => toggleRowExpansion(obra.id)}
                            className="h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"
                            title={isExpanded ? "Recolher detalhes" : "Ver detalhes dos terceirizados"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 font-bold">
                        <span className="text-sm text-green-700">{formatCurrency(valorTotalObra)}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditObra(obra)}
                            className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                            title="Editar Obra"
                          >
                            <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/clientes/${obra.cliente_id}`)}
                            className="border-2 border-gray-300 hover:border-[#F5C800] hover:bg-[#F5C800]/10 h-9 w-9 p-0 transition-colors"
                            title="Ver Cliente"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow key={`${obra.id}-details`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={8} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-5 uppercase">
                              Detalhamento dos Custos Terceirizados
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">Pintor</p>
                                <p className="text-base font-bold text-[#1E1E1E]">{formatCurrency(obra.pintor || 0)}</p>
                              </div>
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">Eletricista</p>
                                <p className="text-base font-bold text-[#1E1E1E]">{formatCurrency(obra.eletricista || 0)}</p>
                              </div>
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">Gesseiro</p>
                                <p className="text-base font-bold text-[#1E1E1E]">{formatCurrency(obra.gesseiro || 0)}</p>
                              </div>
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">Azulejista</p>
                                <p className="text-base font-bold text-[#1E1E1E]">{formatCurrency(obra.azulejista || 0)}</p>
                              </div>
                              <div className="bg-[#F5C800] rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">Manutenção</p>
                                <p className="text-base font-bold text-[#1E1E1E]">{formatCurrency(obra.manutencao || 0)}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {isEmpreiteiroExpanded && (
                      <TableRow key={`${obra.id}-empreiteiro`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={8} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-6 uppercase">
                              Demonstrativo Financeiro do Empreiteiro
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Tabela de dados */}
                              <div className="bg-yellow-50 rounded-lg p-4 border border-gray-200">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-[#1E1E1E] text-[#F5C800]">
                                      <th className="text-left py-2 px-3 text-sm font-bold uppercase">Item</th>
                                      <th className="text-right py-2 px-3 text-sm font-bold uppercase">Valor</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Empreiteiro</td>
                                      <td className="py-3 px-3 text-sm font-semibold text-right">{obra.responsavel || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Valor da Empreitada</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-[#1E1E1E]">{formatCurrency(valorEmpreiteiro)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Valor Pago</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-green-700">{formatCurrency(valorPago)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Saldo</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-red-700">{formatCurrency(saldo)}</td>
                                    </tr>
                                    <tr className="bg-[#F5C800]">
                                      <td className="py-3 px-3 text-sm font-bold text-[#1E1E1E] uppercase">Percentual Pago</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-[#1E1E1E]">{percentualPago.toFixed(2)}%</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* Gráfico Pizza */}
                              <div className="flex flex-col items-center justify-center bg-yellow-50 rounded-lg p-4 border border-gray-200">
                                <h5 className="text-sm font-bold text-[#1E1E1E] mb-4 uppercase">Status do Pagamento</h5>
                                <div className="relative w-48 h-48">
                                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {/* Círculo de fundo (saldo) */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke="#e5e7eb"
                                      strokeWidth="20"
                                    />
                                    {/* Círculo de progresso (pago) */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke="#F5C800"
                                      strokeWidth="20"
                                      strokeDasharray={`${percentualPago * 2.51327} 251.327`}
                                      className="transition-all duration-500"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-[#F5C800]">{percentualPago.toFixed(0)}%</span>
                                    <span className="text-xs text-gray-600 mt-1 uppercase">Pago</span>
                                  </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#F5C800] rounded"></div>
                                    <span className="text-xs font-medium text-gray-700">Pago: {formatCurrency(valorPago)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                    <span className="text-xs font-medium text-gray-700">Saldo: {formatCurrency(saldo)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
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

      <ObraEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        obra={selectedObra || undefined}
      />
    </div>
  )
}
