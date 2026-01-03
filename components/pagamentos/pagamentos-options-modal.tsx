"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

import { Account, Category, ObraData, OBRA_SUBCATEGORIES_MAP, modalsState, editingData } from "./types/pagamentosTypes"
import { useAccountForm, useCategoryForm, useSubCategoryForm } from "./hooks/usePagementosOptionsModals"
import { useObras } from "./hooks/useObras"
import { deleteCategoryAction } from "./actions/categoriasActions"
import { deleteSubcategoryAction } from "./actions/subcategoriasActions"
import { deleteAccountAction } from "./actions/accountsActions"

interface PagamentosModalsProps {
  categories: Category[]
  accounts: Account[] 
  modalsState: modalsState
  setModalsState: React.Dispatch<React.SetStateAction<modalsState>>
  editingData: editingData
}

export function PagamentosModals({ 
  categories, 
  accounts, 
  modalsState,
  setModalsState, 
  editingData 
}: PagamentosModalsProps) {

  const closeAll = () => {
    setModalsState({
        isCatOpen: false,
        isSubOpen: false,
        isAccountOpen: false,
        isDeleteOpen: false,
        isLinkOpen: false
    })
  }

  const [isLoading, setIsLoading] = useState(false)

  //Forms
  const catForm = useCategoryForm(editingData, modalsState.isCatOpen, closeAll)
  const subCatForm = useSubCategoryForm(editingData, modalsState.isSubOpen, closeAll)
  const accountForm = useAccountForm(editingData, modalsState.isAccountOpen, closeAll)

  //Obras
  const obras = useObras(modalsState.isLinkOpen, closeAll)

  //Delete
  const handleConfirmDelete = async () => {
    const item = editingData.toDelete
    if (!item) return
    setIsLoading(true)
    let result;
    if (item.type === 'cat') result = await deleteCategoryAction(item.id)
    else if (item.type === 'sub') result = await deleteSubcategoryAction(item.id)
    else result = await deleteAccountAction(item.id)
    setIsLoading(false)
    if (result.ok) {
    toast({ title: "Deletado", description: `${item.name} foi removido.` })
    closeAll()
    } else { toast({ title: "Erro ao excluir", description: result.error, variant: "destructive" }) }
  }

  return (
    <>
      {/* 1. LINK MODAL */}
      <Dialog open={modalsState.isLinkOpen} onOpenChange={(v) => !v && closeAll()}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 bg-white">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">Importar Custos da Obra</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Qual cliente deseja importar?</Label>
                    <Select value={obras.selectedId} onValueChange={obras.handleSelectObra}>
                        <SelectTrigger className="border-gray-300 focus:ring-[#F5C800] text-lg py-6">
                            <SelectValue placeholder="Selecione o Cliente / Obra..." />
                        </SelectTrigger>
                        <SelectContent>
                            {obras.list.length === 0 ? <SelectItem value="0" disabled>Nenhuma obra encontrada</SelectItem> : 
                                obras.list.map(obra => <SelectItem key={obra.id} value={String(obra.id)}>{obra.cliente_nome} (Cód: {String(obra.id).padStart(3,'0')})</SelectItem>)
                            }
                        </SelectContent>
                    </Select>
                </div>

                {obras.selectedData && (
                    <>
                        <div className="h-[1px] bg-gray-200"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Descrição Base</Label><Input value={obras.linkFormData.description_base} onChange={e => obras.setLinkFormData(prev => ({...prev, description_base: e.target.value}))} /></div>
                            <div className="space-y-1"><Label>Conta de Saída</Label><Select value={obras.linkFormData.account_id} onValueChange={v => obras.setLinkFormData(prev => ({...prev, account_id: v}))}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-1"><Label>Data</Label><Input type="date" value={obras.linkFormData.date} onChange={e => obras.setLinkFormData(prev => ({...prev, date: e.target.value}))} /></div>
                            <div className="space-y-1"><Label>Método</Label><Select value={obras.linkFormData.method} onValueChange={v => obras.setLinkFormData(prev => ({...prev, method: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="boleto">Boleto</SelectItem><SelectItem value="cartao_credito">Cartão</SelectItem><SelectItem value="transferencia">Transferência</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem></SelectContent></Select></div>
                            <div className="space-y-1"><Label>Status</Label><Select value={obras.linkFormData.status} onValueChange={v => obras.setLinkFormData(prev => ({...prev, status: v}))}><SelectTrigger className={obras.linkFormData.status === 'pago' ? 'text-green-600' : 'text-orange-600'}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pago">Pago</SelectItem><SelectItem value="not_pago">Pendente</SelectItem></SelectContent></Select></div>
                            <div className="space-y-1"><Label>Parcelas</Label><Input type="number" min={1} value={obras.linkFormData.installments_total} onChange={e => obras.setLinkFormData(prev => ({...prev, installments_total: Number(e.target.value)}))} /></div>
                        </div>
                        <div className="h-[1px] bg-gray-200"></div>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-2">
                             {Object.keys(OBRA_SUBCATEGORIES_MAP).map(key => {
                                const val = obras.selectedData?.[key as keyof ObraData] as number
                                if(!val || val <= 0) return null;
                                return (
                                    <div key={key} className="flex justify-between text-sm border-b border-gray-200 pb-1">
                                        <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="capitalize">{key}</span></div>
                                        <span className="font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
            <div className="flex justify-between px-6 py-4 border-t bg-gray-50 mt-auto">
                <Button variant="ghost" onClick={closeAll}>Cancelar</Button>
                <Button onClick={obras.handleSaveLinkTransactions} disabled={isLoading || !obras.selectedData} className="bg-[#1E1E1E] text-white border border-[#F5C800]">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Confirmar e Gerar"}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* 2. CATEGORY MODAL */}
      <Dialog open={modalsState.isCatOpen} onOpenChange={(v) => !v && closeAll()}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">{editingData.category ? "Editar Categoria" : "Nova Categoria"}
                    </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-6 space-y-4"><Label>Nome</Label><Input value={catForm.name} 
                 onChange={(e) => catForm.setName(e.target.value)} 
                 className="space-y-2" /></div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2"><Button variant="ghost" onClick={closeAll}>Cancelar</Button><Button onClick={catForm.handleSave} className="bg-[#F5C800] text-[#1E1E1E]">Salvar</Button></div>
        </DialogContent>
      </Dialog>

      {/* 3. SUBCATEGORY MODAL */}
      <Dialog open={modalsState.isSubOpen} onOpenChange={(v) => !v && closeAll()}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">{editingData.subcategory ? "Editar Subcategoria" : "Nova Subcategoria"}
                    </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-6 space-y-4">
                <div><Label>Nome</Label><Input value={subCatForm.name} onChange={(e) => subCatForm.setName(e.target.value)} className="mt-2" /></div>
                <div><Label>Categoria</Label><Select value={subCatForm.id} onValueChange={subCatForm.setName}><SelectTrigger className="mt-2"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2"><Button variant="ghost" onClick={closeAll}>Cancelar</Button><Button onClick={subCatForm.handleSave} className="bg-[#F5C800] text-[#1E1E1E]">Salvar</Button></div>
        </DialogContent>
      </Dialog>

      {/* 4. ACCOUNT MODAL */}
      <Dialog open={modalsState.isAccountOpen} onOpenChange={(v) => !v && closeAll()}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">{editingData.account ? "Editar Conta" : "Nova Conta"}
                    </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-6 space-y-4"><Label>Nome</Label><Input value={accountForm.name} onChange={(e) => accountForm.setName(e.target.value)} className="mt-2" /></div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2"><Button variant="ghost" onClick={closeAll}>Cancelar</Button><Button onClick={accountForm.handleSave} className="bg-[#1E1E1E] text-white border border-[#F5C800]">Salvar</Button></div>
        </DialogContent>
      </Dialog>

      {/* 5. DELETE MODAL */}
      <Dialog open={modalsState.isDeleteOpen} onOpenChange={(v) => !v && closeAll()}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">Excluir Item?
                </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-6 space-y-4"><p>Deseja excluir <strong>{editingData.toDelete?.name}</strong>?</p><p className="text-sm text-red-600 mt-2">Esta ação é irreversível.</p></div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2"><Button variant="ghost" onClick={closeAll}>Cancelar</Button><Button onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">Excluir</Button></div>
        </DialogContent>
      </Dialog>
    </>
  )
}