// src/lib/payment-logic.ts
import { getMonth, getYear, parseISO } from "date-fns"
import type { Pagamentos } from "@/lib/types"

export interface PaymentFiltersState {
  type: string
  status: string
  category: string
  account: string
  method: string
  installments: string
  month: string
  year: string
}

export const INITIAL_FILTERS: PaymentFiltersState = {
  type: "all",
  status: "all",
  category: "all",
  account: "all",
  method: "all",
  installments: "all",
  month: "all",
  year: "all"
}

/**
 * Extrai os anos únicos disponíveis nos pagamentos para o dropdown
 */
export function getAvailableYears(pagamentos: Pagamentos[]): number[] {
  const years = new Set(
    pagamentos.map(p => p.date ? getYear(parseISO(p.date)) : new Date().getFullYear())
  )
  return Array.from(years).sort((a, b) => b - a)
}

export function filterPayments(
  pagamentos: Pagamentos[], 
  filters: PaymentFiltersState, 
  searchTerm: string
): Pagamentos[] {
  return pagamentos.filter(pg => {
    // 1. Busca textual
    const term = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      pg.description?.toLowerCase().includes(term) ||
      pg.category_name?.toLowerCase().includes(term) ||
      pg.account_name?.toLowerCase().includes(term)

    if (!matchesSearch) return false

    // 2. Filtros Diretos (Early returns para performance)
    if (filters.type !== 'all' && pg.type !== filters.type) return false
    if (filters.status !== 'all' && pg.status !== filters.status) return false
    if (filters.category !== 'all' && String(pg.category_id) !== filters.category) return false
    if (filters.account !== 'all' && String(pg.account_id) !== filters.account) return false
    if (filters.method !== 'all' && pg.method !== filters.method) return false

    // 3. Filtro de Parcelas
    if (filters.installments === 'single' && (pg.installments_total && pg.installments_total > 1)) return false
    if (filters.installments === 'multi' && (!pg.installments_total || pg.installments_total <= 1)) return false

    // 4. Filtro de Data (Mês/Ano)
    if (pg.date) {
      const dateObj = parseISO(pg.date)
      if (filters.year !== 'all' && getYear(dateObj) !== parseInt(filters.year)) return false
      if (filters.month !== 'all' && getMonth(dateObj) !== parseInt(filters.month)) return false
    } else if (filters.year !== 'all' || filters.month !== 'all') {
      // Se tem filtro de data mas o registro não tem data, exclui
      return false
    }

    return true
  })
}