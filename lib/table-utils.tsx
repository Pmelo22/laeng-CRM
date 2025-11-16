import { useState, useMemo, ReactNode } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

/**
 * SISTEMA CENTRALIZADO DE TABELAS
 * Fornece hooks e componentes reutilizáveis para tabelas com
 * sorting, paginação e expansão de linhas
 */

// ============================================================================
// TIPOS
// ============================================================================

export type SortDirection = 'asc' | 'desc' | 'none'

export interface SortableTableHeadProps {
  onClick: () => void
  label: string
  sortIcon: ReactNode
}

export interface ExpandToggleButtonProps {
  isExpanded: boolean
  onClick: () => void
  title?: string
}

export interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (value: string) => void
  pageNumbers: (number | string)[]
}

// ============================================================================
// HOOK: useSortTable
// Centraliza lógica de ordenação com ciclo asc → desc → none
// ============================================================================

export function useSortTable<T>(
  data: T[],
  defaultSortField?: keyof T,
  defaultSortDirection?: SortDirection,
  compareFn?: (a: T, b: T, field: keyof T, direction: 'asc' | 'desc') => number
) {
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection || 'none')

  const handleSort = (field: keyof T) => {
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

  const getSortIcon = (field: keyof T) => {
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

  const sortedData = useMemo(() => {
    if (!sortField || sortDirection === 'none') {
      // Ordenação padrão por 'codigo' se existir
      return [...data].sort((a, b) => {
        const aCode = (a as T & { codigo?: number }).codigo || 0
        const bCode = (b as T & { codigo?: number }).codigo || 0
        return aCode - bCode
      })
    }

    return [...data].sort((a, b) => {
      if (compareFn) {
        return compareFn(a, b, sortField, sortDirection as 'asc' | 'desc')
      }

      let aValue: string | number | null = (a as Record<string, string | number | null>)[sortField as string]
      let bValue: string | number | null = (b as Record<string, string | number | null>)[sortField as string]

      // Normalizar valores nulos
      aValue = aValue ?? ''
      bValue = bValue ?? ''

      // Comparação genérica
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortField, sortDirection, compareFn])

  return {
    sortField,
    sortDirection,
    handleSort,
    getSortIcon,
    sortedData,
  }
}

// ============================================================================
// HOOK: usePagination
// Centraliza lógica de paginação com cálculos automáticos
// ============================================================================

export function usePagination<T>(data: T[], defaultItemsPerPage = 20) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const getPageNumbers = (maxVisible = 5): (number | string)[] => {
    const pages: (number | string)[] = []

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    handleItemsPerPageChange,
    getPageNumbers,
  }
}

// ============================================================================
// HOOK: useExpandableRows
// Centraliza lógica de expansão de linhas com toggle, expandAll, collapseAll
// ============================================================================

export function useExpandableRows() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  const isExpanded = (rowId: string) => expandedRows.has(rowId)

  const expandAll = (rowIds: string[]) => {
    setExpandedRows(new Set(rowIds))
  }

  const collapseAll = () => {
    setExpandedRows(new Set())
  }

  const toggleAll = (rowIds: string[]) => {
    if (expandedRows.size === rowIds.length) {
      collapseAll()
    } else {
      expandAll(rowIds)
    }
  }

  return {
    expandedRows,
    toggleRow,
    isExpanded,
    expandAll,
    collapseAll,
    toggleAll,
  }
}

// ============================================================================
// COMPONENTES REUTILIZÁVEIS
// ============================================================================

/**
 * Componente: SortableTableHead
 * Header de coluna clicável com ícone de ordenação
 */
export function SortableTableHead({ onClick, label, sortIcon }: SortableTableHeadProps) {
  return (
    <TableHead
      className="text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3"
      onClick={onClick}
    >
      <div className="flex items-center">
        {label}
        {sortIcon}
      </div>
    </TableHead>
  )
}

/**
 * Componente: ExpandToggleButton
 * Botão circular para expandir/recolher linhas
 */
export function ExpandToggleButton({ isExpanded, onClick, title }: ExpandToggleButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"
      title={title}
    >
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-[#1E1E1E] font-bold" />
      ) : (
        <ChevronDown className="h-4 w-4 text-[#1E1E1E] font-bold" />
      )}
    </Button>
  )
}
