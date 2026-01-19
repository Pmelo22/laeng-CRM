"use client"

import { useState, useMemo, useCallback } from "react"
import { calculateFinancialMetrics } from "@/components/pagamentos/libs/pagamentos-financial"
import type { Pagamentos, FinancialMetrics } from "@/lib/types"
import { PagamentosHeader, ViewMode } from "@/components/pagamentos/pagamentos-header"
import { PagamentosEditModal } from "@/components/pagamentos/pagamentos-edit-modal"
import { filterPayments, getAvailableMonth, getAvailableWeek, getAvailableYears, INITIAL_FILTERS } from "@/components/pagamentos/libs/pagamentos-filter-logic"
import { PaymentFiltersState } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { PagamentosDashboard } from "@/components/pagamentos/pagamentos-dashboard"
import { PagamentosDeleteDialog } from "@/components/pagamentos/pagamentos-delete-dialog"
import { deletarPagamentoAction } from "@/components/actions/pagamentosDeleteLogic"


interface FluxoPageContentProps {
    pagamentos: Pagamentos[]
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
    metrics: FinancialMetrics
    userPermissions: Record<string, any>
}

interface DeleteState {
    isOpen: boolean
    pagamentos: Pagamentos | null
    isDeleting: boolean
}

export default function FluxoPageContent({
    pagamentos,
    categories,
    subcategories,
    userPermissions
}: FluxoPageContentProps) {

    // Estados de Filtro e View 
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode] = useState<ViewMode>("dashboard")
    const [filters, setFilters] = useState<PaymentFiltersState>(INITIAL_FILTERS)

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<Pagamentos | null>(null)

    //Estado de Delete
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        pagamentos: null,
        isDeleting: false,
    })


    // Contexto de Data
    const availableYears = useMemo(() => getAvailableYears(pagamentos), [pagamentos])
    const availableMonth = useMemo(() => getAvailableMonth(pagamentos), [pagamentos])
    const availableWeeks = useMemo(() => getAvailableWeek(pagamentos), [pagamentos])

    // Contexto de Filtro e Métricas
    const filteredPagamentos = useMemo(() => {
        return filterPayments(pagamentos, filters, searchTerm)
    }, [pagamentos, searchTerm, filters])

    const currentMetrics = useMemo(() => {
        return calculateFinancialMetrics(filteredPagamentos)
    }, [filteredPagamentos])

    // Handlers de Filtros
    const updateFilter = (key: keyof PaymentFiltersState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(INITIAL_FILTERS)
        setSearchTerm("")
    }

    // Handlers do Modal 
    const handleNewPayment = () => {
        setSelectedPayment(null)
        setIsModalOpen(true)
    }

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteState(prev => ({
            ...prev,
            isOpen: false,
            pagamentos: null,
        }))
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        const { pagamentos } = deleteState
        if (!pagamentos) return
        setDeleteState(prev => ({ ...prev, isDeleting: true }))
        try {
            const result = await deletarPagamentoAction(pagamentos.id)
            if (!result.ok) throw new Error(result.error)
            toast({
                title: "Pagamento excluído!",
                description: `${pagamentos.id} foi removido com sucesso.`,
            })
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
            toast({
                title: "Erro ao excluir",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setDeleteState(prev => ({ ...prev, isDeleting: false }))
        }
    }, [deleteState, toast])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            <PagamentosHeader
                metrics={currentMetrics}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                viewMode={viewMode}
                setViewMode={() => { }}
                showViewToggler={false}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                availableYears={availableYears}
                availableMonth={availableMonth}
                availableWeeks={availableWeeks}
                categories={categories}
                subcategories={subcategories}
                onNewPayment={handleNewPayment}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <div className="pb-10">
                    <PagamentosDashboard data={filteredPagamentos} metrics={currentMetrics} />
                </div>
            </div>

            <PagamentosDeleteDialog
                isOpen={deleteState.isOpen}
                pagamento={deleteState.pagamentos}
                isDeleting={deleteState.isDeleting}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
            />

            <PagamentosEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pagamento={selectedPayment}
                categories={categories}
                subcategories={subcategories}
            />
        </div>
    )
}
