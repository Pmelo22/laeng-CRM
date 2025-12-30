"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Pagamentos } from "@/lib/types"
import { useRouter } from "next/navigation"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils" 

interface PagamentoEditModalProps {
  isOpen: boolean
  onClose: () => void
  pagamento?: Pagamentos
  categories: { label: string; value: string }[]
  subcategories: { label: string; value: string }[]
  accounts: { label: string; value: string }[]
}

export function PagamentoEditModal({ 
  isOpen, 
  onClose, 
  pagamento, 
  categories, 
  subcategories,
  accounts 
}: PagamentoEditModalProps) {

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
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
  })

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
    }
  }, [isOpen, pagamento])

  const handleSave = async () => {
    if (!pagamento) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("transactions") 
        .update({
          description: formData.description,
          amount: formData.amount,
          date: formData.date,
          type: formData.type,
          method: formData.method,
          status: formData.status,
          category_id: formData.category_id || null,
          account_id: formData.account_id || null,
          installments_current: formData.installments_current,
          installments_total: formData.installments_total,
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

  const handleMoneyChange = (value: string) => {
    setFormData(prev => ({ ...prev, amount: parseMoneyInput(value) }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            Editar Lançamento
          </DialogTitle>
          {pagamento && (
            <p className="text-sm text-muted-foreground font-mono">
              Cód. #{String(pagamento.codigo).padStart(3, '0')}
            </p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin flex-1">
          
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <Label>Descrição</Label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>

            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input 
                value={formatMoneyInput(formData.amount)} 
                onChange={e => handleMoneyChange(e.target.value)}
                className="border-2 focus:border-[#F5C800] font-mono text-lg font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label>Data</Label>
              <Input 
                type="date"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* Classificação */}
          <div>
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase mb-3 border-b pb-1">Classificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={v => setFormData({...formData, category_id: v})}
                >
                  <SelectTrigger className="border-2 focus:ring-[#F5C800]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Conta / Banco</Label>
                <Select 
                  value={formData.account_id} 
                  onValueChange={v => setFormData({...formData, account_id: v})}
                >
                  <SelectTrigger className="border-2 focus:ring-[#F5C800]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={v => setFormData({...formData, type: v})}
                >
                  <SelectTrigger className="border-2 focus:ring-[#F5C800]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={v => setFormData({...formData, status: v})}
                >
                  <SelectTrigger className="border-2 focus:ring-[#F5C800]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="not_pago">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detalhes do Pagamento */}
          <div>
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase mb-3 border-b pb-1">Detalhes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Método</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={v => setFormData({...formData, method: v})}
                >
                  <SelectTrigger className="border-2 focus:ring-[#F5C800]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Parcela Atual</Label>
                <Input 
                  type="number"
                  min={1}
                  value={formData.installments_current} 
                  onChange={e => setFormData({...formData, installments_current: Number(e.target.value)})}
                  className="border-2 focus:border-[#F5C800]"
                />
              </div>

              <div className="space-y-1">
                <Label>Total Parcelas</Label>
                <Input 
                  type="number"
                  min={1}
                  value={formData.installments_total} 
                  onChange={e => setFormData({...formData, installments_total: Number(e.target.value)})}
                  className="border-2 focus:border-[#F5C800]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}