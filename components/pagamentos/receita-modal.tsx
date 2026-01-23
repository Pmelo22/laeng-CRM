"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoneyInput } from "@/lib/utils"
import type { Pagamentos } from "@/lib/types"
import { useReceitaModals } from "./hooks/useReceitaModals"
import { Loader2, Search } from "lucide-react"
import { MEDICOES_MAP } from "./types/pagamentosTypes"

interface ReceitaModalProps {
    isOpen: boolean
    onClose: () => void
    pagamento?: Pagamentos | null
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
}

export function ReceitaModal({
    isOpen,
    onClose,
    pagamento,
}: ReceitaModalProps) {

    const {
        isEditing,
        formData,
        isSavingSingle,
        updateField,
        updateMoney,
        savePagamento,
        filteredObras,
        selectedObra,
        selectedObraId,
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
    } = useReceitaModals(isOpen, onClose, pagamento)

    // ---------------- RENDER ----------------

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
                    <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
                        {isEditing ? "Editar Receita" : "Nova Receita"}
                    </DialogTitle>
                    {!isEditing && (
                        <p className="text-sm text-muted-foreground">
                            Selecione um cliente para importar as medições da obra.
                        </p>
                    )}
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-10">

                    {/* --- EDIT MODE --- */}
                    {isEditing && (
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
                        </div>
                    )}

                    {/* --- NEW/IMPORT MODE --- */}
                    {!isEditing && (
                        <div className="space-y-6">

                            {/* Search Client */}
                            <div className="space-y-2 relative">
                                <Label className="text-base font-semibold">Cliente</Label>
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
                                        {filteredObras.length === 0 ? (
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

                                {/* Fallback Select if search is cleared, or just to show selected */}
                                {selectedObra && (
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex justify-between items-center text-blue-800">
                                        <span className="font-bold">{selectedObra.cliente_nome}</span>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedObraId(null)} className="h-6 text-blue-600 hover:text-blue-900">Trocar</Button>
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
                                        <Label className="uppercase text-xs font-bold text-gray-500 tracking-wider">Medições Disponíveis</Label>

                                        <div className="space-y-2">
                                            {Object.entries(measurements).map(([key, state]) => {
                                                const mapItem = MEDICOES_MAP[key]
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

                </div>

                <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
                    <Button variant="ghost" onClick={onClose} disabled={isSavingSingle || isSavingBulk} className="text-gray-500 hover:text-gray-900">
                        Cancelar
                    </Button>

                    {isEditing ? (
                        <Button onClick={savePagamento} disabled={isSavingSingle} className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]">
                            {isSavingSingle ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
                        </Button>
                    ) : (
                        <Button onClick={handleSaveBulk} disabled={isSavingBulk || !selectedObra || Object.keys(measurements).length === 0} className="bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]">
                            {isSavingBulk ? <Loader2 className="animate-spin" /> : "Gerar Receitas"}
                        </Button>
                    )}
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
