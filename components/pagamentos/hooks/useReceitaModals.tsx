"use client"

import { useState, useEffect, useMemo } from "react"
import { usePagamentosForm } from "./usePagamentosForm"
import { getObrasForReceitaAction, createBulkTransactionsAction } from "../actions/financeiroActions"
import { toast } from "@/hooks/use-toast"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"
import { MEDICOES_MAP } from "../types/pagamentosTypes"
import type { Pagamentos } from "@/lib/types"

export interface MeasurementState {
    enabled: boolean
    value: number
    originalValue: number
}

export function useReceitaModals(
    isOpen: boolean,
    onClose: () => void,
    pagamento?: Pagamentos | null
) {
    const isEditing = !!pagamento

    // --- EDIT MODE LOGIC (Single Transaction) ---
    const {
        formData,
        isLoading: isSavingSingle,
        updateField,
        updateMoney,
        savePagamento
    } = usePagamentosForm(isOpen, onClose, pagamento)

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
                if (val >= 0) {
                    newMeas[m.key] = { enabled: val > 0, value: val, originalValue: val }
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
            .filter(([_, state]) => state.enabled)
            .map(([key, state]) => {
                const mapItem = MEDICOES_MAP[key]
                return {
                    amount: state.value,
                    date: importDate,
                    type: "receita",
                    subcategories_id: mapItem.id,
                    cliente_id: selectedObra.cliente_id,
                    codigo: selectedObra.codigo
                }
            })

        const res = await createBulkTransactionsAction(transactionsToInsert)
        setIsSavingBulk(false)

        if (res.ok) {
            // Verifica duplicatas
            if (res.duplicates && res.duplicates.length > 0) {
                const duplicateNames = res.duplicates.map((d: any) => {
                    const entry = Object.values(MEDICOES_MAP).find(m => m.id === d.subcategories_id)
                    return entry ? entry.name : "Desconhecido"
                })

                const inserted = res.insertedCount || 0
                const dupMsg = duplicateNames.join(", ")

                if (inserted > 0) {
                    toast({
                        title: "Salvo Parcialmente",
                        description: `Foram salvas ${inserted} transações. As seguintes já existiam: ${dupMsg}`,
                        duration: 5000
                    })
                } else {
                    toast({
                        title: "Nenhuma transação salva",
                        description: `Todas as transações selecionadas já existem: ${dupMsg}`,
                        variant: "destructive",
                        duration: 5000
                    })
                }
            } else {
                toast({ title: "Receitas geradas com sucesso!" })
            }
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

    return {
        isEditing,
        formData,
        isSavingSingle,
        updateField,
        updateMoney,
        savePagamento,
        loadingObras,
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
    }
}
