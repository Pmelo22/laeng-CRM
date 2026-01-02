import { useEffect, useState } from "react";
import { OBRA_SUBCATEGORIES_MAP, ObraData } from "../types/pagamentosTypes";
import { createBulkTransactionsAction, getObrasForLinkAction } from "../actions/categoriasActions";
import { toast } from "@/hooks/use-toast";

export function useObras(isOpen: boolean, onSuccess: () => void){

    const [list, setList] = useState<ObraData[]>([])
    const [selectedId, setSelectedId] = useState<string>("")
    const [selectedData, setSelectedData] = useState<ObraData | null>(null)
    const [loading, setIsLoading] = useState(false)
    const [linkFormData, setLinkFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        account_id: "",
        status: "not_pago",
        method: "pix",
        installments_total: 1,
        description_base: "Custo de Obra"
    })
    
    useEffect(() => {
        if (isOpen) {
        setLinkFormData({
            date: new Date().toISOString().split('T')[0],
            account_id: "",
            status: "not_pago",
            method: "pix",
            installments_total: 1,
            description_base: "Custo de Obra"
        })
        setSelectedId("")
        setSelectedData(null)
        fetchObras()
        }
    }, [isOpen])

    const fetchObras = async () => {
        setIsLoading(true)
        const res = await getObrasForLinkAction()
        if (res.ok && res.data) setList(res.data)
        else toast({ title: "Erro", description: "Falha ao carregar obras.", variant: "destructive" })
        setIsLoading(false)
    }

    const handleSelectObra = (val: string) => {
        setSelectedId(val)
        const obra = list.find(o => String(o.id) === val) || null
        setSelectedData(obra)
        if (obra) setLinkFormData(prev => ({ ...prev, description_base: `Obra - ${obra.cliente_nome}` }))
    }

    const handleSaveLinkTransactions = async () => {
        if (!selectedData || !linkFormData.account_id) {
        toast({ title: "Atenção", description: "Selecione a Obra e a Conta Bancária.", variant: "destructive" })
        return
        }
        setIsLoading(true)
        const transactionsToInsert = []
        
        for (const [key, uuid] of Object.entries(OBRA_SUBCATEGORIES_MAP)) {
        const amount = selectedData[key as keyof ObraData] as number
        if (amount && amount > 0) {
            transactionsToInsert.push({
                subcategories_id: uuid,
                account_id: linkFormData.account_id,
                cliente_id: selectedData.cliente_id,
                type: 'despesa',
                status: linkFormData.status,
                amount: amount,
                description: `${linkFormData.description_base} - ${key.toUpperCase()}`,
                date: linkFormData.date,
                method: linkFormData.method,
                installments_current: 1,
                installments_total: linkFormData.installments_total,
            })
        }
        }

        if (transactionsToInsert.length === 0) {
            toast({ title: "Aviso", description: "Esta obra não possui custos registrados." })
            setIsLoading(false)
            return
        }

        const res = await createBulkTransactionsAction(transactionsToInsert)
        setIsLoading(false)
        if (res.ok) {
            toast({ title: "Sucesso!", description: `${transactionsToInsert.length} lançamentos criados.` })
            onSuccess()
        } else {
            toast({ title: "Erro", description: res.error, variant: "destructive" })
        }
    }

    return {list, setList, selectedId, setSelectedId, selectedData, 
            setSelectedData, loading, setIsLoading, linkFormData, 
            setLinkFormData, fetchObras, handleSelectObra, 
            handleSaveLinkTransactions}
}