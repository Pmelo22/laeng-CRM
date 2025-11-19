import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de moeda
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Formatação de data
export function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString('pt-BR')
}

// Buscar endereço via CEP (ViaCEP API)
export async function buscarCepViaCep(cep: string): Promise<{
  logradouro?: string
  localidade?: string
  uf?: string
  erro?: boolean
} | null> {
  const cepLimpo = cep.replace(/\D/g, '')
  if (cepLimpo.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
    return null
  }
}

// Calcular valor contratual (entrada + financiado + subsídio)
export function calcularValorContratual(
  entrada: number,
  financiado: number,
  subsidio: number
): number {
  return (entrada || 0) + (financiado || 0) + (subsidio || 0)
}

// Formatar valor para input monetário (com máscara)
export function formatMoneyInput(value: number): string {
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// Converter string de input monetário para número
export function parseMoneyInput(value: string): number {
  const numericValue = value.replace(/\D/g, '')
  return Number(numericValue) / 100
}

// Formatação de percentual
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
