"use client";

import { Obra } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ObrasTableProps {
  obras: Obra[];
}

export function ObrasTable({ obras }: ObrasTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("obras").delete().eq("id", id);
    if (!error) {
      router.refresh();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (obras.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhuma obra cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CÓD.</TableHead>
            <TableHead>NOME</TableHead>
            <TableHead>RESPONSÁVEL</TableHead>
            <TableHead>ENTIDADE</TableHead>
            <TableHead>ENDEREÇO</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>VALOR TOTAL</TableHead>
            <TableHead>DATA</TableHead>
            <TableHead className="text-right">AÇÕES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {obras.map((obra) => (
            <TableRow key={obra.id}>
              <TableCell className="font-medium">{obra.codigo}</TableCell>
              <TableCell>{obra.cliente_nome}</TableCell>
              <TableCell>{obra.responsavel}</TableCell>
              <TableCell>{obra.entidade || '-'}</TableCell>
              <TableCell>{obra.endereco}</TableCell>
              <TableCell>
                <Badge 
                  variant={obra.status === 'FINALIZADO' ? 'default' : 'secondary'}
                  className={obra.status === 'FINALIZADO' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }
                >
                  {obra.status}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(obra.valor_total)}</TableCell>
              <TableCell>{formatDate(obra.data_conclusao)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/obras/${obra.id}/editar`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(obra.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
