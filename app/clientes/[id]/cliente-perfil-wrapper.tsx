"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { ClienteFormModal } from "@/components/cliente-form-modal";
import { Cliente } from "@/lib/types";

interface ClientePerfilWrapperProps {
  cliente: Cliente;
}

export function ClientePerfilWrapper({ cliente }: ClientePerfilWrapperProps) {
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
