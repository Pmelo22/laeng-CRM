"use client"

import { useState, useEffect, useMemo } from "react"
import { usePagamentosForm } from "./usePagamentosForm"
import { createBulkTransactionsAction } from "../actions/obrasActions"
import { toast } from "@/hooks/use-toast"
import { parseMoneyInput } from "@/lib/utils"
import { DESPESAS_OBRAS_MAP } from "../types/pagamentosTypes"
import type { Pagamentos } from "@/lib/types"
import { getObrasForDespesaAction } from "../actions/obrasActions"

export interface MeasurementState {
    enabled: boolean
    value: number
    originalValue: number
}

export type DespesaMode = 'initial' | 'obras' | 'general'

export function useDespesasModals(
    isOpen: boolean,
    onClose: () => void,
    pagamento?: Pagamentos | null
) {
    const isEditing = !!pagamento

    // State for mode selection (only for new entries)
    const [mode, setMode] = useState<DespesaMode>('initial')

    // --- EDIT / GENERAL MODE LOGIC ---
    const {
        formData,
        isLoading: isSavingSingle,
        updateField,
        updateMoney,
        savePagamento
    } = usePagamentosForm(isOpen, onClose, pagamento)

    // Force type to 'despesa' in edit mode or when saving
    useEffect(() => {
        if (isOpen && formData.type !== 'despesa') {
            updateField('type', 'despesa')
        }
    }, [isOpen, formData.type])

    // Reset mode when closing
    useEffect(() => {
        if (!isOpen) {
            setMode('initial')
        }
    }, [isOpen])

    // --- OBRAS MODE LOGIC (Import/Bulk) ---
    const [loadingObras, setLoadingObras] = useState(false)
    const [obrasList, setObrasList] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedObraId, setSelectedObraId] = useState<string | null>(null)
    const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0])
    const [isSavingBulk, setIsSavingBulk] = useState(false)

    // State for measurements: Record<key, { enabled, value, originalValue }>
    const [measurements, setMeasurements] = useState<Record<string, MeasurementState>>({})

    // Load Obras when validation mode is 'obras'
    useEffect(() => {
        if (isOpen && !isEditing && mode === 'obras' && obrasList.length === 0) {
            setLoadingObras(true)
            getObrasForDespesaAction().then(res => {
                if (res.ok) {
                    setObrasList(res.data || [])
                } else {
                    toast({ title: "Erro ao carregar obras", description: res.error, variant: "destructive" })
                }
                setLoadingObras(false)
            })
        }
    }, [isOpen, isEditing, mode])

    // Reset specific states
    useEffect(() => {
        if (!isOpen) { // Reset on close
            setSelectedObraId(null)
            setSearchTerm("")
            setMeasurements({})
            setImportDate(new Date().toISOString().split('T')[0])
            setMode('initial')
        }
    }, [isOpen])


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
            Object.entries(DESPESAS_OBRAS_MAP).forEach(([mapKey, m]) => {
                const val = Number(selectedObra[m.key]) || 0
                newMeas[mapKey] = { enabled: false, value: 0, originalValue: val }
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
                const mapItem = DESPESAS_OBRAS_MAP[key]
                return {
                    amount: state.value,
                    date: importDate,
                    type: "despesa",
                    subcategories_id: mapItem.id,
                    cliente_id: selectedObra.cliente_id,
                    codigo: selectedObra.codigo
                }
            })

        const res = await createBulkTransactionsAction(transactionsToInsert)
        setIsSavingBulk(false)

        if (res.ok) {
            toast({ title: "Despesas geradas com sucesso!", description: `Foram salvas ${res.insertedCount} despesas.` })
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

        mode,
        setMode,

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
