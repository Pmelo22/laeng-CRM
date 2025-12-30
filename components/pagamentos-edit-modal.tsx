"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput } from "@/lib/utils" 
import type { Pagamentos } from "@/lib/types"
import { usePagamentoForm } from "./hooks/usePagamentoForm"
import { AlertCircle } from "lucide-react"

interface PagamentosEditModalProps {
  isOpen: boolean
  onClose: () => void
  pagamento?: Pagamentos
  categories: { label: string; value: string }[]
  subcategories: { id: string; name: string ; categories_id: string}[]
  accounts: { label: string; value: string }[]
}

export function PagamentosEditModal({ 
  isOpen, 
  onClose, 
  pagamento, 
  categories, 
  subcategories,
  accounts 
}: PagamentosEditModalProps) {

  const { 
    formData, 
    isLoading, 
    updateField, 
    updateMoney, 
    savePagamento 
  } = usePagamentoForm(isOpen, onClose, pagamento)

  // Filtra as subcategorias com base na categoria selecionada no form
  const filteredSubcategories = subcategories.filter(
    sub => sub.categories_id === formData.category_id
  )

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
                onChange={e => updateField('description', e.target.value)}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>

            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input 
                value={formatMoneyInput(formData.amount)} 
                onChange={e => updateMoney(e.target.value)}
                className="border-2 focus:border-[#F5C800] font-mono text-lg font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label>Data</Label>
              <Input 
                type="date"
                value={formData.date} 
                onChange={e => updateField('date', e.target.value)}
                className="border-2 focus:border-[#F5C800]"
              />
            </div>
          </div>

          {/* Classificação */}
          <div>
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase mb-3 border-b pb-1">Classificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Seleção de Categoria */}
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={v => updateField('category_id', v)}
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

              {/* 2. Seleção de Subcategoria (Dependente) */}
              <div className="space-y-1">
                <Label className={!formData.category_id ? "text-gray-400" : ""}>
                    Subcategoria
                </Label>
                <Select 
                  value={formData.subcategories_id} 
                  onValueChange={v => updateField('subcategories_id', v)}
                  disabled={!formData.category_id}
                >
                  <SelectTrigger className={`border-2 focus:ring-[#F5C800] ${!formData.category_id ? 'bg-gray-50 border-gray-100' : ''}`}>
                    <SelectValue placeholder={
                        !formData.category_id 
                        ? "Selecione a categoria primeiro" 
                        : filteredSubcategories.length === 0 
                            ? "Sem subcategorias" 
                            : "Selecione..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.category_id && filteredSubcategories.length === 0 && (
                    <p className="text-[10px] text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Nenhuma subcategoria cadastrada
                    </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Conta / Banco</Label>
                <Select 
                  value={formData.account_id} 
                  onValueChange={v => updateField('account_id', v)}
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
                  onValueChange={v => updateField('type', v)}
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
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase mb-3 border-b pb-1">Detalhes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={v => updateField('status', v)}
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
              
              <div className="space-y-1 md:col-span-2">
                <Label>Método</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={v => updateField('method', v)}
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
                  onChange={e => updateField('installments_current', Number(e.target.value))}
                  className="border-2 focus:border-[#F5C800]"
                />
              </div>

              <div className="space-y-1">
                <Label>Total Parcelas</Label>
                <Input 
                  type="number"
                  min={1}
                  value={formData.installments_total} 
                  onChange={e => updateField('installments_total', Number(e.target.value))}
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
              onClick={savePagamento} 
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