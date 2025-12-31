"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Pencil, Trash2, FolderTree, ArrowRight, Loader2, Landmark, Wallet, Link2, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { formatMoneyInput } from "@/lib/utils" // Certifique-se de ter essa função ou use formatação simples
import { 
  createCategoryAction, updateCategoryAction, deleteCategoryAction,
  createSubcategoryAction, updateSubcategoryAction, deleteSubcategoryAction,
  createAccountAction, updateAccountAction, deleteAccountAction,
  getObrasForLinkAction, createBulkTransactionsAction
} from "@/components/actions/categoriasActions"

// Mapeamento dos UUIDs das Subcategorias (Fixos conforme solicitado)
const OBRA_SUBCATEGORIES_MAP: Record<string, string> = {
  manutencao: "23264d1e-0936-4682-9d08-098015450f76",
  material: "534610b3-bf0e-49a1-bda5-18b1c6e4cb1d",
  empreiteiro: "5890a7ee-8714-4433-bed5-c317e6ccfcf0",
  pintor: "886292e3-92ee-4697-8e4a-9a5a371a79e8",
  gesseiro: "977872c4-dc01-406e-a233-e260624a3999",
  azulejista: "9ae93e09-def7-4cd8-9d38-41a34fb4d287",
  eletricista: "fb9e7584-bb23-4f56-9c36-6ead6cb9fa52"
}

type Category = { label: string; value: string }
type Subcategory = { id: string; name: string; categories_id: string }
type Account = { label: string; value: string }
type ObraData = {
  id: number
  cliente_id: number
  cliente_nome: string
  empreiteiro: number
  material: number
  pintor: number
  eletricista: number
  gesseiro: number
  azulejista: number
  manutencao: number
}

interface PagamentosOptionsTableProps {
  categories: Category[]
  subcategories: Subcategory[]
  accounts?: Account[]
}

