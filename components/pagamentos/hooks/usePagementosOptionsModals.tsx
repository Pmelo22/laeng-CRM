import { useEffect, useState } from "react";
import { editingData } from "../types/pagamentosTypes";
import { toast } from "@/hooks/use-toast";
import { createCategoryAction, updateCategoryAction } from "../actions/categoriasActions";
import { createSubcategoryAction, updateSubcategoryAction } from "../actions/subcategoriasActions";

export function useCategoryForm(editingData: editingData, isOpen: boolean, onSuccess: () => void) {

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(editingData.category ? editingData.category.name : "")
    }
  }, [isOpen, editingData.category])

  const handleSave = async () => {
    if (!name.trim) return
    setIsLoading(true)

    const result = editingData.category
      ? await updateCategoryAction(editingData.category.id, name)
      : await createCategoryAction(name)
    setIsLoading(false)

    if (result.ok) {
      toast({ title: "Sucesso", description: "Categoria salva com sucesso." })
      onSuccess()
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    }
  }

  return { name, setName, isLoading, handleSave }
}

export function useSubCategoryForm(editingData: editingData, isSubOpen: boolean, onSuccess: () => void) {

  const [name, setName] = useState("")
  const [id, setId] = useState("") // Este é o ID da Categoria (catId)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isSubOpen) {
      setName(editingData.subcategory ? editingData.subcategory.name : "")
      setId(editingData.subcategory ? editingData.subcategory.catId : "")
    }
  }, [isSubOpen, editingData.subcategory])

  const handleSave = async () => {
    if (!name.trim() || !id) return
    setIsLoading(true)
    const isEditing = editingData.subcategory && editingData.subcategory.id !== "";

    const result = isEditing
      ? await updateSubcategoryAction(editingData.subcategory!.id, name, id)
      : await createSubcategoryAction(name, id)

    setIsLoading(false)

    if (result.ok) {
      toast({ title: "Sucesso", description: "Subcategoria salva com sucesso." })
      onSuccess()
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    }
  }

  return { name, setName, id, setId, isLoading, handleSave }
}