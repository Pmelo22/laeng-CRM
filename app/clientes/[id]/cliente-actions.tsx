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
import { Edit, Loader2, Trash2 } from "lucide-react";
import { Cliente } from "@/lib/types";
import { ClienteFormModal } from "@/components/cliente-form-modal";

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

      <ClienteFormModal
        cliente={cliente}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// ============================================
// BOTÃO DE DELETAR COM CONFIRMAÇÃO ÚNICA
// ============================================
export function DeleteClienteButton({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id);

      if (deleteError) throw deleteError;

      // Redireciona para a lista de clientes após exclusão
      router.push("/clientes");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir cliente";
      console.error(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsConfirmOpen(true)}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        <Trash2 className="mr-1 h-4 w-4" />
        Excluir Cliente
      </Button>

      {/* Diálogo de confirmação */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-md !z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-800 pt-2">
              Você está prestes a excluir o cliente: <strong className="text-black font-bold">{cliente.nome}</strong>
              <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg my-4">
            <div className="font-bold text-red-900 text-lg">{cliente.nome}</div>
            <div className="text-sm text-red-700 font-medium mt-1">
              Código: #{String(cliente.codigo).padStart(3, '0')}
            </div>
          </div>
          <AlertDialogFooter className="flex flex-row gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting} className="m-0 w-auto">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
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
      color: "bg-red-600 hover:bg-red-600 text-white", 
      label: "Em Andamento"
    },
    "PENDENTE": { 
      color: "bg-blue-700 hover:bg-blue-700 text-white", 
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

