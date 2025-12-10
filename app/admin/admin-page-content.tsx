"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Shield } from "lucide-react"
import { UsuariosTable } from "@/components/admin/usuarios-table"
import { UsuarioModal } from "@/components/admin/usuario-modal"
import { UsuarioDeleteDialog } from "@/components/admin/usuario-delete-dialog"
import type { Usuario } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AdminPageContentProps {
  usuarios: Usuario[]
}

const EXAMPLE_USER: Usuario = {
  id: "1",
  email: "admin",
  nome_completo: "Administrador",
  cargo: "admin",
  ativo: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ultimo_acesso: new Date().toISOString(),
}

interface ModalState {
  isOpen: boolean
  usuario: Usuario | null
}

interface DeleteState {
  isOpen: boolean
  usuario: Usuario | null
  isDeleting: boolean
}

export default function AdminPageContent({ usuarios: initialUsuarios }: AdminPageContentProps) {
  const { toast } = useToast()
  const [usuarios] = useState<Usuario[]>([...initialUsuarios, EXAMPLE_USER])
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    usuario: null,
  })
  
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isOpen: false,
    usuario: null,
    isDeleting: false,
  })

  const handleRefetchUsuarios = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error("❌ Erro ao recarregar usuários:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleOpenModal = useCallback((usuario: Usuario | null = null) => {
    setModalState({
      isOpen: true,
      usuario,
    })
  }, [])

  const handleCloseModal = useCallback(async () => {
    setModalState({
      isOpen: false,
      usuario: null,
    })
    await handleRefetchUsuarios()
  }, [handleRefetchUsuarios])

  const handleOpenDeleteDialog = useCallback((usuario: Usuario) => {
    setDeleteState(prev => ({
      ...prev,
      isOpen: true,
      usuario,
    }))
  }, [])

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteState(prev => ({
      ...prev,
      isOpen: false,
      usuario: null,
    }))
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    const { usuario } = deleteState
    if (!usuario) return

    setDeleteState(prev => ({ ...prev, isDeleting: true }))
    try {
      console.log("🗑️ Excluindo usuário:", usuario.id)

      toast({
        title: "Usuário excluído!",
        description: `${usuario.nome_completo} foi removido com sucesso.`,
      })

      handleCloseDeleteDialog()
      await handleRefetchUsuarios()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Ocorreu um erro ao excluir o usuário."
      
      console.error("❌ Erro ao excluir usuário:", error)
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeleteState(prev => ({ ...prev, isDeleting: false }))
    }
  }, [deleteState, handleCloseDeleteDialog, handleRefetchUsuarios, toast])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-[#1E1E1E] border-b-4 border-[#F5C800] px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 uppercase">
              <Shield className="h-8 w-8 text-[#F5C800]" />
              Administração de Usuários
            </h1>
            <p className="text-[#F5C800] mt-2 text-sm uppercase font-medium">
              Gerencie usuários e permissões do sistema
            </p>
          </div>
          
          <Button
            onClick={() => handleOpenModal()}
            className="h-12 bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold shadow-lg hover:shadow-xl transition-all px-6 rounded-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <UsuariosTable
              usuarios={usuarios}
              onEdit={handleOpenModal}
              onDelete={handleOpenDeleteDialog}
              isRefreshing={isRefreshing}
            />
          </CardContent>
        </Card>
      </div>

      <UsuarioModal
        usuario={modalState.usuario}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
      />

      <UsuarioDeleteDialog
        usuario={deleteState.usuario}
        isOpen={deleteState.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteState.isDeleting}
      />
    </div>
  )
}
