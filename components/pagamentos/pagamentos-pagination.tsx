"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PagamentosPaginationProps {
  startIndex: number
  endIndex: number
  totalItems: number
  itemsPerPage: number
  onItemsPerPageChange: (value: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  getPageNumbers: () => (number | string)[]
}

export function PagamentosPagination({
  startIndex,
  endIndex,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  getPageNumbers,
}: PagamentosPaginationProps) {

  //COMPONENTE GENÉRICO PARA PAGINAZAÇÃO
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-semibold">
          Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} lançamentos
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        {/* Seletor de Itens por Página */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
            Pagamentos por página:
          </span>
          <Select value={String(itemsPerPage)} onValueChange={onItemsPerPageChange}>
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

        {/* Botões de Navegação */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => onPageChange(page as number)}
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
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}