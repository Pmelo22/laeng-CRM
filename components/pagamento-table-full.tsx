"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, CircleDollarSign, CalendarDays, Tag, Landmark, Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/financial"
import type { Pagamentos } from "@/lib/types"
import { PagamentoQuickEditModal } from "./pagamento-quick-edit-modal"
import { format } from "date-fns"
import { usePagination } from "@/lib/table-utils"
import { PagamentoEditModal } from "./pagamento-edit-modal"


interface PagamentosTableFullProps {
  data: Pagamentos[]
  categories: { label: string; value: string }[]
  accounts: { label: string; value: string }[]
  userPermissions?: Record<string, any>
}

const getMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    cartao_credito: "Crédito",
    cartao_debito: "Débito",
    boleto: "Boleto",
    pix: "PIX",
    dinheiro: "Dinheiro", 
    transferencia: "Transf.",
  }
  return map[method] || method
}

const getStatusBadge = (status: string) => {
  if (status === 'pago') {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 h-6 px-2">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Pago
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 h-6 px-2">
      <AlertCircle className="w-3 h-3 mr-1" /> Pendente
    </Badge>
  )
}

const getTypeBadge = (type: string) => {
    if (type === 'receita') {
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 h-6">Receita</Badge>
    }
    return <Badge className="bg-rose-500 hover:bg-rose-600 h-6">Despesa</Badge>
}

