"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            Editar {title}
          </DialogTitle>
          <DialogDescription>
            Altere o valor de {title.toLowerCase()} e clique em salvar para confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1E1E1E]">
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
              className="border-2 focus:border-[#F5C800] font-mono text-lg h-12 px-4"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Valor Anterior:</span> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentValue)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
