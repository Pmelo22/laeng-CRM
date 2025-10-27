"use client"

import { useState, useMemo } from "react"
import type { Cliente } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, User, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClienteModal } from "@/components/cliente-modal"

interface ClientesTableProps {
  clientes: Cliente[]
  searchTerm?: string
}

type SortField = 'codigo' | 'nome' | 'status' | 'endereco' | 'data_cadastro'
type SortDirection = 'asc' | 'desc' | 'none'

export function ClientesTable({ clientes, searchTerm = "" }: ClientesTableProps) {
  const router = useRouter()
  
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('none')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined)

  // Filtrar clientes pela busca
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes
    
    const term = searchTerm.toLowerCase()
    return clientes.filter(cliente => 
      cliente.codigo?.toString().includes(term) ||
      cliente.nome?.toLowerCase().includes(term)
    )
  }, [clientes, searchTerm])

  // Função para alternar ordenação (3 estados: asc → desc → none)
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Mesmo campo: avançar estado
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection('none')
        setSortField(null) // Voltar ao padrão
      }
    } else {
      // Novo campo: começar com asc
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

  // Clientes ordenados
  const sortedClientes = useMemo(() => {
    if (!sortField || sortDirection === 'none') {
      // Padrão: ordem crescente por código
      return [...filteredClientes].sort((a, b) => (a.codigo || 0) - (b.codigo || 0))
    }

    return [...filteredClientes].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'codigo':
          aValue = a.codigo || 0
          bValue = b.codigo || 0
          break
        case 'nome':
          aValue = a.nome?.toLowerCase() || ''
          bValue = b.nome?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        case 'endereco':
          aValue = a.endereco?.toLowerCase() || ''
          bValue = b.endereco?.toLowerCase() || ''
          break
        case 'data_cadastro':
          aValue = a.data_cadastro || ''
          bValue = b.data_cadastro || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredClientes, sortField, sortDirection])

  // Calcular paginação
  const totalPages = Math.ceil(sortedClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClientes = sortedClientes.slice(startIndex, endIndex)

  // Resetar para página 1 quando mudar itens por página
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  // Gerar array de números de página para exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Mostrar todas as páginas se forem poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas com "..."
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

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCliente(undefined)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "FINALIZADO": { 
        color: "bg-green-500 text-white border-green-600 hover:bg-green-600", 
        icon: CheckCircle2,
        label: "Finalizado"
      },
      "EM ANDAMENTO": { 
        color: "bg-red-500 text-white border-red-600 hover:bg-red-600", 
        icon: Clock,
        label: "Em Andamento"
      },
      "PENDENTE": { 
        color: "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600", 
        icon: AlertCircle,
        label: "Pendente"
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["PENDENTE"]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.color} border font-medium px-2 py-0.5 transition-colors text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (clientes.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum cliente cadastrado ainda.</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
        <Table>
        <TableHeader>
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
                NOME
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
              className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
              onClick={() => handleSort('endereco')}
            >
              <div className="flex items-center">
                ENDEREÇO
                {getSortIcon('endereco')}
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
              onClick={() => handleSort('data_cadastro')}
            >
              <div className="flex items-center justify-center">
                DATA
                {getSortIcon('data_cadastro')}
              </div>
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3 bg-yellow-900/20">
              TERRENO (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3 bg-yellow-900/20">
              ENTRADA (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3 bg-yellow-900/20">
              VALOR FINANCIADO (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3 bg-yellow-900/20">
              SUBSÍDIO (R$)
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold py-3 bg-yellow-900/20">
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
                  {cliente.codigo || 0}
                </Badge>
              </TableCell>
              <TableCell className="font-medium py-3">
                <span className="font-semibold text-sm">{cliente.nome}</span>
              </TableCell>
              <TableCell className="py-3">
                {getStatusBadge(cliente.status || "PENDENTE")}
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm">{cliente.endereco || "-"}</span>
              </TableCell>
              <TableCell className="text-center py-3">
                <span className="text-sm">{formatDate(cliente.data_cadastro)}</span>
              </TableCell>
              <TableCell className="text-center py-3 bg-yellow-50 font-semibold">
                <span className="text-sm">{formatCurrency(cliente.valor_terreno || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 bg-yellow-50 font-semibold">
                <span className="text-sm">{formatCurrency(cliente.entrada || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 bg-yellow-50 font-semibold">
                <span className="text-sm">{formatCurrency(cliente.valor_financiado || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 bg-yellow-50 font-semibold">
                <span className="text-sm">{formatCurrency(cliente.subsidio || 0)}</span>
              </TableCell>
              <TableCell className="text-center py-3 bg-yellow-50 font-bold">
                <span className="text-sm text-green-700">{formatCurrency(cliente.valor_total || 0)}</span>
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleEdit(cliente)}
                    className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 h-9 w-9 p-0"
                    title="Editar Cliente"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Link href={`/dashboard/clientes/${cliente.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-[#F5C800] hover:bg-[#F5C800]/10 h-9 w-9 p-0"
                      title="Ver Perfil Completo"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, sortedClientes.length)} de {sortedClientes.length} clientes
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Clientes por página:
            </span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px] h-9 border-[#F5C800]/30 focus:ring-[#F5C800] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                <SelectItem value="20" className="cursor-pointer">20</SelectItem>
                <SelectItem value="50" className="cursor-pointer">50</SelectItem>
                <SelectItem value="100" className="cursor-pointer">100</SelectItem>
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
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
                      : "border-[#F5C800]/30 hover:bg-[#F5C800]/10"
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
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <ClienteModal 
        cliente={selectedCliente}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
