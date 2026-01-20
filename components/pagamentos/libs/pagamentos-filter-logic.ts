import { eachWeekOfInterval, endOfMonth, endOfWeek, format, getMonth, getWeek, getWeekOfMonth, getYear, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns"
import type { Pagamentos, PaymentFiltersState } from "@/lib/types"
import { ptBR } from "date-fns/locale"

const today = new Date()

export const INITIAL_FILTERS: PaymentFiltersState = {
  type: "all",
  category: "all",
  month: String(getMonth(today)), 
  year: String(getYear(today)),
  week: String(getWeek(today)),
}

// Filtragem inteligente para semanas 
export function getWeeksOptions(yearStr: string, monthStr: string): { value: string, label: string }[] {
  if (yearStr === 'all' || monthStr === 'all') return []

  const year = parseInt(yearStr)
  const month = parseInt(monthStr)
  const monthDate = new Date(year, month)
  const startCalendar = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const endCalendar = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })

  const weeks = eachWeekOfInterval(
    { start: startCalendar, end: endCalendar },
    { weekStartsOn: 0 }
  )

  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
    const weekIndex = getWeek(weekStart, { weekStartsOn: 0 })

    const startLabel = format(weekStart, 'MM/dd', { locale: ptBR })
    const endLabel = format(weekEnd, 'MM/dd', { locale: ptBR })

    return {
      value: String(weekIndex),
      label: `Semana ${startLabel} - ${endLabel}`
    }
  })
}

// Extrai os anos únicos disponíveis nos pagamentos para o dropdown
export function getAvailableYears(pagamentos: Pagamentos[]): number[] {
  const years = new Set(
    pagamentos.map(p => p.date ? getYear(parseISO(p.date)) : new Date().getFullYear())
  )
  return Array.from(years).sort((a, b) => b - a)
}

export function getAvailableMonth(pagamentos: Pagamentos[]): number[] {
  const month = new Set(
    pagamentos.map(p => p.date ? getMonth(parseISO(p.date)) : new Date().getMonth())
  )
  return Array.from(month).sort((a, b) => a - b)
}

export function getAvailableWeek(pagamentos: Pagamentos[]): number[] {
  const week = new Set(
    pagamentos.map(p => p.date ? getWeek(parseISO(p.date), { weekStartsOn: 0 }) : 1)
  )
  return Array.from(week).sort((a, b) => a - b)
}

// Main Function
export function filterPayments(
  pagamentos: Pagamentos[],
  filters: PaymentFiltersState,
  searchTerm: string
): Pagamentos[] {
  return pagamentos.filter(pg => {
    return (
      matchesDirectFilters(pg, filters) &&
      matchesDate(pg, filters) &&
      matchesSearch(pg, searchTerm)
    )
  })
}

//Busca Textual
function matchesSearch(pg: Pagamentos, searchTerm: string): boolean {
  if (!searchTerm) return true

  const term = searchTerm.toLowerCase()

  return (
    (pg.subcategory_name?.toLowerCase() || "").includes(term) ||
    (pg.category_name?.toLowerCase() || "").includes(term) ||
    (pg.cliente_nome?.toLowerCase() || "").includes(term) ||
    false
  )
}

//Busca Seleção
function matchesDirectFilters(pg: Pagamentos, filters: PaymentFiltersState): boolean {
  if (filters.type !== 'all' && pg.type !== filters.type) return false
  if (filters.category !== 'all' && String(pg.category_id) !== filters.category) return false

  return true
}

//Busca de Datas
function matchesDate(pg: Pagamentos, filters: PaymentFiltersState): boolean {
  const hasYearFilter = filters.year !== 'all'
  const hasMonthFilter = filters.month !== 'all'
  const hasWeekFilter = filters.week !== 'all'

  if (!hasYearFilter && !hasMonthFilter && !hasWeekFilter) return true
  if (!pg.date) return false

  const dateObj = parseISO(pg.date)
  const pgYear = getYear(dateObj)

  if (hasYearFilter && pgYear !== parseInt(filters.year)) return false

  if (hasWeekFilter) {
    const pgWeek = getWeek(dateObj, { weekStartsOn: 0 })
    return pgWeek === parseInt(filters.week)
  }

  if (hasMonthFilter && getMonth(dateObj) !== parseInt(filters.month)) return false

  return true
}