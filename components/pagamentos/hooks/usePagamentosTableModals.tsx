"use client"

import { useState } from "react"
import { Account, Category, Subcategory } from "../types/pagamentosTypes"
import { randomUUID } from "crypto"

export function usePagamentosModals() {
  // Estados de Controle de UI (Visibilidade)
  const [modalsState, setModalsState] = useState({
    isCatOpen: false,
    isSubOpen: false,
    isAccountOpen: false,
    isDeleteOpen: false,
    isLinkOpen: false
  })

  // Estados de Dados em Edição
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{id?: string, name: string, catId: string} | null>(null)
  const [editingAccount, setEditingAccount] = useState<{value: string, label: string} | null>(null)
  const [itemToDelete, setItemToDelete] = useState<{type: 'cat' | 'sub' | 'account', id: string, name: string} | null>(null)

  // Funções de Abertura (Triggers)
  
  // Link
  const openLinkModal = () => setModalsState(prev => ({ ...prev, isLinkOpen: true }))

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
    setEditingSubcategory(preSelectedCatId ? { id: undefined, name: "", catId: preSelectedCatId } : null)
    setModalsState(prev => ({ ...prev, isSubOpen: true }))
  }
  
  const openEditSubcategory = (sub: Subcategory) => {
    setEditingSubcategory({ id: sub.id, name: sub.name, catId: sub.categories_id })
    setModalsState(prev => ({ ...prev, isSubOpen: true }))
  }

  // Contas
  const openNewAccount = () => {
    setEditingAccount(null)
    setModalsState(prev => ({ ...prev, isAccountOpen: true }))
  }
  const openEditAccount = (acc: Account) => {
    setEditingAccount(acc)
    setModalsState(prev => ({ ...prev, isAccountOpen: true }))
  }

  // Delete
  const openDelete = (type: 'cat' | 'sub' | 'account', id: string, name: string) => {
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
    editingAccount,
    itemToDelete,
    
    // Objeto agrupado para facilitar a passagem pro componente de Modais
    editingData: {
      category: editingCategory,
      subcategory: editingSubcategory,
      account: editingAccount,
      toDelete: itemToDelete
    },

    // Handlers
    handlers: {
      openLinkModal,
      openNewCategory,
      openEditCategory,
      openNewSubcategory,
      openEditSubcategory,
      openNewAccount,
      openEditAccount,
      openDelete
    }
  }
}