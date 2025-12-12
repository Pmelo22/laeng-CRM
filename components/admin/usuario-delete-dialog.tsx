"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import type { Usuario } from "@/lib/types"

interface UsuarioDeleteDialogProps {
  usuario: Usuario | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function UsuarioDeleteDialog({
  usuario,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: UsuarioDeleteDialogProps) {
  if (!usuario) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            Excluir Usuário?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Você está prestes a excluir o usuário{" "}
            <span className="font-bold text-[#1E1E1E]">{usuario.nome_completo}</span>
            {" "}(<span className="text-muted-foreground">{usuario.login}</span>).
            <br />
            <br />
            <span className="text-red-600 font-semibold">
              Esta ação não pode ser desfeita.
            </span>{" "}
            Todos os dados associados a este usuário serão permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir usuário"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
