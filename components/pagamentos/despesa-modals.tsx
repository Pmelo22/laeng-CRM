"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput } from "@/lib/utils"
import type { Pagamentos } from "@/lib/types"
import { useDespesasModals } from "./hooks/useDespesasModals"
import { Loader2, Search, HardHat, ChevronLeft, Plus } from "lucide-react"
import { DESPESAS_OBRAS_MAP, OBRA_CATEGORY_ID } from "./types/pagamentosTypes"

interface DespesaModalsProps {
    isOpen: boolean
    onClose: () => void
    pagamento?: Pagamentos | null
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
}

export function DespesaModals({
    isOpen,
    onClose,
    pagamento,
    categories,
    subcategories
}: DespesaModalsProps) {

    const {
        isEditing,
        formData,
        isSavingSingle,
        updateField,
        updateMoney,
        savePagamento,

        mode,
        setMode,
        loadingObras,
        filteredObras,
        selectedObra,
        setSelectedObraId,
        searchTerm,
        setSearchTerm,
        selectFromSearch,
        importDate,
        setImportDate,
        measurements,
        toggleMeasurement,
        updateMeasurementValue,
        isSavingBulk,
        handleSaveBulk
    } = useDespesasModals(isOpen, onClose, pagamento)

    // Filter subcategories for General Mode
    const filteredSubcategories = subcategories.filter(
        sub => sub.categories_id === formData.category_id
    )

    // Filter Categories to exclude OBRA if needed
    const availableCategories = categories.filter(c => {
        // If we are in 'general' mode (New Outra Despesa), exclude Obra
        if (mode === 'general') return c.value !== OBRA_CATEGORY_ID

        // If editing and current category is NOT Obra, exclude Obra (prevent switching to Obra)
        if (isEditing && formData.category_id !== OBRA_CATEGORY_ID) return c.value !== OBRA_CATEGORY_ID

        // Otherwise (Editing an Obra despesa), allow it (though we might hide the field)
        return true
    })

    // Determine Title
    const getTitle = () => {
        if (isEditing) return "Editar Despesa"
        if (mode === 'initial') return "Nova Despesa"
        if (mode === 'obras') return "Registrar Despesa de Obra"
        if (mode === 'general') return "Adicionar Outra Despesa"
        return "Despesa"
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        {!isEditing && mode !== 'initial' && (
                            <Button variant="ghost" size="icon" onClick={() => setMode('initial')} className="h-8 w-8 -ml-2">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                            {getTitle()}
                        </DialogTitle>
                    </div>
                    {mode === 'initial' && !isEditing && (
                        <p className="text-sm text-muted-foreground">
                            Escolha o tipo de despesa que deseja registrar.
                        </p>
                    )}
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">

                    {/* --- INITIAL MODE (SELECTION) --- */}
                    {!isEditing && mode === 'initial' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-8">
                            <button
                                onClick={() => setMode('obras')}
                                className="flex flex-col items-center justify-start h-full p-8 gap-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#F5C800] hover:bg-yellow-50/50 transition-all group"
                            >
                                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-[#F5C800] transition-colors shrink-0">
                                    <HardHat className="h-8 w-8 text-yellow-700 group-hover:text-black" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">Obras</h3>
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('general')}
                                className="flex flex-col items-center justify-start h-full p-8 gap-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all group"
                            >
                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors shrink-0">
                                    <Plus className="h-8 w-8 text-gray-600 group-hover:text-black" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">Empresa</h3>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* --- OBRAS MODE --- */}
                    {!isEditing && mode === 'obras' && (
                        <div className="space-y-6">
                            {/* Search Client */}
                            <div className="space-y-2 relative">
                                <Label className="text-base font-semibold">Cliente / Obra</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar cliente por nome..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 border-gray-300 focus:border-[#F5C800]"
                                    />
                                </div>

                                {searchTerm.length >= 3 && (
                                    <div className="mt-1 w-full z-50 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                                        {loadingObras ? (
                                            <div className="p-4 text-center">
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#F5C800]" />
                                            </div>
                                        ) : filteredObras.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Nenhum cliente encontrado.</div>
                                        ) : (
                                            filteredObras.map(obra => (
                                                <div
                                                    key={obra.id}
                                                    onClick={() => selectFromSearch(String(obra.id))}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-[#1E1E1E] border-b border-gray-100 last:border-0 transition-colors"
                                                >
                                                    {obra.cliente_nome}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Selected Obra Display */}
                                {selectedObra && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex justify-between items-center text-yellow-900">
                                        <span className="font-bold">{selectedObra.cliente_nome}</span>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedObraId(null)} className="h-6 text-yellow-700 hover:text-yellow-950 hover:bg-yellow-100">Trocar</Button>
                                    </div>
                                )}
                            </div>

                            {selectedObra && (
                                <>
                                    <div className="h-[1px] bg-gray-200"></div>

                                    <div className="space-y-1">
                                        <Label>Data do Registro</Label>
                                        <Input type="date" value={importDate} onChange={e => setImportDate(e.target.value)} />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="uppercase text-xs font-bold text-gray-500 tracking-wider">Elementos da Obra</Label>

                                        <div className="space-y-2">
                                            {Object.entries(measurements).map(([key, state]) => {
                                                const mapItem = DESPESAS_OBRAS_MAP[key]
                                                return (
                                                    <div
                                                        key={key}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${state.enabled
                                                            ? 'bg-yellow-50 border-yellow-200'
                                                            : 'bg-gray-50 border-gray-300 opacity-60'
                                                            }`}
                                                    >
                                                        <Checkbox
                                                            checked={state.enabled}
                                                            onCheckedChange={() => toggleMeasurement(key)}
                                                            className="border-2 border-gray-600 data-[state=checked]:border-[#F5C800] data-[state=checked]:bg-[#F5C800] data-[state=unchecked]:bg-gray-400"
                                                        />
                                                        <div className="flex-1 text-sm font-medium">{mapItem.name}</div>
                                                        <Input
                                                            className="w-32 h-8 text-right font-mono"
                                                            value={formatMoneyInput(state.value)}
                                                            onChange={e => updateMeasurementValue(key, e.target.value)}
                                                            disabled={!state.enabled}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* --- GENERAL MODE / EDIT MODE --- */}
                    {(isEditing || mode === 'general') && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Valor (R$)</Label>
                                    <Input
                                        value={formatMoneyInput(formData.amount)}
                                        onChange={e => updateMoney(e.target.value)}
                                        className="border-gray-300 focus:border-[#F5C800] font-mono text-lg font-bold text-gray-800"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Data</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => updateField('date', e.target.value)}
                                        className="border-gray-300 focus:border-[#F5C800]"
                                    />
                                </div>
                            </div>

                            {/* Classification - Only show if NOT editing an Obra expense */}
                            {(!isEditing || formData.category_id !== OBRA_CATEGORY_ID) && (
                                <div>
                                    <div className="h-[1px] bg-gray-200"></div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Classificação</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                                                    {availableCategories.map(c => (
                                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

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
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
                    <Button variant="ghost" onClick={onClose} disabled={isSavingSingle || isSavingBulk} className="text-gray-500 hover:text-gray-900">
                        Cancelar
                    </Button>

                    {isEditing || mode === 'general' ? (
                        <Button onClick={savePagamento} disabled={isSavingSingle} className="bg-[#E53935] text-white hover:bg-[#D32F2F] font-bold min-w-[150px]">
                            {isSavingSingle ? <Loader2 className="animate-spin" /> : (isEditing ? "Salvar Alterações" : "Salvar Despesa")}
                        </Button>
                    ) : mode === 'obras' ? (
                        <Button onClick={handleSaveBulk} disabled={isSavingBulk || !selectedObra || Object.keys(measurements).length === 0} className="bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]">
                            {isSavingBulk ? <Loader2 className="animate-spin" /> : "Gerar Despesas"}
                        </Button>
                    ) : null}
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
