"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Pencil, Trash2, FolderTree, ArrowRight, Loader2, Landmark, Wallet } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { 
  createCategoryAction, updateCategoryAction, deleteCategoryAction,
  createSubcategoryAction, updateSubcategoryAction, deleteSubcategoryAction,
  createAccountAction, updateAccountAction, deleteAccountAction
} from "@/components/actions/categoriasActions"

type Category = { label: string; value: string }
type Subcategory = { id: string; name: string; categories_id: string }
type Account = { label: string; value: string }

interface PagamentosOptionsTableProps {
  categories: Category[]
  subcategories: Subcategory[]
  accounts?: Account[]
}


export function PagamentosOptionsTable({ categories, subcategories, accounts = [] }: PagamentosOptionsTableProps) {
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Estados de Edição/Seleção
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{id: string, name: string, catId: string} | null>(null)
  
  // Estado de edição de conta ajustado para value/label
  const [editingAccount, setEditingAccount] = useState<{value: string, label: string} | null>(null)
  
  const [itemToDelete, setItemToDelete] = useState<{type: 'cat' | 'sub' | 'account', id: string, name: string} | null>(null)

  // Inputs dos Forms
  const [catNameInput, setCatNameInput] = useState("")
  const [subNameInput, setSubNameInput] = useState("")
  const [subCatIdInput, setSubCatIdInput] = useState("")
  const [accountNameInput, setAccountNameInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const openNewCategory = () => {
    setEditingCategory(null)
    setCatNameInput("")
    setIsCatModalOpen(true)
  }

  const openEditCategory = (cat: Category) => {
    setEditingCategory({ id: cat.value, name: cat.label })
    setCatNameInput(cat.label)
    setIsCatModalOpen(true)
  }

  const openNewSubcategory = (preSelectedCatId?: string) => {
    setEditingSubcategory(null)
    setSubNameInput("")
    setSubCatIdInput(preSelectedCatId || "")
    setIsSubModalOpen(true)
  }

  const openEditSubcategory = (sub: Subcategory) => {
    setEditingSubcategory({ id: sub.id, name: sub.name, catId: sub.categories_id })
    setSubNameInput(sub.name)
    setSubCatIdInput(sub.categories_id)
    setIsSubModalOpen(true)
  }

  const openNewAccount = () => {
    setEditingAccount(null)
    setAccountNameInput("")
    setIsAccountModalOpen(true)
  }

  const openEditAccount = (acc: Account) => {
    setEditingAccount(acc)
    setAccountNameInput(acc.label)
    setIsAccountModalOpen(true)
  }

  const openDelete = (type: 'cat' | 'sub' | 'account', id: string, name: string) => {
    setItemToDelete({ type, id, name })
    setIsDeleteOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!catNameInput.trim()) return
    setIsLoading(true)
    
    const result = editingCategory 
      ? await updateCategoryAction(editingCategory.id, catNameInput)
      : await createCategoryAction(catNameInput)

    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Sucesso", description: `Categoria ${editingCategory ? "atualizada" : "criada"} com sucesso.` })
      setIsCatModalOpen(false)
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    }
  }

  const handleSaveSubcategory = async () => {
    if (!subNameInput.trim() || !subCatIdInput) return
    setIsLoading(true)

    const result = editingSubcategory
      ? await updateSubcategoryAction(editingSubcategory.id, subNameInput, subCatIdInput)
      : await createSubcategoryAction(subNameInput, subCatIdInput)

    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Sucesso", description: `Subcategoria ${editingSubcategory ? "atualizada" : "criada"} com sucesso.` })
      setIsSubModalOpen(false)
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    }
  }

  const handleSaveAccount = async () => {
    if (!accountNameInput.trim()) return
    setIsLoading(true)

    const result = editingAccount
      ? await updateAccountAction(editingAccount.value, accountNameInput)
      : await createAccountAction(accountNameInput)

    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Sucesso", description: `Conta ${editingAccount ? "atualizada" : "criada"} com sucesso.` })
      setIsAccountModalOpen(false)
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsLoading(true)

    let result;
    if (itemToDelete.type === 'cat') {
      result = await deleteCategoryAction(itemToDelete.id)
    } else if (itemToDelete.type === 'sub') {
      result = await deleteSubcategoryAction(itemToDelete.id)
    } else {
      result = await deleteAccountAction(itemToDelete.id)
    }

    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Deletado", description: `${itemToDelete.name} foi removido.` })
      setIsDeleteOpen(false)
    } else {
      toast({ title: "Erro ao excluir", description: result.error, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* SEÇÃO DE BANCOS / CONTAS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div>
            <h2 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                <Landmark className="h-6 w-6 text-[#F5C800]" />
                Gerenciar Bancos e Contas
            </h2>
            <p className="text-sm text-gray-500">Cadastre as contas bancárias onde as movimentações ocorrem.</p>
            </div>
            <div>
            <Button onClick={openNewAccount} className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90 font-bold border border-[#F5C800]">
                <Plus className="h-4 w-4 mr-2 text-[#F5C800]" /> Nova Conta
            </Button>
            </div>
        </div>

        {/* Grid de Bancos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.length === 0 ? (
                 <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 italic">Nenhuma conta bancária cadastrada.</p>
                 </div>
            ) : (
                accounts.map(acc => (
                    <Card key={acc.value} className="group border hover:border-[#F5C800] transition-all shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-[#F5C800]/10 p-2 rounded-full">
                                    <Wallet className="h-5 w-5 text-[#F5C800]" />
                                </div>
                                {/* ATUALIZADO: Exibindo acc.label */}
                                <span className="font-semibold text-gray-800 truncate" title={acc.label}>
                                    {acc.label}
                                </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => openEditAccount(acc)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                {/* ATUALIZADO: Passando acc.value como ID e acc.label como Nome */}
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => openDelete('account', acc.value, acc.label)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* ================= SEÇÃO DE CATEGORIAS ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div>
            <h2 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                <FolderTree className="h-6 w-6 text-[#F5C800]" />
                Configurar Categorias
            </h2>
            <p className="text-sm text-gray-500">Gerencie as categorias e subcategorias usadas nos lançamentos.</p>
            </div>
            <div className="flex gap-2">
            <Button onClick={() => openNewSubcategory()} variant="outline" className="border-dashed border-gray-400">
                <Plus className="h-4 w-4 mr-2" /> Nova Subcategoria
            </Button>
            <Button onClick={openNewCategory} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold">
                <Plus className="h-4 w-4 mr-2" /> Nova Categoria
            </Button>
            </div>
        </div>

        {/* Grid de Cards de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((cat) => {
            const catSubs = subcategories.filter(sub => sub.categories_id === cat.value)
            
            return (
                <Card key={cat.value} className="border-2 border-transparent hover:border-[#F5C800]/20 transition-all shadow-md overflow-hidden flex flex-col">
                <CardHeader className="bg-[#1E1E1E] py-3 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-[#F5C800] text-base font-bold flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {cat.label}
                    </CardTitle>
                    <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => openEditCategory(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-red-900/20" onClick={() => openDelete('cat', cat.value, cat.label)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 bg-white flex flex-col">
                    <div className="flex-1">
                        {catSubs.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm italic">
                                Nenhuma subcategoria vinculada.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {catSubs.map(sub => (
                                    <div key={sub.id} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 group">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="h-3 w-3 text-gray-300" />
                                            <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                                        </div>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEditSubcategory(sub)}>
                                                <Pencil className="h-3 w-3 text-blue-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openDelete('sub', sub.id, sub.name)}>
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t bg-gray-50">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 hover:text-[#1E1E1E] hover:bg-[#F5C800]/10" onClick={() => openNewSubcategory(cat.value)}>
                            <Plus className="h-3 w-3 mr-1" /> Adicionar Subcategoria
                        </Button>
                    </div>
                </CardContent>
                </Card>
            )
            })}
        </div>
      </div>

      {/* --- MODAL CATEGORIA --- */}
      <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    Defina o nome da categoria principal.
                </p>
            </DialogHeader>

            <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input 
                        value={catNameInput} 
                        onChange={(e) => setCatNameInput(e.target.value)} 
                        placeholder="Ex: Custos Fixos"
                        className="border-gray-300 focus:border-[#F5C800] focus:ring-[#F5C800]"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto rounded-b-lg">
                <Button variant="ghost" onClick={() => setIsCatModalOpen(false)} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
                    Cancelar
                </Button>
                <Button onClick={handleSaveCategory} disabled={isLoading} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[120px]">
                    {isLoading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL SUBCATEGORIA --- */}
      <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                    {editingSubcategory ? "Editar Subcategoria" : "Nova Subcategoria"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    Crie divisões específicas dentro de uma categoria.
                </p>
            </DialogHeader>

            <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                    <Label>Nome da Subcategoria</Label>
                    <Input 
                        value={subNameInput} 
                        onChange={(e) => setSubNameInput(e.target.value)} 
                        placeholder="Ex: Aluguel"
                        className="border-gray-300 focus:border-[#F5C800] focus:ring-[#F5C800]"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Pertence à Categoria</Label>
                    <Select value={subCatIdInput} onValueChange={setSubCatIdInput}>
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
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto rounded-b-lg">
                <Button variant="ghost" onClick={() => setIsSubModalOpen(false)} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
                    Cancelar
                </Button>
                <Button onClick={handleSaveSubcategory} disabled={isLoading} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[120px]">
                    {isLoading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- NOVO MODAL: CONTA BANCÁRIA --- */}
      <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                    {editingAccount ? "Editar Banco/Conta" : "Nova Conta Bancária"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    Cadastre o nome do banco ou carteira.
                </p>
            </DialogHeader>

            <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                    <Label>Nome da Conta</Label>
                    <Input 
                        value={accountNameInput} 
                        onChange={(e) => setAccountNameInput(e.target.value)} 
                        placeholder="Ex: Banco Itaú, Caixa Pequeno, Nubank"
                        className="border-gray-300 focus:border-[#F5C800] focus:ring-[#F5C800]"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto rounded-b-lg">
                <Button variant="ghost" onClick={() => setIsAccountModalOpen(false)} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
                    Cancelar
                </Button>
                <Button onClick={handleSaveAccount} disabled={isLoading} className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90 font-bold min-w-[120px] border border-[#F5C800]">
                    {isLoading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DELETE UNIFICADO --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[450px] flex flex-col p-0 bg-gray-100 gap-0">
            <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="text-xl font-bold text-red-600">
                    Excluir Item?
                </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-2">
                <div className="text-base text-gray-700 mb-4">
                     Você está prestes a excluir:
                </div>

                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm mb-4">
                     <p className="font-bold text-[#1E1E1E] text-lg">
                        {itemToDelete?.name}
                     </p>
                     <div className="mt-1 text-sm text-gray-500 font-mono capitalize">
                         Tipo: {
                            itemToDelete?.type === 'cat' ? 'Categoria' : 
                            itemToDelete?.type === 'sub' ? 'Subcategoria' : 'Conta Bancária'
                         }
                     </div>
                </div>

                <div className="text-sm text-gray-600">
                     <span className="text-red-600 font-semibold">Esta ação não pode ser desfeita.</span>
                     <br />
                     O registro será removido se não houver dados vinculados.
                </div>
            </div>

            <div className="flex justify-end items-center gap-3 px-6 py-4 bg-gray-100 mt-2 rounded-b-lg">
                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isLoading} className="hover:bg-gray-200">
                    Cancelar
                </Button>
                <Button onClick={handleConfirmDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      "Sim, excluir"
                    )}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}