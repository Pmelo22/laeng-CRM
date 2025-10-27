"use client";

import { Contrato } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

interface ContratosTableProps {
  contratos: Contrato[];
}

export function ContratosTable({ contratos }: ContratosTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return;

    const { error } = await supabase.from("contratos").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir contrato: " + error.message);
    } else {
      router.refresh();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "Em andamento": "default",
      "Concluído": "secondary",
      "Cancelado": "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (contratos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum contrato cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Local da Obra</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell className="font-medium">
                {contrato.clientes?.nome || "N/A"}
              </TableCell>
              <TableCell>{contrato.local_obra}</TableCell>
              <TableCell>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(contrato.valor_total)}
              </TableCell>
              <TableCell>{contrato.responsavel}</TableCell>
              <TableCell>{getStatusBadge(contrato.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/contratos/${contrato.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contrato.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
