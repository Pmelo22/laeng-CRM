"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, Trash2, AlertCircle } from "lucide-react";
import { Cliente } from "@/lib/types";
import { ClienteEditModal } from "@/components/cliente-edit-modal";

interface ClienteActionsProps {
  cliente: Cliente;
}

// ============================================
// BOTÃO DE EDIÇÃO
// ============================================
export function ClienteActions({ cliente }: ClienteActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
      >
        <Edit className="mr-2 h-4 w-4" />
        Editar Cliente
      </Button>

      <ClienteEditModal
        cliente={cliente}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// ============================================
// BOTÃO DE DELETAR COM CONFIRMAÇÃO DUPLA
// ============================================
export function DeleteClienteButton({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isFirstConfirmOpen, setIsFirstConfirmOpen] = useState(false);
  const [isSecondConfirmOpen, setIsSecondConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFirstConfirm = () => {
    setIsFirstConfirmOpen(false);
    setIsSecondConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (confirmText !== "EXCLUIR") {
      setError("Digite exatamente 'EXCLUIR' para confirmar");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id);

      if (deleteError) throw deleteError;

      // Redireciona para a lista de clientes após exclusão
      router.push("/dashboard/clientes");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir cliente";
      setError(errorMessage);
      setIsDeleting(false);
    }
  };

  const resetSecondConfirm = () => {
    setIsSecondConfirmOpen(false);
    setConfirmText("");
    setError(null);
  };

  return (
    <>
      <Button
        onClick={() => setIsFirstConfirmOpen(true)}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir Cliente
      </Button>

      {/* Primeiro diálogo de confirmação */}
      <AlertDialog open={isFirstConfirmOpen} onOpenChange={setIsFirstConfirmOpen}>
        <AlertDialogContent className="max-w-md !z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-800 pt-2">
              Você está prestes a excluir o cliente: <strong className="text-black font-bold">{cliente.nome}</strong>
              <br />
              <span className="text-red-600 font-semibold block mt-2">
                ⚠️ Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg my-4">
            <div className="font-bold text-red-900 text-lg">{cliente.nome}</div>
            <div className="text-sm text-red-700 font-medium mt-1">
              Código: #{String(cliente.codigo).padStart(3, '0')}
            </div>
          </div>
          <AlertDialogFooter className="flex flex-row gap-2 justify-end">
            <AlertDialogCancel className="m-0 w-auto">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              onClick={handleFirstConfirm}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white m-0 w-auto"
            >
              Sim, Continuar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Segundo diálogo de confirmação com digitação */}
      <AlertDialog open={isSecondConfirmOpen} onOpenChange={resetSecondConfirm}>
        <AlertDialogContent className="max-w-md !z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Confirmação Final
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-800 pt-2">
              Esta é sua última chance de cancelar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border-2 border-yellow-500 p-3 rounded-lg text-center">
              <span className="text-yellow-900 font-bold text-sm">⚠️ ÚLTIMA CHANCE DE CANCELAR ⚠️</span>
            </div>
            
            <div className="text-sm text-gray-800">
              Para confirmar a exclusão permanente de <strong className="text-red-600 font-bold">{cliente.nome}</strong>, digite exatamente:
            </div>
            
            <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg text-center">
              <span className="font-mono font-bold text-2xl text-red-700">EXCLUIR</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="font-semibold text-gray-900">
                Digite EXCLUIR para confirmar:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Digite EXCLUIR"
                disabled={isDeleting}
                className="font-mono text-base border-2 focus:border-red-500 bg-white"
                autoComplete="off"
              />
              {error && (
                <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter className="flex flex-row gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting} className="m-0 w-auto">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== "EXCLUIR"}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed m-0 w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Permanentemente
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================
// BADGE DE STATUS CLICÁVEL
// ============================================
export function ClienteStatusBadge({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);

    try {
      // Ciclo: PENDENTE -> EM ANDAMENTO -> FINALIZADO -> PENDENTE
      let newStatus: "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE";
      
      if (cliente.status === "PENDENTE") {
        newStatus = "EM ANDAMENTO";
      } else if (cliente.status === "EM ANDAMENTO") {
        newStatus = "FINALIZADO";
      } else {
        newStatus = "PENDENTE";
      }

      const { error } = await supabase
        .from("clientes")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq("id", cliente.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = {
    "FINALIZADO": { 
      color: "bg-green-500 hover:bg-green-600 text-white", 
      label: "Finalizado"
    },
    "EM ANDAMENTO": { 
      color: "bg-red-500 hover:bg-red-600 text-white", 
      label: "Em Andamento"
    },
    "PENDENTE": { 
      color: "bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E]", 
      label: "Pendente"
    }
  };

  const config = statusConfig[cliente.status as keyof typeof statusConfig] || statusConfig["PENDENTE"];

  return (
    <Badge 
      className={`${config.color} font-semibold text-sm px-3 py-1.5 cursor-pointer transition-all border-0 inline-block ${isUpdating ? 'opacity-50' : ''}`}
      onClick={handleClick}
      title="Clique para alterar o status"
    >
      {isUpdating ? (
        <span className="font-bold">Atualizando...</span>
      ) : (
        <span className="font-bold">{config.label}</span>
      )}
    </Badge>
  );
}

