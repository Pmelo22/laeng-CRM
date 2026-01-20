"use client"

import { useState } from "react"
import { Category, Subcategory } from "../types/pagamentosTypes"

export function usePagamentosModals() {
  // Estados de Controle de UI (Visibilidade)
  const [modalsState, setModalsState] = useState({
    isCatOpen: false,
    isSubOpen: false,
    isDeleteOpen: false,
    isLinkOpen: false,
    isFinanceiroLinkOpen: false
  })

  // Estados de Dados em Edição
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{ id: string, name: string, catId: string } | null>(null)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'cat' | 'sub', id: string, name: string } | null>(null)

  // Funções de Abertura (Triggers)

  // Link
  const openLinkModal = () => setModalsState(prev => ({ ...prev, isLinkOpen: true }))

  const openFinanceiroLinkModal = () => setModalsState(prev => ({ ...prev, isFinanceiroLinkOpen: true }))

  // Categorias
  const openNewCategory = () => {
    setEditingCategory(null)
    setModalsState(prev => ({ ...prev, isCatOpen: true }))
  }
  const openEditCategory = (cat: Category) => {
    setEditingCategory({ id: cat.value, name: cat.label })
    setModalsState(prev => ({ ...prev, isCatOpen: true }))
  }

  // Subcategorias
  const openNewSubcategory = (preSelectedCatId?: string) => {
    setEditingSubcategory(preSelectedCatId ? { id: "", name: "", catId: preSelectedCatId } : null)
    setModalsState(prev => ({ ...prev, isSubOpen: true }))
  }

  const openEditSubcategory = (sub: Subcategory) => {
    setEditingSubcategory({ id: sub.id, name: sub.name, catId: sub.categories_id })
    setModalsState(prev => ({ ...prev, isSubOpen: true }))
  }

  // Delete
  const openDelete = (type: 'cat' | 'sub', id: string, name: string) => {
    setItemToDelete({ type, id, name })
    setModalsState(prev => ({ ...prev, isDeleteOpen: true }))
  }

  // Retorna tudo que o componente precisa
  return {
    // Estados
    modalsState,
    setModalsState,
    editingCategory,
    editingSubcategory,
    itemToDelete,

    // Objeto agrupado para facilitar a passagem pro componente de Modais
    editingData: {
      category: editingCategory,
      subcategory: editingSubcategory,
      toDelete: itemToDelete
    },

    // Handlers
    handlers: {
      openLinkModal,
      openFinanceiroLinkModal,
      openNewCategory,
      openEditCategory,
      openNewSubcategory,
      openEditSubcategory,
      openDelete
    }
  }
}