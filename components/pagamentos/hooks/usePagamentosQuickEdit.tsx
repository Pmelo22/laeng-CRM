"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { parseMoneyInput } from "@/lib/utils"
import { updateTransactionAction } from "../actions/pagamentosActions"

interface UseQuickEditProps {
  isOpen: boolean
  onClose: () => void
  currentValue: any
  currentValueSecondary?: any
  fieldName: string
  fieldNameSecondary?: string
  tableId: string
  type: string
  options?: any[]
}

export function useQuickEdit({
  isOpen,
  onClose,
  currentValue,
  currentValueSecondary,
  fieldName,
  fieldNameSecondary,
  tableId,
  type,
  options
}: UseQuickEditProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const [value, setValue] = useState(currentValue)
  const [valueSecondary, setValueSecondary] = useState(currentValueSecondary)
  const [isLoading, setIsLoading] = useState(false)

  // Estados específicos para Category Tree
  const [step, setStep] = useState<"category" | "subcategory">("category")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")

  // Sincroniza estados ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      if (type === "category_tree") {
        setSelectedCategory(currentValueSecondary || "")
        setSelectedSubcategory(currentValue || "")
        setStep("category")
      } else {
        setValue(currentValue)
        setValueSecondary(currentValueSecondary)
      }
    }
  }, [isOpen, currentValue, currentValueSecondary, type])

  // Lógica de filtragem
  const filteredSubcategories = type === 'category_tree' && options 
    ? options.filter((sub: any) => sub.categories_id === selectedCategory)
    : []

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (categoryId !== selectedCategory) setSelectedSubcategory("")
    setStep("subcategory")
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Prepara o objeto de updates
      const updates: Record<string, any> = {}

      if (type === "money") {
        updates[fieldName] = typeof value === 'string' ? parseMoneyInput(value) : value
      } else if (type === "installments") {
        updates[fieldName] = Number(value)
        if (fieldNameSecondary) updates[fieldNameSecondary] = Number(valueSecondary)
      } else if (type === "category_tree") {
        updates["subcategories_id"] = selectedSubcategory
      } else {
        updates[fieldName] = value
      }

      // Chama a Server Action
      const result = await updateTransactionAction(tableId, updates)

      if (!result.success) throw new Error(result.error)

      toast({
        title: "✅ Atualizado!",
        description: "Registro salvo com sucesso.",
        duration: 3000,
      })

      onClose()
      setTimeout(() => router.refresh(), 500)
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o registro.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    value, setValue,
    valueSecondary, setValueSecondary,
    isLoading,
    // Category Tree props
    step, setStep,
    selectedCategory, 
    selectedSubcategory, setSelectedSubcategory,
    filteredSubcategories,
    handleCategorySelect,
    // Actions
    handleSave
  }
}