"use client";

import { ObraComCliente } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
  obras: ObraComCliente[];
  showCliente?: boolean;
}

export function ObrasTable({ obras, showCliente = true }: ObrasTableProps) {
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
    <div className="space-y-4">
      {/* Tabela para desktop - esconde em mobile */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CÓD.</TableHead>
            {showCliente && <TableHead>CLIENTE</TableHead>}
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
              {showCliente && <TableCell>{obra.cliente_nome}</TableCell>}
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

      {/* Cards para mobile - mostra apenas em telas pequenas */}
      <div className="md:hidden space-y-3 px-1">
        {obras.map((obra) => (
          <div key={obra.id} className="bg-white rounded-lg border-2 border-[#F5C800]/20 p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className="bg-[#F5C800] text-[#1E1E1E] font-bold text-xs">
                    #{String(obra.codigo).padStart(3, '0')}
                  </Badge>
                  <Badge 
                    variant={obra.status === 'FINALIZADO' ? 'default' : 'secondary'}
                    className={`text-xs ${obra.status === 'FINALIZADO' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {obra.status}
                  </Badge>
                </div>
                {showCliente && (
                  <h3 className="font-semibold text-base sm:text-lg">{obra.cliente_nome}</h3>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  <User className="h-3 w-3 inline mr-1" />
                  {obra.responsavel}
                </p>
              </div>
            </div>
            
            <div className="space-y-1.5 text-sm">
              {obra.entidade && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs font-medium min-w-16">Entidade:</span>
                  <span className="text-xs flex-1">{obra.entidade}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-xs flex-1">{obra.endereco}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-xs font-medium min-w-16">Valor:</span>
                <span className="text-xs font-semibold text-green-600">{formatCurrency(obra.valor_total)}</span>
              </div>
              {obra.data_conclusao && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs font-medium min-w-16">Conclusão:</span>
                  <span className="text-xs">{formatDate(obra.data_conclusao)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 border-[#F5C800]/50 hover:bg-[#F5C800]/10 text-xs h-8"
                asChild
              >
                <Link href={`/dashboard/obras/${obra.id}/editar`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-200 hover:bg-red-50 text-red-600 text-xs h-8"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
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
          </div>
        ))}
      </div>
    </div>
  );
}
