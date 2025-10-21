"use client"

import { useState, useMemo } from "react"
import type { Cliente, ClienteComResumo } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Building2, CheckCircle2, Clock, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClientesTableProps {
  clientes: (Cliente | ClienteComResumo)[]
}

type SortField = 'codigo' | 'nome' | 'responsavel_contato' | 'cidade' | 'total_obras' | 'status' | 'valor_total_obras' | 'total_pago' | 'saldo_pendente'
type SortDirection = 'asc' | 'desc' | 'none'

function isClienteComResumo(cliente: Cliente | ClienteComResumo): cliente is ClienteComResumo {
  return 'total_obras' in cliente
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('none')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

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
      return [...clientes].sort((a, b) => (a.codigo || 0) - (b.codigo || 0))
    }

    return [...clientes].sort((a, b) => {
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
        case 'responsavel_contato':
          aValue = a.responsavel_contato?.toLowerCase() || ''
          bValue = b.responsavel_contato?.toLowerCase() || ''
          break
        case 'cidade':
          aValue = (a.cidade || a.endereco || '').toLowerCase()
          bValue = (b.cidade || b.endereco || '').toLowerCase()
          break
        case 'total_obras':
          aValue = isClienteComResumo(a) ? a.total_obras : 0
          bValue = isClienteComResumo(b) ? b.total_obras : 0
          break
        case 'status':
          // Ordenar por obras finalizadas vs em andamento
          aValue = isClienteComResumo(a) ? a.obras_finalizadas : 0
          bValue = isClienteComResumo(b) ? b.obras_finalizadas : 0
          break
        case 'valor_total_obras':
          aValue = isClienteComResumo(a) ? a.valor_total_obras : 0
          bValue = isClienteComResumo(b) ? b.valor_total_obras : 0
          break
        case 'total_pago':
          aValue = isClienteComResumo(a) ? a.total_pago : 0
          bValue = isClienteComResumo(b) ? b.total_pago : 0
          break
        case 'saldo_pendente':
          aValue = isClienteComResumo(a) ? a.saldo_pendente : 0
          bValue = isClienteComResumo(b) ? b.saldo_pendente : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [clientes, sortField, sortDirection])

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

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente? Todas as obras vinculadas também serão excluídas.")) return

    const { error } = await supabase.from("clientes").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir cliente: " + error.message)
    } else {
      router.refresh()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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
              className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('codigo')}
            >
              <div className="flex items-center">
                Código
                {getSortIcon('codigo')}
              </div>
            </TableHead>
            <TableHead 
              className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('nome')}
            >
              <div className="flex items-center">
                Nome
                {getSortIcon('nome')}
              </div>
            </TableHead>
            <TableHead 
              className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('responsavel_contato')}
            >
              <div className="flex items-center">
                Responsável
                {getSortIcon('responsavel_contato')}
              </div>
            </TableHead>
            <TableHead 
              className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('cidade')}
            >
              <div className="flex items-center">
                Cidade
                {getSortIcon('cidade')}
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('total_obras')}
            >
              <div className="flex items-center justify-center">
                Obras
                {getSortIcon('total_obras')}
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center justify-center">
                Status
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('valor_total_obras')}
            >
              <div className="flex items-center justify-center">
                Faturamento
                {getSortIcon('valor_total_obras')}
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('total_pago')}
            >
              <div className="flex items-center justify-center">
                Pago
                {getSortIcon('total_pago')}
              </div>
            </TableHead>
            <TableHead 
              className="text-center text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors" 
              onClick={() => handleSort('saldo_pendente')}
            >
              <div className="flex items-center justify-center">
                Pendente
                {getSortIcon('saldo_pendente')}
              </div>
            </TableHead>
            <TableHead className="text-center text-[#F5C800] font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClientes.map((cliente) => {
            const temResumo = isClienteComResumo(cliente)
            
            return (
              <TableRow key={cliente.id} className="hover:bg-[#F5C800]/5">
                <TableCell>
                  <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold">
                    #{String(cliente.codigo).padStart(3, '0')}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold">{cliente.nome}</span>
                    {cliente.telefone && (
                      <span className="text-xs text-muted-foreground">{cliente.telefone}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {cliente.responsavel_contato ? (
                    <Badge variant="secondary" className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90">
                      {cliente.responsavel_contato}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>{cliente.cidade || cliente.endereco || "-"}</TableCell>
                
                {temResumo ? (
                  <>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{cliente.total_obras}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {cliente.obras_finalizadas > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                            {cliente.obras_finalizadas} Concluída(s)
                          </Badge>
                        )}
                        {cliente.obras_em_andamento > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1 text-orange-600" />
                            {cliente.obras_em_andamento} Em andamento
                          </Badge>
                        )}
                        {cliente.total_obras === 0 && (
                          <span className="text-xs text-muted-foreground">Sem obras</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {formatCurrency(cliente.valor_total_obras)}
                    </TableCell>
                    <TableCell className="text-center text-green-600">
                      {formatCurrency(cliente.total_pago)}
                    </TableCell>
                    <TableCell className="text-center">
                      {cliente.saldo_pendente > 0 ? (
                        <span className="text-orange-600 font-semibold">
                          {formatCurrency(cliente.saldo_pendente)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </>
                )}
                
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button asChild size="sm" className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90">
                      <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id)} className="border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
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
    </div>
  )
}
