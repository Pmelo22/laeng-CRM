"use client"

import { useState, useMemo, useCallback } from "react"
import { calculateFinancialMetrics } from "@/components/pagamentos/libs/pagamentos-financial"
import type { Pagamentos, FinancialMetrics } from "@/lib/types"
import { PagamentosHeader } from "@/components/pagamentos/fluxo-header"
import { filterPayments, getAvailableMonth, getAvailableWeek, getAvailableYears, INITIAL_FILTERS } from "@/components/pagamentos/libs/pagamentos-filter-logic"
import { PaymentFiltersState } from "@/lib/types"
import { PagamentosDashboard } from "@/components/pagamentos/pagamentos-dashboard"


interface FluxoPageContentProps {
    pagamentos: Pagamentos[]
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
    metrics: FinancialMetrics
    userPermissions: Record<string, any>
}

export default function FluxoPageContent({
    pagamentos,
    categories,
}: FluxoPageContentProps) {

    // Estados de Filtro e View 
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState<PaymentFiltersState>(INITIAL_FILTERS)

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

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            <PagamentosHeader
                metrics={currentMetrics}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                availableYears={availableYears}
                availableMonth={availableMonth}
                availableWeeks={availableWeeks}
                categories={categories}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <div className="pb-10">
                    <PagamentosDashboard data={filteredPagamentos} metrics={currentMetrics} />
                </div>
            </div>

        </div>
    )
}