export function PagamentosTableFull({ data, userPermissions, categories, accounts}: PagamentosTableFullProps) {

  
  const [editConfig, setEditConfig] = useState<{
    isOpen: boolean
    row: Pagamentos | null
    field: string
    fieldSecondary?: string
    title: string
    type: "text" | "money" | "date" | "select" | "installments"
    options?: { label: string; value: string }[]
  }>({
    isOpen: false,
    row: null,
    field: "",
    title: "",
    type: "text",
  })

  const canEdit = userPermissions?.pagamentos?.edit ?? true

  const handleEdit = (
    row: Pagamentos,
    field: string,
    title: string,
    type: "text" | "money" | "date" | "select" | "installments",
    options?: { label: string; value: string }[],
    fieldSecondary?: string
  ) => {
    if (!canEdit) return
    setEditConfig({
      isOpen: true,
      row,
      field,
      fieldSecondary,
      title,
      type,
      options,
    })

  console.log(row.date)
  }

  const [isEditModalFullOpen, setIsEditModalFullOpen] = useState(false)
  const [selectedPagamentoFull, setSelectedPagamentoFull] = useState<Pagamentos | null>(null)

  const handleFullEdit = (pagamento: Pagamentos) => {
    setSelectedPagamentoFull(pagamento)
    setIsEditModalFullOpen(true)
  }

  const { currentPage, setCurrentPage, itemsPerPage, totalPages, startIndex, endIndex, paginatedData: paginatedData, handleItemsPerPageChange, getPageNumbers } = usePagination(data, 100)

  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <CircleDollarSign className="h-12 w-12 mb-3 opacity-20" />
            <p>Nenhum lançamento encontrado.</p>
        </div>
    )
  }

  

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-[#F5C800]/20 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
              <TableRow className="hover:bg-[#1E1E1E] border-b border-gray-700">
                <TableHead className="text-[#F5C800] font-bold py-3 pl-4 w-[70px]">CÓD.</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 w-[150px]">CATEGORIA</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 w-[150px]">BANCO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 min-w-[200px]">DESCRIÇÃO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[100px]">TIPO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[120px]">MÉTODO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[90px]">PARCELAS</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[110px]">STATUS</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[110px]">DATA</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-right pr-6 w-[130px]">VALOR</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-right pr-6 w-[130px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-[#F5C800]/5 border-b border-gray-100 transition-colors h-[60px]">
                  
                  {/* CÓDIGO */}
                    <TableCell className="py-3 pl-4">
                    <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                         #{String(row.codigo || 0).padStart(3, '0')}
                    </Badge>
                    </TableCell>
    
                  {/* CATEGORIA */}
                    <TableCell> 
                    <div className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <div 
                            onClick={() => handleEdit( row, "category_id", "Categoria", "select", categories 
                            )}
                            className={`flex flex-col justify-center max-w-[250px] ${canEdit ? 'cursor-pointer group' : ''}`}
                        >
                        <span className="text-sm font-medium text-gray-600 truncate max-w-[140px]" title={row.category_name}>
                            {row.category_name || "Geral"}
                        </span>
                        </div>
                    </div>
                </TableCell>
                
                {/* BANCOS */}
                    <TableCell> 
                    <div className="flex items-center gap-1.5">
                        <Landmark className="h-3 w-3 text-gray-400" />
                        <div 
                            onClick={() => handleEdit( row, "account_id", "Bancos", "select", accounts
                            )}
                            className={`flex flex-col justify-center max-w-[250px] ${canEdit ? 'cursor-pointer group' : ''}`}
                        >
                        <span className="text-sm font-medium text-gray-600 truncate max-w-[140px]" title={row.account_name}>
                            {row.account_name || "Geral"}
                        </span>
                        </div>
                    </div>
                </TableCell>

            
                  {/* DESCRIÇÃO E CLIENTE */}
                  <TableCell>
                    <div 
                        onClick={() => handleEdit(row, "description", "Descrição", "text")}
                        className={`flex flex-col justify-center max-w-[1150px] ${canEdit ? 'cursor-pointer group' : ''}`}
                    >
                        <span className={`text-sm font-semibold text-gray-800 truncate ${canEdit ? 'group-hover:text-[#d4ac00] transition-colors' : ''}`} title={row.description}>
                            {row.description || "Sem descrição"}
                        </span>
                        
                    </div>
                  </TableCell>

                  {/* TIPO */}
                  <TableCell className="text-center p-2">
                    <div 
                        onClick={() => handleEdit(row, "type", "Tipo", "select", [
                            { label: "Receita", value: "receita" },
                            { label: "Despesa", value: "despesa" },
                        ])}
                        className={`inline-flex justify-center ${canEdit ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                        {getTypeBadge(row.type || 'despesa')}
                    </div>
                  </TableCell>

                  {/* MÉTODO */}
                  <TableCell className="text-center p-2">
                     <div 
                        onClick={() => handleEdit(row, "method", "Forma de Pagamento", "select", [
                            { label: "Cartão de Crédito", value: "cartao_credito" },
                            { label: "Cartão de Débito", value: "cartao_debito" },
                            { label: "Boleto", value: "boleto" },
                            { label: "PIX", value: "pix" },
                            { label: "Dinheiro", value: "dinheiro" },
                            { label: "Transferência", value: "transferencia" },
                        ])}
                        className={`text-xs font-medium inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent ${canEdit ? 'cursor-pointer hover:border-gray-200 hover:bg-gray-50' : ''}`}
                    >
                        {getMethodLabel(row.method || '-')}
                    </div>
                  </TableCell>

                  {/* PARCELAS */}
                  <TableCell className="text-center p-2">
                    <div
                        onClick={() => handleEdit(row, "installments_current", "Parcelas", "installments", undefined, "installments_total")}
                        className={`text-xs font-mono inline-block px-2 py-1 rounded bg-gray-100 text-gray-600 whitespace-nowrap ${canEdit ? 'cursor-pointer hover:bg-[#F5C800] hover:text-[#1E1E1E] transition-colors' : ''}`}
                    >
                        {String(row.installments_current || 1).padStart(2, '0')}/{String(row.installments_total || 1).padStart(2, '0')}
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className="text-center p-2">
                    <div 
                        onClick={() => handleEdit(row, "status", "Status", "select", [
                            { label: "Pago", value: "pago" },
                            { label: "Pendente", value: "not_pago" }
                        ])}
                        className={`inline-flex justify-center ${canEdit ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                    >
                        {getStatusBadge(row.status || 'not_pago')}
                    </div>
                  </TableCell>

                  {/* DATA */}
                  <TableCell className="text-center p-2">
                    <div
                        onClick={() => handleEdit(row, "date", "Data", "date")}
                        className={`text-xs font-medium text-gray-600 flex items-center justify-center gap-1.5 whitespace-nowrap ${canEdit ? 'cursor-pointer hover:text-[#F5C800]' : ''}`}
                    >
                        <CalendarDays className="h-3 w-3 text-gray-400" />
                  
                        {row.date ? (() => {
                            const [ano, mes, dia] = row.date.split('T')[0].split('-');
                    
                            return `${mes}/${dia}/${ano}`;
                        })() : "-"}
                    </div>
                  </TableCell>
                  {/* VALOR */}
                  <TableCell className="text-right pr-6 p-2">
                    <div
                        onClick={() => handleEdit(row, "amount", "Valor", "money")}
                        className={`font-bold text-sm whitespace-nowrap ${canEdit ? 'cursor-pointer hover:opacity-70' : ''} ${row.type === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                        {row.type === 'despesa' ? '-' : '+'} {formatCurrency(row.amount || 0)}
                    </div>
                  </TableCell>
                
                  {/* AÇÕES */}
                  <TableCell className="py-3 text-right pr-4">
                      {canEdit && (
                        <Button
                          size="sm"
                          onClick={() => handleFullEdit(row)}
                          className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                          title="Editar Detalhes Completos"
                        >
                          <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                        </Button>
                      )}
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
            Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)} de {data.length} pagamentos
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Pagamentos por página:
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
      {editConfig.isOpen && editConfig.row && (
        <PagamentoQuickEditModal
            isOpen={editConfig.isOpen}
            onClose={() => setEditConfig(prev => ({ ...prev, isOpen: false }))}
            title={editConfig.title}
            currentValue={
              editConfig.type === 'installments' 
                ? editConfig.row.installments_current 
                : (editConfig.row as any)[editConfig.field]
            }
            currentValueSecondary={
               editConfig.type === 'installments' 
                ? editConfig.row.installments_total
                : undefined
            }
            fieldName={editConfig.field}
            fieldNameSecondary={editConfig.fieldSecondary}
            tableId={editConfig.row.id}
            type={editConfig.type}
            options={editConfig.options}
        />
      )}

      <PagamentoEditModal 
        isOpen={isEditModalFullOpen}
        onClose={() => {
            setIsEditModalFullOpen(false)
            setSelectedPagamentoFull(null)
        }}
        pagamento={selectedPagamentoFull || undefined}
        categories={categories}
        accounts={accounts}
      />
    </div>
  )
}