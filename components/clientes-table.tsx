"use client"

import { useState, useMemo } from "react"
import type { Cliente } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ClienteEditModal } from "@/components/cliente-edit-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getClienteStatusBadge } from "@/lib/status-utils"
import { useSortTable, usePagination, SortableTableHead } from "@/lib/table-utils"

interface ClientesTableProps {
  clientes: Cliente[]
  searchTerm?: string
}

type SortField = 'codigo' | 'nome' | 'status' | 'endereco' | 'data_contrato'

export function ClientesTable({ clientes, searchTerm = "" }: ClientesTableProps) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedCliente(null)
  }

  // Filtrar clientes pela busca
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes
    
    const term = searchTerm.toLowerCase().replace('#', '')
    return clientes.filter(cliente => {
      const codigoFormatado = String(cliente.codigo || 0).padStart(3, '0')
      return codigoFormatado.includes(term) ||
        cliente.codigo?.toString().includes(term) ||
        cliente.nome?.toLowerCase().includes(term)
    })
  }, [clientes, searchTerm])

  // Hooks centralizados
  const { handleSort, getSortIcon, sortedData: sortedClientes } = useSortTable<Cliente>(filteredClientes)
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, startIndex, endIndex, paginatedData: paginatedClientes, handleItemsPerPageChange, getPageNumbers } = usePagination(sortedClientes, 20)

  if (clientes.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum cliente cadastrado ainda.</div>
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
              onClick={() => handleSort('nome')}
            >
              <div className="flex items-center">
                CLIENTE
                {getSortIcon('nome')}
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
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
              onClick={() => handleSort('data_contrato')}
            >
              <div className="flex items-center justify-center">
                DATA
                {getSortIcon('data_contrato')}
              </div>
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3">
              TERRENO (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3">
              ENTRADA (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3">
              VALOR FINANCIADO (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3">
              SUBSÍDIO (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3">
              VALOR TOTAL (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClientes.map((cliente) => (
            <TableRow key={cliente.id} className="hover:bg-[#F5C800]/5 border-b">
              <TableCell className="py-3">
                <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                  #{String(cliente.codigo || 0).padStart(3, '0')}
                </Badge>
              </TableCell>
              <TableCell className="font-medium py-3">
                <span className="font-semibold text-sm">{cliente.nome}</span>
              </TableCell>
              <TableCell className="py-3">
                {getClienteStatusBadge(cliente.status || "PENDENTE")}
              </TableCell>
              <TableCell className="text-center py-3">
                <span className="text-sm">{formatDate(cliente.data_contrato)}</span>
              </TableCell>
              <TableCell className="text-center py-3 font-bold">
                <span className="text-sm text-black font-bold">{formatCurrency(cliente.valor_terreno || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 font-bold">
                <span className="text-sm text-black font-bold">{formatCurrency(cliente.entrada || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 font-bold">
                <span className="text-sm text-black font-bold">{formatCurrency(cliente.valor_financiado || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 font-bold">
                <span className="text-sm text-black font-bold">{formatCurrency(cliente.subsidio || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 font-bold">
                <span className="text-sm text-green-700 font-bold">{formatCurrency(cliente.valor_total || 0)}</span>
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditCliente(cliente)}
                    className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                    title="Editar Cliente"
                  >
                    <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/clientes/${cliente.id}`)}
                    className="border-2 border-gray-300 hover:border-[#F5C800] hover:bg-[#F5C800]/10 h-9 w-9 p-0 transition-colors"
                    title="Ver Perfil"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-semibold">
            Mostrando {startIndex + 1} - {Math.min(endIndex, sortedClientes.length)} de {sortedClientes.length} clientes
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Clientes por página:
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

      {/* Modal de Edição */}
      <ClienteEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        cliente={selectedCliente || undefined}
      />
    </div>
  )
}
