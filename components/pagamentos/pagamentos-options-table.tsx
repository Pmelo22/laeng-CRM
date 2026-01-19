"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Pencil, Trash2, FolderTree, ArrowRight, Link2 } from "lucide-react"
import { Category, Subcategory } from "./types/pagamentosTypes"
import { PagamentosModals } from "./pagamentos-options-modal"
import { usePagamentosModals } from "./hooks/usePagamentosTableModals"

interface PagamentosOptionsTableProps {
    categories: Category[]
    subcategories: Subcategory[]
}

export function PagamentosOptionsTable({ categories, subcategories }: PagamentosOptionsTableProps) {

    const { modalsState, setModalsState, editingData, handlers } = usePagamentosModals()

    const { openFinanceiroLinkModal, openLinkModal, openNewCategory, openEditCategory, openNewSubcategory, openEditSubcategory, openDelete } = handlers

    return (
        <div className="space-y-8 pb-20">

            {/* 1. VINCULAR COM OBRAS */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F5C800]/10 p-4 rounded-lg shadow-sm border border-[#F5C800]/30">
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                            <Link2 className="h-6 w-6 text-[#F5C800]" />
                            Vincular Custos de Obra
                        </h2>
                        <p className="text-sm text-gray-600">Importe custos (material, pintor, etc.) registrados em Obras diretamente para Pagamentos</p>
                    </div>
                    <div>
                        <Button onClick={openLinkModal} className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90 font-bold border border-[#F5C800] shadow-md">
                            <Plus className="h-4 w-4 mr-2 text-[#F5C800]" /> Importar da Obra
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* 1. VINCULAR COM FINCANCEIRO */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F5C800]/10 p-4 rounded-lg shadow-sm border border-[#F5C800]/30">
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                            <Link2 className="h-6 w-6 text-[#F5C800]" />
                            Vincular Receitas do Cliente
                        </h2>
                        <p className="text-sm text-gray-600">Importe receitas (entrada, valor financiado, subsídio) registrados em Clientes diretamente para Pagamentos.</p>
                    </div>
                    <div>
                        <Button onClick={openFinanceiroLinkModal} className="bg-[#1E1E1E] text-white hover:bg-[#1E1E1E]/90 font-bold border border-[#F5C800] shadow-md">
                            <Plus className="h-4 w-4 mr-2 text-[#F5C800]" /> Importar do Cliente
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* 3. CATEGORIAS */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                            <FolderTree className="h-6 w-6 text-[#F5C800]" />
                            Configurar Categorias
                        </h2>
                        <p className="text-sm text-gray-500">Gerencie as categorias e subcategorias usadas nos lançamentos.</p>
                    </div>
                    <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-2">
                        <Button onClick={() => openNewSubcategory()} variant="outline" className="border-dashed border-gray-400">
                            <Plus className="h-4 w-4 mr-2" /> Nova Subcategoria
                        </Button>
                        <Button onClick={openNewCategory} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold">
                            <Plus className="h-4 w-4 mr-2" /> Nova Categoria
                        </Button>
                    </div>
                </div>

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
                                                        <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-blue-600" onClick={() => openEditSubcategory(sub)}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => openDelete('sub', sub.id, sub.name)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>

                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 border-t bg-gray-50">
                                        <Button onClick={() => openNewSubcategory(cat.value)} variant="outline" className="border-dashed border-gray-400">
                                            <Plus className="h-4 w-4 mr-2" /> Adicionar Subcategoria
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            <PagamentosModals
                categories={categories}
                modalsState={modalsState}
                setModalsState={setModalsState}
                editingData={editingData}
            />

        </div>
    )
}