import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import type { ObraFinanceiroAggregated } from "@/lib/types"

// Lazy load com suspense fallback
const FinanceiraTableContent = dynamic(() => import("./financeira-table").then(mod => ({ default: mod.FinanceiraTable })), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
      <span className="ml-2 text-sm text-gray-600">Carregando tabela financeira...</span>
    </div>
  ),
  ssr: false,
})

interface FinanceiraTableLazyProps {
  obras: ObraFinanceiroAggregated[]
  userPermissions: Record<string, any>
}

/**
 * Lazy-loaded wrapper para FinanceiraTable
 * Melhora performance carregando o componente sob demanda
 * Economiza ~25KB do bundle principal
 */
export function FinanceiraTableLazy({ obras, userPermissions }: FinanceiraTableLazyProps) {
  return <FinanceiraTableContent obras={obras} userPermissions={userPermissions} />
}
