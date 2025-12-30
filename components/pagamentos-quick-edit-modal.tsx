"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils" 
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"

interface PagamentosQuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  currentValue: any
  currentValueSecondary?: any 
  fieldName: string
  fieldNameSecondary?: string 
  tableId: string
  type: "text" | "money" | "date" | "select" | "installments"
  options?: { label: string; value: string }[] 
}

export function PagamentosQuickEditModal({
  isOpen,
  onClose,
  title,
  currentValue,
  currentValueSecondary,
  fieldName,
  fieldNameSecondary,
  tableId,
  type,
  options,
}: PagamentosQuickEditModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [value, setValue] = useState(currentValue)
  const [valueSecondary, setValueSecondary] = useState(currentValueSecondary)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {

    setIsLoading(true)
    try {
      const supabase = createClient()
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (type === "money") {
        updates[fieldName] = typeof value === 'string' ? parseMoneyInput(value) : value
      } else if (type === "installments") {
        updates[fieldName] = Number(value)
        if (fieldNameSecondary) updates[fieldNameSecondary] = Number(valueSecondary)
      } else {
        updates[fieldName] = value
      }

      const { error } = await supabase
        .from("transactions") 
        .update(updates)
        .eq("id", tableId)

      if (error) throw error

      toast({
        title: "✅ Atualizado!",
        description: "Registro salvo com sucesso.",
        duration: 3000,
      })

      onClose()
      setTimeout(() => router.refresh(), 500)
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o registro.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderInput = () => {

    switch (type) {
      case "money":
        return (
          <Input
            value={formatMoneyInput(value)}
            onChange={(e) => setValue(parseMoneyInput(e.target.value))}
            className="font-mono text-lg h-14"
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="h-14 text-lg">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "date":
        return (
          <Input
            type="date"
            value={value ? value.split('T')[0] : ''}
            onChange={(e) => setValue(e.target.value)}
            className="h-14 text-lg"
          />
        )
      case "installments":
        return (
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Atual</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-14 text-lg mt-1"
              />
            </div>
            <span className="text-2xl font-bold mb-3">/</span>
            <div className="flex-1">
              <Label>Total</Label>
              <Input
                type="number"
                value={valueSecondary}
                onChange={(e) => setValueSecondary(e.target.value)}
                className="h-14 text-lg mt-1"
              />
            </div>
          </div>
        )
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-lg h-14"
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-full p-0 rounded-lg overflow-hidden">
        <div className="bg-[#1E1E1E] text-white px-6 py-4">
          <DialogTitle className="text-xl font-bold uppercase">Editar {title}</DialogTitle>
        </div>
        <div className="px-6 py-6 bg-white space-y-4">
          {renderInput()}
        </div>
        <div className="bg-gray-50 border-t px-6 py-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#E5B800] font-bold">
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}