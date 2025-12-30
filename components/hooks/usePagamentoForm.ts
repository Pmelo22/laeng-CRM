import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { parseMoneyInput } from "@/lib/utils"
import type { Pagamentos } from "@/lib/types"

// Tipagem do estado do formulário
interface FormData {
  description: string
  amount: number
  date: string
  type: string
  method: string
  status: string
  category_id: string
  account_id: string
  installments_current: number
  installments_total: number
}

// Estado inicial padrão
const INITIAL_STATE: FormData = {
  description: "",
  amount: 0,
  date: "",
  type: "despesa",
  method: "pix",
  status: "not_pago",
  category_id: "",
  account_id: "",
  installments_current: 1,
  installments_total: 1,
}

export function usePagamentoForm(
  isOpen: boolean, 
  onClose: () => void, 
  pagamento?: Pagamentos
) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE)

  // 1. Efeito para popular o formulário quando o modal abre
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
        account_id: pagamento.account_id || "",
        installments_current: pagamento.installments_current || 1,
        installments_total: pagamento.installments_total || 1,
      })
    } else if (!isOpen) {
      // Opcional: Limpar formulário ao fechar
      setFormData(INITIAL_STATE)
    }
  }, [isOpen, pagamento])

  // 2. Helpers para atualizar estado
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateMoney = (value: string) => {
    setFormData(prev => ({ ...prev, amount: parseMoneyInput(value) }))
  }

  // 3. Função de Salvar
  const savePagamento = async () => {
    if (!pagamento) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("transactions") 
        .update({
          ...formData, 
          category_id: formData.category_id || null,
          account_id: formData.account_id || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", pagamento.id)

      if (error) throw error

      toast({
        title: "✅ Pagamento atualizado!",
        description: "Os dados foram salvos com sucesso.",
        duration: 3000,
      })

      onClose()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "❌ Erro ao atualizar",
        description: "Ocorreu um erro ao salvar os dados.",
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