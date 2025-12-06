import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import type { ObraComCliente } from "@/lib/types"

// Lazy load com suspense fallback
const ObraTableFullContent = dynamic(() => import("./obras-table-full"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
      <span className="ml-2 text-sm text-gray-600">Carregando tabela de obras...</span>
    </div>
  ),
  ssr: false,
})

interface ObraTableFullLazyProps {
  obras: ObraComCliente[]
  onEdit?: (obra: ObraComCliente) => void
}

/**
 * Lazy-loaded wrapper para ObraTableFull
 * Melhora performance carregando o componente sob demanda
 * Economiza ~20KB do bundle principal
 */
export function ObraTableFullLazy({ obras, onEdit }: ObraTableFullLazyProps) {
  return <ObraTableFullContent obras={obras} onEdit={onEdit} />
}
