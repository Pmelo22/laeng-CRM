"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"
import type { Pagamentos } from "@/lib/types"
import { usePagamentoForm } from "./hooks/usePagamentoForm"
import { getObrasForReceitaAction, createBulkTransactionsAction } from "./actions/financeiroActions"
import { toast } from "@/hooks/use-toast"
import { Loader2, Search, CheckCircle2 } from "lucide-react"
import { MEDICOES_MAP } from "./types/pagamentosTypes"

interface ReceitaModalProps {
    isOpen: boolean
    onClose: () => void
    pagamento?: Pagamentos | null
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
}

interface MeasurementState {
    enabled: boolean
    value: number
    originalValue: number
}

export function ReceitaModal({
    isOpen,
    onClose,
    pagamento,
    categories,
    subcategories
}: ReceitaModalProps) {

    const isEditing = !!pagamento

    // --- EDIT MODE LOGIC (Single Transaction) ---
    const {
        formData,
        isLoading: isSavingSingle,
        updateField,
        updateMoney,
        savePagamento
    } = usePagamentoForm(isOpen, onClose, pagamento)

    // Force type to 'receita' in edit mode
    useEffect(() => {
        if (isEditing && formData.type !== 'receita') {
            updateField('type', 'receita')
        }
    }, [isEditing, formData.type])


    // --- NEW MODE LOGIC (Import/Bulk) ---
    const [loadingObras, setLoadingObras] = useState(false)
    const [obrasList, setObrasList] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedObraId, setSelectedObraId] = useState<string | null>(null)
    const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0])
    const [isSavingBulk, setIsSavingBulk] = useState(false)

    // State for measurements: Record<medicao_key, { enabled, value, originalValue }>
    const [measurements, setMeasurements] = useState<Record<string, MeasurementState>>({})

    // Load Obras when opening in New Mode
    useEffect(() => {
        if (isOpen && !isEditing) {
            setLoadingObras(true)
            getObrasForReceitaAction().then(res => {
                if (res.ok) {
                    setObrasList(res.data || [])
                } else {
                    toast({ title: "Erro ao carregar obras", description: res.error, variant: "destructive" })
                }
                setLoadingObras(false)
            })
            // Reset states
            setSelectedObraId(null)
            setSearchTerm("")
            setMeasurements({})
            setImportDate(new Date().toISOString().split('T')[0])
        }
    }, [isOpen, isEditing])

    // Filter logic
    const filteredObras = useMemo(() => {
        if (searchTerm.length < 3) return []
        return obrasList.filter(o => o.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [obrasList, searchTerm])

    const selectedObra = useMemo(() =>
        obrasList.find(o => String(o.id) === selectedObraId),
        [obrasList, selectedObraId])

    // When an Obra is selected, initialize measurements
    useEffect(() => {
        if (selectedObra) {
            const newMeas: Record<string, MeasurementState> = {}
            Object.values(MEDICOES_MAP).forEach(m => {
                const val = Number(selectedObra[m.key]) || 0
                if (val > 0) {
                    newMeas[m.key] = { enabled: true, value: val, originalValue: val }
                }
            })
            setMeasurements(newMeas)
        } else {
            setMeasurements({})
        }
    }, [selectedObra])

    const toggleMeasurement = (key: string) => {
        setMeasurements(prev => {
            const current = prev[key]
            if (!current) return prev
            return { ...prev, [key]: { ...current, enabled: !current.enabled } }
        })
    }

    const updateMeasurementValue = (key: string, valStr: string) => {
        const val = parseMoneyInput(valStr)
        setMeasurements(prev => ({
            ...prev,
            [key]: { ...prev[key], value: val }
        }))
    }

    const handleSaveBulk = async () => {
        if (!selectedObra) return
        setIsSavingBulk(true)

        const transactionsToInsert = Object.entries(measurements)
            .filter(([_, state]) => state.enabled && state.value > 0)
            .map(([key, state]) => {
                const mapItem = MEDICOES_MAP[key]
                return {
                    amount: state.value,
                    date: importDate,
                    type: "receita",
                    subcategories_id: mapItem.id,
                    cliente_id: selectedObra.cliente_id
                }
            })

        if (transactionsToInsert.length === 0) {
            toast({ title: "Nenhum item selecionado", variant: "destructive" })
            setIsSavingBulk(false)
            return
        }

        const res = await createBulkTransactionsAction(transactionsToInsert)
        setIsSavingBulk(false)

        if (res.ok) {
            toast({ title: "Receitas geradas com sucesso!" })
            onClose()
        } else {
            toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" })
        }
    }

    // Handle selection from search
    const selectFromSearch = (id: string) => {
        setSelectedObraId(id)
        setSearchTerm("")
    }

    // ---------------- RENDER ----------------

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-white">
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

                <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-1">

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
                                    <div className="absolute top-[75px] left-0 w-full z-50 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
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

                                        {Object.entries(measurements).length === 0 ? (
                                            <div className="text-gray-500 text-sm italic py-4 text-center bg-gray-50 rounded">
                                                Nenhuma medição encontrada para este cliente.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {Object.entries(measurements).map(([key, state]) => {
                                                    const mapItem = MEDICOES_MAP[key]
                                                    return (
                                                        <div
                                                            key={key}
                                                            className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${state.enabled ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}
                                                        >
                                                            <Checkbox
                                                                checked={state.enabled}
                                                                onCheckedChange={() => toggleMeasurement(key)}
                                                                className={state.enabled ? 'data-[state=checked]:bg-[#F5C800] data-[state=checked]:text-black border-gray-400' : ''}
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
                                        )}
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
