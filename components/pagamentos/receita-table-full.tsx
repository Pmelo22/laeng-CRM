"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CircleDollarSign, CalendarDays, Tag, Pencil, ListTree, Trash2, User } from "lucide-react"
import { formatCurrency } from "@/components/pagamentos/libs/pagamentos-financial"
import { PagamentosQuickEditModal } from "./pagamentos-quick-edit-modal"
import { usePagination } from "@/lib/table-utils"
import { ReceitaModal } from "./receita-modal"
import { PagamentosPagination } from "./pagamentos-pagination"
import type { Pagamentos } from "@/lib/types"

interface ReceitaTableFullProps {
    data: Pagamentos[]
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
    userPermissions?: Record<string, any>
    onEdit: (payment: Pagamentos) => void // Kept for interface compatibility, though mostly handled internally or via modals
    onDelete: (payment: Pagamentos) => void
}

export function ReceitaTableFull({ data, userPermissions, categories, subcategories, onDelete }: ReceitaTableFullProps) {

    // Force filter for Receita
    const filteredData = data.filter(item => item.type === 'receita');

    const [editConfig, setEditConfig] = useState<{
        isOpen: boolean
        row: Pagamentos | null
        field: string
        fieldSecondary?: string
        title: string
        type: "text" | "money" | "date" | "select" | "category_tree"
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
        type: "text" | "money" | "date" | "select" | "category_tree",
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
    }

    const [isEditModalFullOpen, setIsEditModalFullOpen] = useState(false)
    const [selectedPagamentoFull, setSelectedPagamentoFull] = useState<Pagamentos | null>(null)

    const handleFullEdit = (pagamento: Pagamentos) => {
        setSelectedPagamentoFull(pagamento)
        setIsEditModalFullOpen(true)
    }

    const { currentPage, setCurrentPage, itemsPerPage, totalPages, startIndex, endIndex, paginatedData, handleItemsPerPageChange, getPageNumbers } = usePagination(filteredData, 100)

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <CircleDollarSign className="h-12 w-12 mb-3 opacity-20" />
                <p>Nenhuma receita encontrada.</p>
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
                                <TableHead className="text-[#F5C800] font-bold py-3 w-[150px]">SUBCATEGORIA</TableHead>
                                <TableHead className="text-[#F5C800] font-bold py-3 min-w-[200px]">CLIENTE</TableHead>
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
                                            <span className="text-sm font-medium text-gray-600 truncate max-w-[120px]" title={row.category_name}>
                                                {row.category_name || "Geral"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* SUBCATEGORIA */}
                                    <TableCell>
                                        <div className="flex items-center justify-between gap-1.5 relative group/cat">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="h-3 w-3 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600 truncate max-w-[120px]" title={row.subcategory_name}>
                                                    {row.subcategory_name || "Geral"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* CLIENTE */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3 w-3 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-800 truncate" title={row.cliente_nome}>
                                                {row.cliente_nome || "-"}
                                            </span>
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
                                            className={`font-bold text-sm whitespace-nowrap ${canEdit ? 'cursor-pointer hover:opacity-70' : ''} text-emerald-600`}
                                        >
                                            + {formatCurrency(row.amount || 0)}
                                        </div>
                                    </TableCell>

                                    {/* BOTÃO DE EDITAR */}
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

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDelete(row)}
                                            className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 h-9 w-9 p-0 transition-colors"
                                            title="Excluir Usuário"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <PagamentosPagination startIndex={startIndex} endIndex={endIndex}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                getPageNumbers={getPageNumbers}
            />

            {editConfig.isOpen && editConfig.row && (
                <PagamentosQuickEditModal
                    isOpen={editConfig.isOpen}
                    onClose={() => setEditConfig(prev => ({ ...prev, isOpen: false }))}
                    title={editConfig.title}
                    currentValue={
                        editConfig.type === 'category_tree'
                            ? editConfig.row.subcategories_id
                            : (editConfig.row as any)[editConfig.field]
                    }
                    currentValueSecondary={
                        editConfig.type === 'category_tree'
                            ? editConfig.row.category_id
                            : undefined
                    }
                    fieldName={editConfig.field}
                    fieldNameSecondary={editConfig.fieldSecondary}
                    tableId={editConfig.row.id}
                    type={editConfig.type}
                    options={editConfig.options}
                    extraOptions={categories}
                />
            )}

            <ReceitaModal
                isOpen={isEditModalFullOpen}
                onClose={() => {
                    setIsEditModalFullOpen(false)
                    setSelectedPagamentoFull(null)
                }}
                pagamento={selectedPagamentoFull || undefined}
                categories={categories}
                subcategories={subcategories}
            />
        </div>
    )
}
