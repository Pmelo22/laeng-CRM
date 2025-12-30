"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput } from "@/lib/utils" 
import type { Pagamentos } from "@/lib/types"
import { usePagamentoForm } from "./hooks/usePagamentoForm"

interface PagamentosEditModalProps {
  isOpen: boolean
  onClose: () => void
  pagamento?: Pagamentos | null 
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

  const isEditing = !!pagamento;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditing 
              ? `Editando registro #${String(pagamento?.codigo || '').padStart(3, '0')}` 
              : "Preencha os dados abaixo para registrar uma nova transação."}
          </p>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">
          
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1">
              <Label>Descrição</Label>
              <Input 
                placeholder="Ex: Pagamento Fornecedor X"
                value={formData.description} 
                onChange={e => updateField('description', e.target.value)}
                className="border-gray-300 focus:border-[#F5C800] focus:ring-[#F5C800]"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <Label>Valor (R$)</Label>
              <Input 
                value={formatMoneyInput(formData.amount)} 
                onChange={e => updateMoney(e.target.value)}
                className="border-gray-300 focus:border-[#F5C800] font-mono text-lg font-bold text-gray-800"
              />
            </div>
            
            <div className="md:col-span-4 space-y-1">
              <Label>Data</Label>
              <div className="relative">
                <Input 
                    type="date"
                    value={formData.date} 
                    onChange={e => updateField('date', e.target.value)}
                    className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
                 <Label>Tipo</Label>
                <div className="flex gap-2">
                    <Button 
                        type="button"
                        variant={formData.type === 'receita' ? 'default' : 'outline'}
                        className={`w-1/2 ${formData.type === 'receita' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-500'}`}
                        onClick={() => updateField('type', 'receita')}
                    >
                        Receita
                    </Button>
                    <Button 
                        type="button"
                        variant={formData.type === 'despesa' ? 'default' : 'outline'}
                        className={`w-1/2 ${formData.type === 'despesa' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-500'}`}
                        onClick={() => updateField('type', 'despesa')}
                    >
                        Despesa
                    </Button>
                </div>
            </div>
          </div>

          <div className="h-[1px] bg-gray-200 my-2"></div>

          {/* Classificação */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Classificação Bancária</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Seleção de Categoria */}
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={v => updateField('category_id', v)}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-[#F5C800]">
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
                  <SelectTrigger className={`border-gray-300 focus:ring-[#F5C800] ${!formData.category_id ? 'bg-gray-100' : ''}`}>
                    <SelectValue placeholder={
                        !formData.category_id 
                        ? "Selecione a categoria" 
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
              </div>

              <div className="space-y-1">
                <Label>Conta / Banco</Label>
                <Select 
                  value={formData.account_id} 
                  onValueChange={v => updateField('account_id', v)}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-[#F5C800]">
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
                <Label>Status Pagamento</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={v => updateField('status', v)}
                >
                  <SelectTrigger className={`border-gray-300 focus:ring-[#F5C800] font-medium ${formData.status === 'pago' ? 'text-green-600' : 'text-orange-600'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago" className="text-green-600">Efetuado / Pago</SelectItem>
                    <SelectItem value="not_pago" className="text-orange-600">Pendente / Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-gray-200 my-2"></div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Detalhes do Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              <div className="space-y-1 md:col-span-6">
                <Label>Método</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={v => updateField('method', v)}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-[#F5C800]">
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

              <div className="space-y-1 md:col-span-3">
                <Label>Parcela Atual</Label>
                <Input 
                  type="number"
                  min={1}
                  value={formData.installments_current} 
                  onChange={e => updateField('installments_current', Number(e.target.value))}
                  className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <Label>Total Parcelas</Label>
                <Input 
                  type="number"
                  min={1}
                  value={formData.installments_total} 
                  onChange={e => updateField('installments_total', Number(e.target.value))}
                  className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto">
             <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
              Cancelar
            </Button>
            <Button 
              onClick={savePagamento} 
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]"
            >
              {isLoading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Lançamento")}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}