"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { calculateFinancialMetrics } from "@/lib/pagamentos-financial"
import type { Pagamentos, FinancialMetrics } from "@/lib/types"
import { PagamentosTableFull } from "@/components/pagamentos-table-full"
import { PagamentosHeader, ViewMode } from "@/components/pagamentos-header" 
import { PagamentosEditModal } from "@/components/pagamentos-edit-modal" 
import { filterPayments, getAvailableMonth, getAvailableWeek, getAvailableYears, INITIAL_FILTERS } from "@/lib/pagamentos-filter-logic"
import { PaymentFiltersState } from "@/lib/types"
import { deletarPagamentoAction } from "@/components/actions/pagamentosDeleteLogic"
import { toast } from "@/hooks/use-toast"
import { PagamentosDeleteDialog } from "@/components/pagamentos-delete-dialog"

// Componente Placeholder para Relatório
const PagamentosReportFull = ({ data }: { data: Pagamentos[] }) => (
  <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-lg min-h-[300px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
    <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
    <p>Relatórios Gerenciais ({data.length} registros filtrados)</p>
  </div>
)

interface PagamentosPageContentProps {
  pagamentos: Pagamentos[]
  categories: { label: string; value: string }[]
  accounts: { label: string; value: string }[]
  subcategories: { id: string; name: string ; categories_id: string}[]
  metrics: FinancialMetrics 
  userPermissions: Record<string, any>
}

interface DeleteState {
  isOpen: boolean
  pagamentos: Pagamentos | null
  isDeleting: boolean
}

export default function PagamentosPageContent({ 
  pagamentos, 
  categories, 
  subcategories,
  accounts, 
  userPermissions 
}: PagamentosPageContentProps) {
  
  // Estados de Filtro e View 
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filters, setFilters] = useState<PaymentFiltersState>(INITIAL_FILTERS)

  // Estados do Modal ---
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

  const handleEditPayment = (payment: Pagamentos) => {
    setSelectedPayment(payment) 
    setIsModalOpen(true)
  }
  
  const handleOpenDeleteDialog = useCallback((payment: Pagamentos) => {
    setDeleteState(prev => ({
      ...prev,
      isOpen: true,
      pagamentos: payment,
    }))
  }, [])

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
      console.log("🗑️ Excluindo pagamento:", pagamentos.id)

      const result = await deletarPagamentoAction(pagamentos.id)

      if (!result.ok) {
        throw new Error(result.error)
      }

      toast({
        title: "Pagamento excluído!",
        description: `${pagamentos.id} foi removido com sucesso.`,
      })

    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Ocorreu um erro ao excluir o usuário."
      
      console.error("❌ Erro ao excluir usuário:", error)

      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeleteState(prev => ({ ...prev, isDeleting: false }))
    }
  }, [deleteState, handleCloseDeleteDialog, toast])
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      
      <PagamentosHeader
        metrics={currentMetrics}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        availableYears={availableYears}
        availableMonth={availableMonth}
        availableWeeks={availableWeeks}
        categories={categories}
        subcategories={subcategories}
        accounts={accounts}
        onNewPayment={handleNewPayment} 
      />

      <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden min-h-[500px]">
          <CardContent className="p-0">
            {viewMode === 'table' ? (
              <PagamentosTableFull 
                data={filteredPagamentos} 
                userPermissions={userPermissions} 
                categories={categories} 
                subcategories={subcategories}
                accounts={accounts} 
                onEdit={handleEditPayment} 
                onDelete={handleOpenDeleteDialog}
              />
            ) : (
              <PagamentosReportFull data={filteredPagamentos} />
            )}
          </CardContent>
        </Card>
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
        accounts={accounts}
      />
    </div>
    
  )
}