export function PagamentosOptionsTable({ categories, subcategories, accounts = [] }: PagamentosOptionsTableProps) {
  
  // --- Estados Existentes ---
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{id: string, name: string, catId: string} | null>(null)
  const [editingAccount, setEditingAccount] = useState<{value: string, label: string} | null>(null)
  const [itemToDelete, setItemToDelete] = useState<{type: 'cat' | 'sub' | 'account', id: string, name: string} | null>(null)
  const [catNameInput, setCatNameInput] = useState("")
  const [subNameInput, setSubNameInput] = useState("")
  const [subCatIdInput, setSubCatIdInput] = useState("")
  const [accountNameInput, setAccountNameInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // --- NOVOS Estados para Link de Obras ---
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [obrasList, setObrasList] = useState<ObraData[]>([])
  const [selectedObraId, setSelectedObraId] = useState<string>("")
  const [selectedObraData, setSelectedObraData] = useState<ObraData | null>(null)
  
  // Form do Link
  const [linkFormData, setLinkFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    account_id: "",
    status: "not_pago",
    method: "pix",
    installments_total: 1,
    description_base: "Custo de Obra"
  })

  // --- Funções Auxiliares de Fetch ---
  const fetchObras = async () => {
    setIsLoading(true)
    const res = await getObrasForLinkAction()
    if (res.ok && res.data) {
      setObrasList(res.data)
    } else {
      toast({ title: "Erro", description: "Falha ao carregar obras.", variant: "destructive" })
    }
    setIsLoading(false)
  }

  const openLinkModal = () => {
    setLinkFormData({
      date: new Date().toISOString().split('T')[0],
      account_id: "",
      status: "not_pago",
      method: "pix",
      installments_total: 1,
      description_base: "Custo de Obra"
    })
    setSelectedObraId("")
    setSelectedObraData(null)
    setIsLinkModalOpen(true)
    fetchObras()
  }

  const handleSelectObra = (val: string) => {
    setSelectedObraId(val)
    const obra = obrasList.find(o => String(o.id) === val) || null
    setSelectedObraData(obra)
    if (obra) {
        setLinkFormData(prev => ({ ...prev, description_base: `Obra - ${obra.cliente_nome}` }))
    }
  }


  const handleSaveLinkTransactions = async () => {
    if (!selectedObraData || !linkFormData.account_id) {
      toast({ title: "Atenção", description: "Selecione a Obra e a Conta Bancária.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    const transactionsToInsert = []
    
    // Itera sobre as chaves mapeadas para verificar valores > 0
    for (const [key, uuid] of Object.entries(OBRA_SUBCATEGORIES_MAP)) {
      // key ex: 'pintor', 'material'
      const amount = selectedObraData[key as keyof ObraData] as number
      
      if (amount && amount > 0) {
        transactionsToInsert.push({
            subcategories_id: uuid,
            account_id: linkFormData.account_id,
            cliente_id: selectedObraData.cliente_id, // Pega o ID da tabela clientes
            type: 'despesa', // Sempre despesa
            status: linkFormData.status,
            amount: amount,
            description: `${linkFormData.description_base} - ${key.toUpperCase()}`,
            date: linkFormData.date,
            method: linkFormData.method,
            installments_current: 1,
            installments_total: linkFormData.installments_total,
            // created_at e updated_at automáticos pelo Supabase
        })
      }
    }

    if (transactionsToInsert.length === 0) {
        toast({ title: "Aviso", description: "Esta obra não possui custos registrados para importar." })
        setIsLoading(false)
        return
    }

    const res = await createBulkTransactionsAction(transactionsToInsert)
    
    setIsLoading(false)
    if (res.ok) {
        toast({ title: "Sucesso!", description: `${transactionsToInsert.length} lançamentos criados com sucesso.` })
        setIsLinkModalOpen(false)
    } else {
        toast({ title: "Erro", description: res.error, variant: "destructive" })
    }
  }

  // --- Funções Existentes (Mantidas) ---
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
    const result = editingCategory ? await updateCategoryAction(editingCategory.id, catNameInput) : await createCategoryAction(catNameInput)
    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Sucesso", description: `Categoria ${editingCategory ? "atualizada" : "criada"} com sucesso.` })
      setIsCatModalOpen(false)
    } else { toast({ title: "Erro", description: result.error, variant: "destructive" }) }
  }
  const handleSaveSubcategory = async () => {
    if (!subNameInput.trim() || !subCatIdInput) return
    setIsLoading(true)
    const result = editingSubcategory ? await updateSubcategoryAction(editingSubcategory.id, subNameInput, subCatIdInput) : await createSubcategoryAction(subNameInput, subCatIdInput)
    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Sucesso", description: `Subcategoria ${editingSubcategory ? "atualizada" : "criada"} com sucesso.` })
      setIsSubModalOpen(false)
    } else { toast({ title: "Erro", description: result.error, variant: "destructive" }) }
  }
  const handleSaveAccount = async () => {
    if (!accountNameInput.trim()) return
    setIsLoading(true)
    const result = editingAccount ? await updateAccountAction(editingAccount.value, accountNameInput) : await createAccountAction(accountNameInput)
    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Sucesso", description: `Conta ${editingAccount ? "atualizada" : "criada"} com sucesso.` })
      setIsAccountModalOpen(false)
    } else { toast({ title: "Erro", description: result.error, variant: "destructive" }) }
  }
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsLoading(true)
    let result;
    if (itemToDelete.type === 'cat') result = await deleteCategoryAction(itemToDelete.id)
    else if (itemToDelete.type === 'sub') result = await deleteSubcategoryAction(itemToDelete.id)
    else result = await deleteAccountAction(itemToDelete.id)
    setIsLoading(false)
    if (result.ok) {
      toast({ title: "Deletado", description: `${itemToDelete.name} foi removido.` })
      setIsDeleteOpen(false)
    } else { toast({ title: "Erro ao excluir", description: result.error, variant: "destructive" }) }
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* ================= SEÇÃO DE LINK COM OBRAS (NOVO) ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F5C800]/10 p-4 rounded-lg shadow-sm border border-[#F5C800]/30">
            <div>
                <h2 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                    <Link2 className="h-6 w-6 text-[#F5C800]" />
                    Vincular Custos de Obra
                </h2>
                <p className="text-sm text-gray-600">Importe custos (material, mão de obra) registrados em Obras diretamente para o Financeiro.</p>
            </div>
            <div>
                <Button onClick={openLinkModal} className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90 font-bold border border-[#F5C800] shadow-md">
                    <Plus className="h-4 w-4 mr-2 text-[#F5C800]" /> Importar da Obra
                </Button>
            </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />

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
            <Button onClick={openNewAccount} className="bg-white text-[#1E1E1E] hover:bg-gray-100 font-bold border border-gray-300">
                <Plus className="h-4 w-4 mr-2" /> Nova Conta
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
                                <span className="font-semibold text-gray-800 truncate" title={acc.label}>
                                    {acc.label}
                                </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => openEditAccount(acc)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
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

        {/* Grid de Categorias (Mantido idêntico) */}
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

      {/* --- MODAL DE LINK COM OBRAS (NOVO) --- */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 bg-white">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                    Importar Custos da Obra
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    Selecione um cliente para gerar os lançamentos financeiros automaticamente.
                </p>
            </DialogHeader>

            <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">
                
                {/* Seleção do Cliente */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Qual cliente deseja linkar?</Label>
                    <Select value={selectedObraId} onValueChange={handleSelectObra}>
                        <SelectTrigger className="border-gray-300 focus:ring-[#F5C800] text-lg py-6">
                            <SelectValue placeholder="Selecione o Cliente / Obra..." />
                        </SelectTrigger>
                        <SelectContent>
                            {obrasList.length === 0 ? (
                                <SelectItem value="0" disabled>Nenhuma obra com custos encontrada</SelectItem>
                            ) : (
                                obrasList.map(obra => (
                                    <SelectItem key={obra.id} value={String(obra.id)}>
                                        {obra.cliente_nome} (Cód: {String(obra.id).padStart(3,'0')})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {selectedObraData && (
                    <>
                        <div className="h-[1px] bg-gray-200"></div>

                        {/* Dados de Configuração dos Lançamentos */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Configuração Geral dos Lançamentos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Descrição Base</Label>
                                    <Input 
                                        value={linkFormData.description_base} 
                                        onChange={e => setLinkFormData(prev => ({...prev, description_base: e.target.value}))}
                                        className="border-gray-300 focus:border-[#F5C800]"
                                    />
                                    <p className="text-xs text-gray-400">Ex: "Obra X - PINTOR"</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Conta / Banco de Saída</Label>
                                    <Select 
                                        value={linkFormData.account_id} 
                                        onValueChange={v => setLinkFormData(prev => ({...prev, account_id: v}))}
                                    >
                                        <SelectTrigger className="border-gray-300 focus:ring-[#F5C800]">
                                            <SelectValue placeholder="Selecione a conta..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(a => (
                                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Data dos Lançamentos</Label>
                                    <Input 
                                        type="date"
                                        value={linkFormData.date} 
                                        onChange={e => setLinkFormData(prev => ({...prev, date: e.target.value}))}
                                        className="border-gray-300 focus:border-[#F5C800]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Método de Pagamento</Label>
                                    <Select 
                                        value={linkFormData.method} 
                                        onValueChange={v => setLinkFormData(prev => ({...prev, method: v}))}
                                    >
                                        <SelectTrigger className="border-gray-300 focus:ring-[#F5C800]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pix">PIX</SelectItem>
                                            <SelectItem value="boleto">Boleto</SelectItem>
                                            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                            <SelectItem value="transferencia">Transferência</SelectItem>
                                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Status</Label>
                                    <Select 
                                        value={linkFormData.status} 
                                        onValueChange={v => setLinkFormData(prev => ({...prev, status: v}))}
                                    >
                                        <SelectTrigger className={`border-gray-300 focus:ring-[#F5C800] ${linkFormData.status === 'pago' ? 'text-green-600' : 'text-orange-600'}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pago" className="text-green-600">Efetuado / Pago</SelectItem>
                                            <SelectItem value="not_pago" className="text-orange-600">Pendente / Agendado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Qtde Parcelas (Total)</Label>
                                    <Input 
                                        type="number"
                                        min={1}
                                        value={linkFormData.installments_total} 
                                        onChange={e => setLinkFormData(prev => ({...prev, installments_total: Number(e.target.value)}))}
                                        className="border-gray-300 focus:border-[#F5C800]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] bg-gray-200"></div>

                        {/* Preview dos Itens */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Itens a serem gerados</h3>
                            <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-100">
                                {Object.keys(OBRA_SUBCATEGORIES_MAP).map(key => {
                                    const val = selectedObraData[key as keyof ObraData] as number
                                    if(!val || val <= 0) return null;
                                    return (
                                        <div key={key} className="flex justify-between items-center text-sm p-2 border-b border-gray-100 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span className="font-medium capitalize text-gray-700">{key}</span>
                                            </div>
                                            <span className="font-mono font-bold text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                                            </span>
                                        </div>
                                    )
                                })}
                                {Object.keys(OBRA_SUBCATEGORIES_MAP).every(key => !(selectedObraData[key as keyof ObraData] as number)) && (
                                    <p className="text-center text-gray-500 italic">Nenhum custo encontrado nesta obra.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto rounded-b-lg">
                <Button variant="ghost" onClick={() => setIsLinkModalOpen(false)} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSaveLinkTransactions} 
                    disabled={isLoading || !selectedObraData} 
                    className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90 font-bold min-w-[150px] border border-[#F5C800]"
                >
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
                    ) : (
                        "Confirmar e Gerar"
                    )}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAIS DE CRUD (CATEGORIAS/SUB/CONTA/DELETE) MANTIDOS IGUAIS AO ORIGINAL (CÓDIGO OMITIDO POR BREVIDADE, MAS DEVEM ESTAR AQUI) --- */}
      {/* ... Inclua aqui os Dialogs de Category, Subcategory, Account e Delete como estavam no seu código original ... */}
      
      {/* --- MODAL CATEGORIA (REPETIDO PARA COMPLETUDE) --- */}
      <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={catNameInput} onChange={(e) => setCatNameInput(e.target.value)} className="border-gray-300 focus:border-[#F5C800]" />
                </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2">
                <Button variant="ghost" onClick={() => setIsCatModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveCategory} className="bg-[#F5C800] text-[#1E1E1E] font-bold">Salvar</Button>
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
            </DialogHeader>
            <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={subNameInput} onChange={(e) => setSubNameInput(e.target.value)} className="border-gray-300 focus:border-[#F5C800]" />
                </div>
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={subCatIdInput} onValueChange={setSubCatIdInput}>
                        <SelectTrigger className="border-gray-300 focus:ring-[#F5C800]"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2">
                <Button variant="ghost" onClick={() => setIsSubModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveSubcategory} className="bg-[#F5C800] text-[#1E1E1E] font-bold">Salvar</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL CONTA --- */}
      <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                    {editingAccount ? "Editar Conta" : "Nova Conta"}
                </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={accountNameInput} onChange={(e) => setAccountNameInput(e.target.value)} className="border-gray-300 focus:border-[#F5C800]" />
                </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2">
                <Button variant="ghost" onClick={() => setIsAccountModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveAccount} className="bg-[#1E1E1E] text-white font-bold border border-[#F5C800]">Salvar</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DELETE --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[450px] flex flex-col p-0 bg-gray-100 gap-0">
            <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="text-xl font-bold text-red-600">Excluir Item?</DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4">
                <p className="mb-4">Deseja excluir <strong>{itemToDelete?.name}</strong>?</p>
                <p className="text-sm text-red-600 font-semibold">Esta ação é irreversível.</p>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-100 gap-2">
                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                <Button onClick={handleConfirmDelete} className="bg-red-600 text-white font-bold hover:bg-red-700">Excluir</Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}