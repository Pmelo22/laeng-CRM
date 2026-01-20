"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

import {
    Category,
    ObraData,
    OBRA_SUBCATEGORIES_MAP,
    FINANCEIRO_SUBCATEGORIES_MAP,
    modalsState,
    editingData
} from "./types/pagamentosTypes"

import { useCategoryForm, useSubCategoryForm } from "./hooks/usePagementosOptionsModals"
import { useObras } from "./hooks/useObras"
import { deleteCategoryAction } from "./actions/categoriasActions"
import { deleteSubcategoryAction } from "./actions/subcategoriasActions"
import { useFinanceiro } from "./hooks/useFinanceiro"

interface PagamentosModalsProps {
    categories: Category[]
    modalsState: modalsState
    setModalsState: React.Dispatch<React.SetStateAction<modalsState>>
    editingData: editingData
}

export function PagamentosModals({
    categories,
    modalsState,
    setModalsState,
    editingData
}: PagamentosModalsProps) {

    const closeAll = () => {
        setModalsState({
            isCatOpen: false,
            isSubOpen: false,
            isDeleteOpen: false,
            isLinkOpen: false,
            isFinanceiroLinkOpen: false
        })
    }

    const [isLoading, setIsLoading] = useState(false)

    //Forms
    const catForm = useCategoryForm(editingData, modalsState.isCatOpen, closeAll)
    const subCatForm = useSubCategoryForm(editingData, modalsState.isSubOpen, closeAll)

    //Obras (Custos)
    const obras = useObras(modalsState.isLinkOpen, closeAll)

    //Financeiro (Receitas)
    const financeiro = useFinanceiro(modalsState.isFinanceiroLinkOpen, closeAll)

    // --- LÓGICA DE BUSCA: OBRAS ---
    const [searchObra, setSearchObra] = useState("")
    const searchContainerRef = useRef<HTMLDivElement>(null)

    const filteredObras = searchObra.length >= 3
        ? obras.list.filter(obra =>
            obra.cliente_nome.toLowerCase().includes(searchObra.toLowerCase())
        )
        : []

    const handleSelectFromSearch = (id: string) => {
        obras.handleSelectObra(id)
        setSearchObra("")
    }

    // --- LÓGICA DE BUSCA: FINANCEIRO ---
    const [searchFinanceiro, setSearchFinanceiro] = useState("")
    const searchFinanceiroRef = useRef<HTMLDivElement>(null)

    const filteredFinanceiro = searchFinanceiro.length >= 3
        ? financeiro.list.filter(item =>
            item.cliente_nome.toLowerCase().includes(searchFinanceiro.toLowerCase())
        )
        : []

    const handleSelectFinanceiroFromSearch = (id: string) => {
        financeiro.handleSelectObra(id)
        setSearchFinanceiro("")
    }

    // Click Outside Effect para fechar os search dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Para Obras
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSearchObra("")
            }
            // Para Financeiro
            if (searchFinanceiroRef.current && !searchFinanceiroRef.current.contains(event.target as Node)) {
                setSearchFinanceiro("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    //Delete
    const handleConfirmDelete = async () => {
        const item = editingData.toDelete
        if (!item) return
        setIsLoading(true)
        let result;
        if (item.type === 'cat') result = await deleteCategoryAction(item.id)
        else if (item.type === 'sub') result = await deleteSubcategoryAction(item.id)
        else result = { ok: false, error: 'Tipo desconhecido' }

        setIsLoading(false)
        if (result.ok) {
            toast({ title: "Deletado", description: `${item.name} foi removido.` })
            closeAll()
        } else { toast({ title: "Erro ao excluir", description: result.error, variant: "destructive" }) }
    }


    return (
        <>
            {/* 1. LINK MODAL (OBRAS - CUSTOS) */}
            <Dialog open={modalsState.isLinkOpen} onOpenChange={(v) => { if (!v) closeAll(); setSearchObra(""); }}>
                <DialogContent className="max-w-3xl max-h-[120vh] flex flex-col p-0 bg-white">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                        <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">Importar Custos da Obra</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">
                        <div className="space-y-2" ref={searchContainerRef}>
                            <Label className="text-base font-semibold">Qual cliente deseja importar?</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Digite o nome do cliente..."
                                    value={searchObra}
                                    onChange={(e) => setSearchObra(e.target.value)}
                                    className="mb-2 border-gray-300 focus:ring-[#F5C800]"
                                />
                                {searchObra.length >= 3 && (
                                    <div className="absolute top-full left-0 w-full z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                        {filteredObras.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Nenhum cliente encontrado.</div>
                                        ) : (
                                            filteredObras.map(obra => (
                                                <div
                                                    key={obra.id}
                                                    onClick={() => handleSelectFromSearch(String(obra.id))}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#1E1E1E] border-b border-gray-50 last:border-0 transition-colors"
                                                >
                                                    {obra.cliente_nome}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <Select value={obras.selectedId} onValueChange={obras.handleSelectObra}>
                                <SelectTrigger className="border-gray-300 focus:ring-[#F5C800] text-lg py-6 bg-gray-50">
                                    <SelectValue placeholder="Selecione o Cliente / Obra..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {obras.list.map(obra => (
                                        <SelectItem key={obra.id} value={String(obra.id)}>{obra.cliente_nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {obras.selectedData && (
                            <>
                                <div className="h-[1px] bg-gray-200"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Descrição Base</Label><Input value={obras.linkFormData.description_base} onChange={e => obras.setLinkFormData(prev => ({ ...prev, description_base: e.target.value }))} /></div>

                                    <div className="space-y-1"><Label>Data</Label><Input type="date" value={obras.linkFormData.date} onChange={e => obras.setLinkFormData(prev => ({ ...prev, date: e.target.value }))} /></div>
                                    <div className="space-y-1"><Label>Método</Label><Select value={obras.linkFormData.method} onValueChange={v => obras.setLinkFormData(prev => ({ ...prev, method: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="boleto">Boleto</SelectItem><SelectItem value="cartao_credito">Cartão</SelectItem><SelectItem value="transferencia">Transferência</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem></SelectContent></Select></div>
                                    <div className="space-y-1"><Label>Status</Label><Select value={obras.linkFormData.status} onValueChange={v => obras.setLinkFormData(prev => ({ ...prev, status: v }))}><SelectTrigger className={obras.linkFormData.status === 'pago' ? 'text-green-600' : 'text-orange-600'}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pago">Pago</SelectItem><SelectItem value="not_pago">Pendente</SelectItem></SelectContent></Select></div>
                                    <div className="space-y-1"><Label>Parcelas</Label><Input type="number" min={1} value={obras.linkFormData.installments_total} onChange={e => obras.setLinkFormData(prev => ({ ...prev, installments_total: Number(e.target.value) }))} /></div>
                                </div>
                                <div className="h-[1px] bg-gray-200"></div>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-2">
                                    {Object.keys(OBRA_SUBCATEGORIES_MAP).map(key => {
                                        const val = obras.selectedData?.[key as keyof ObraData] as number
                                        if (!val || val <= 0) return null;
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

            {/* 2. FINANCEIRO LINK MODAL (RECEITAS) */}
            <Dialog open={modalsState.isFinanceiroLinkOpen} onOpenChange={(v) => { if (!v) closeAll(); setSearchFinanceiro(""); }}>
                <DialogContent className="max-w-3xl max-h-[120vh] flex flex-col p-0 bg-white">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                        <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">Importar Receitas da Obra</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">

                        <div className="space-y-2" ref={searchFinanceiroRef}>
                            <Label className="text-base font-semibold">Qual cliente deseja importar?</Label>

                            <div className="relative">
                                <Input
                                    placeholder="Digite o nome do cliente..."
                                    value={searchFinanceiro}
                                    onChange={(e) => setSearchFinanceiro(e.target.value)}
                                    className="mb-2 border-gray-300 focus:ring-[#F5C800]"
                                />

                                {searchFinanceiro.length >= 3 && (
                                    <div className="absolute top-full left-0 w-full z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                        {filteredFinanceiro.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">
                                                Nenhum cliente encontrado.
                                            </div>
                                        ) : (
                                            filteredFinanceiro.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleSelectFinanceiroFromSearch(String(item.id))}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#1E1E1E] border-b border-gray-50 last:border-0 transition-colors"
                                                >
                                                    {item.cliente_nome}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <Select value={financeiro.selectedId} onValueChange={financeiro.handleSelectObra}>
                                <SelectTrigger className="border-gray-300 focus:ring-[#F5C800] text-lg py-6 bg-gray-50">
                                    <SelectValue placeholder="Selecione o Cliente / Obra..." />
                                </SelectTrigger>

                                <SelectContent>
                                    {financeiro.list.map(item => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            {item.cliente_nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {financeiro.selectedData && (
                            <>
                                <div className="h-[1px] bg-gray-200"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Descrição Base</Label><Input value={financeiro.linkFormData.description_base} onChange={e => financeiro.setLinkFormData(prev => ({ ...prev, description_base: e.target.value }))} /></div>

                                    <div className="space-y-1"><Label>Data</Label><Input type="date" value={financeiro.linkFormData.date} onChange={e => financeiro.setLinkFormData(prev => ({ ...prev, date: e.target.value }))} /></div>
                                    <div className="space-y-1"><Label>Método</Label><Select value={financeiro.linkFormData.method} onValueChange={v => financeiro.setLinkFormData(prev => ({ ...prev, method: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="boleto">Boleto</SelectItem><SelectItem value="cartao_credito">Cartão</SelectItem><SelectItem value="transferencia">Transferência</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem></SelectContent></Select></div>
                                    <div className="space-y-1"><Label>Status</Label><Select value={financeiro.linkFormData.status} onValueChange={v => financeiro.setLinkFormData(prev => ({ ...prev, status: v }))}><SelectTrigger className={financeiro.linkFormData.status === 'pago' ? 'text-green-600' : 'text-orange-600'}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pago">Pago</SelectItem><SelectItem value="not_pago">Pendente</SelectItem></SelectContent></Select></div>
                                    <div className="space-y-1"><Label>Parcelas</Label><Input type="number" min={1} value={financeiro.linkFormData.installments_total} onChange={e => financeiro.setLinkFormData(prev => ({ ...prev, installments_total: Number(e.target.value) }))} /></div>
                                </div>
                                <div className="h-[1px] bg-gray-200"></div>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-2">
                                    <p className="text-xs font-bold text-[#1E1E1E] uppercase mb-2">Resumo das Receitas (Prévia)</p>
                                    {Object.keys(FINANCEIRO_SUBCATEGORIES_MAP).map(key => {
                                        const val = financeiro.selectedData?.[key as keyof ObraData] as number
                                        if (!val || val <= 0) return null;
                                        return (
                                            <div key={key} className="flex justify-between text-sm border-b border-gray-200 pb-1 last:border-0">
                                                <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="capitalize">{key.replace('_', ' ')}</span></div>
                                                <span className="font-mono font-bold text-[#1E1E1E]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-between px-6 py-4 border-t bg-gray-50 mt-auto">
                        <Button variant="ghost" onClick={closeAll}>Cancelar</Button>
                        <Button onClick={financeiro.handleSaveLinkTransactions} disabled={isLoading || !financeiro.selectedData} className="bg-[#1E1E1E] text-white border border-[#F5C800]">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Gerar Receitas"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3. CATEGORY MODAL */}
            <Dialog open={modalsState.isCatOpen} onOpenChange={(v) => !v && closeAll()}>
                <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                        <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">{editingData.subcategory?.catId && editingData.subcategory.name ? "Editar Categoria" : "Nova Categoria"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-6 space-y-4"><Label>Nome</Label><Input value={catForm.name}
                        onChange={(e) => catForm.setName(e.target.value)}
                        className="space-y-2" /></div>
                    <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2"><Button variant="ghost" onClick={closeAll}>Cancelar</Button><Button onClick={catForm.handleSave} className="bg-[#F5C800] text-[#1E1E1E]">Salvar</Button></div>
                </DialogContent>
            </Dialog>

            {/* 4. SUBCATEGORY MODAL */}
            <Dialog open={modalsState.isSubOpen} onOpenChange={(v) => !v && closeAll()}>
                <DialogContent className="sm:max-w-[500px] flex flex-col p-0 bg-white gap-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                        <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">{editingData.subcategory?.id ? "Editar Subcategoria" : "Nova Subcategoria"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-6 space-y-4">
                        <div><Label>Nome</Label><Input value={subCatForm.name} onChange={(e) => subCatForm.setName(e.target.value)} className="mt-2" /></div>
                        <div><Label>Categoria</Label><Select value={subCatForm.id} onValueChange={subCatForm.setId}><SelectTrigger className="mt-2"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="flex justify-end px-6 py-4 border-t bg-gray-50 gap-2"><Button variant="ghost" onClick={closeAll}>Cancelar</Button><Button onClick={subCatForm.handleSave} className="bg-[#F5C800] text-[#1E1E1E]">Salvar</Button></div>
                </DialogContent>
            </Dialog>

            {/* 6. DELETE MODAL */}
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