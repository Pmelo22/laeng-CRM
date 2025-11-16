"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface EditableValueModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  currentValue: number
  fieldName: string
  tableId: string
  tableName: "clientes" | "obras"
  onSave?: () => void
}

export function EditableValueModal({
  isOpen,
  onClose,
  title,
  currentValue,
  fieldName,
  tableId,
  tableName,
  onSave,
}: EditableValueModalProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()
  const [value, setValue] = useState(currentValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (!tableId || !fieldName) {
        throw new Error("ID da tabela ou nome do campo não definido")
      }

      const updateData: Record<string, number | string> = {
        [fieldName]: value,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", tableId)

      if (error) {
        console.error("Erro detalhado do Supabase:", error)
        throw new Error(error.message || "Erro ao atualizar no banco de dados")
      }

      toast({
        title: "✅ Salvo com sucesso!",
        description: `${title} atualizado com sucesso.`,
        duration: 3000,
      })

      onClose()
      onSave?.()

      // Recarregar dados
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar"
      console.error("Erro ao salvar:", errorMessage)
      toast({
        title: "❌ Erro ao salvar",
        description: errorMessage || "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setValue(currentValue)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm w-full p-0 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#1E1E1E] text-white px-6 py-4">
          <DialogTitle className="text-xl font-bold uppercase">
            Editar {title}
          </DialogTitle>
          <p className="text-sm text-gray-300 mt-2">
            Altere o valor e clique em salvar para confirmar.
          </p>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6 space-y-6 bg-white">
          {/* Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#1E1E1E] uppercase block">
              Novo Valor (R$)
            </label>
            <Input
              type="text"
              value={formatMoneyInput(value)}
              onChange={(e) => {
                const newValue = parseMoneyInput(e.target.value)
                setValue(newValue)
              }}
              placeholder="0,00"
              disabled={isLoading}
              className="border-2 border-gray-300 focus:border-[#F5C800] focus:ring-0 font-mono text-lg h-14 px-4 rounded-lg bg-white"
            />
          </div>

          {/* Valor Anterior */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded px-4 py-4">
            <p className="text-xs font-bold text-blue-900 uppercase mb-2">Valor Anterior</p>
            <p className="text-2xl font-bold text-blue-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentValue)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-2 border-gray-300 text-[#1E1E1E] hover:bg-gray-100 font-bold uppercase px-6"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#E5B800] font-bold uppercase px-6"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
