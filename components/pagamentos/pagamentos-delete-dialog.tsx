"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import type { Pagamentos } from "@/lib/types"
import { formatCurrency } from "@/components/pagamentos/libs/pagamentos-financial"

interface PagamentosDeleteDialogProps {
  pagamento: Pagamentos | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function PagamentosDeleteDialog({
  pagamento,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: PagamentosDeleteDialogProps) {
  if (!pagamento) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [ano, mes, dia] = dateString.split('T')[0].split('-')
    return `${dia}/${mes}/${ano}`
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-red-600">
            Excluir Lançamento?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base" asChild>
            <div>
              Você está prestes a excluir o lançamento:
              <br />
              <br />
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <p className="font-bold text-[#1E1E1E] text-lg">
                  {pagamento.description || "Sem descrição"}
                </p>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span>Data: {formatDate(pagamento.date)}</span>
                  <span className={`font-bold ${pagamento.type === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(pagamento.amount)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500 font-mono">
                  Cód: #{String(pagamento.codigo).padStart(3, '0')}
                </div>
              </div>
              <br />
              <span className="text-red-600 font-semibold">
                Esta ação não pode ser desfeita.
              </span>{" "}
              O registro financeiro será permanentemente removido do sistema.
            </div>
          </AlertDialogDescription>
          
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-gray-200" disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}