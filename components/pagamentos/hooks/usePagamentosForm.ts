"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { parseMoneyInput } from "@/lib/utils"
import type { Pagamentos } from "@/lib/types"
import { saveTransactionAction } from "../actions/pagamentosActions"

interface FormData {
  amount: number
  date: string
  type: string
  category_id: string
  subcategories_id: string
}

const INITIAL_STATE: FormData = {
  amount: 0,
  date: "",
  type: "despesa",
  category_id: "",
  subcategories_id: "",
}

export function usePagamentosForm(
  isOpen: boolean,
  onClose: () => void,
  pagamento?: Pagamentos | null
) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE)

  useEffect(() => {
    if (isOpen && pagamento) {
      setFormData({
        amount: Number(pagamento.amount) || 0,
        date: pagamento.date ? new Date(pagamento.date).toISOString().split('T')[0] : "",
        type: pagamento.type || "despesa",
        category_id: pagamento.category_id || "",
        subcategories_id: pagamento.subcategories_id || "",
      })
    } else {
      setFormData({
        ...INITIAL_STATE,
        date: new Date().toISOString().split('T')[0]
      })
    }
  }, [isOpen, pagamento])

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      if (field === 'category_id' && value !== prev.category_id) {
        newData.subcategories_id = ""
      }
      return newData
    })
  }

  const updateMoney = (value: string) => {
    setFormData(prev => ({ ...prev, amount: parseMoneyInput(value) }))
  }

  const savePagamento = async () => {
    setIsLoading(true)

    try {
      const result = await saveTransactionAction(formData, pagamento?.id)

      if (!result.success) {
        throw new Error(result.message)
      }

      toast({
        title: pagamento ? "✅ Pagamento atualizado!" : "✅ Pagamento criado!",
        description: "Os dados foram salvos com sucesso.",
        duration: 3000,
      })

      onClose()

    } catch (error: any) {
      console.error(error)
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    isLoading,
    updateField,
    updateMoney,
    savePagamento
  }
}