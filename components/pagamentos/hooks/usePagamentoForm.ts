"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { parseMoneyInput } from "@/lib/utils"
import type { Pagamentos } from "@/lib/types"
import { saveTransactionAction } from "../actions/pagamentosActions" 

interface FormData {
  description: string
  amount: number
  date: string
  type: string
  method: string
  status: string
  category_id: string
  subcategories_id: string
  account_id: string
  installments_current: number
  installments_total: number
}

const INITIAL_STATE: FormData = {
  description: "",
  amount: 0,
  date: "",
  type: "despesa",
  method: "pix",
  status: "not_pago",
  category_id: "",
  subcategories_id: "", 
  account_id: "",
  installments_current: 1,
  installments_total: 1,
}

export function usePagamentoForm(
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
        description: pagamento.description || "",
        amount: Number(pagamento.amount) || 0,
        date: pagamento.date ? new Date(pagamento.date).toISOString().split('T')[0] : "",
        type: pagamento.type || "despesa",
        method: pagamento.method || "pix",
        status: pagamento.status || "not_pago",
        category_id: pagamento.category_id || "",
        subcategories_id: pagamento.subcategories_id || "", 
        account_id: pagamento.account_id || "",
        installments_current: pagamento.installments_current || 1,
        installments_total: pagamento.installments_total || 1,
      })
    } else {
      setFormData(INITIAL_STATE)
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