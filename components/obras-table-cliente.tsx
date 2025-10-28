"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Edit } from "lucide-react";

interface Obra {
  id: string
  codigo?: number
  endereco?: string
  status?: string
  data_inicio?: string
  valor_terreno?: number
  entrada?: number
  valor_financiado?: number
  subsidio?: number
  valor_total?: number
}

interface ObrasTableProps {
  clienteId: string
  obras: Obra[]
}

export function ObrasTable({ clienteId, obras }: ObrasTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "FINALIZADO": { 
        color: "bg-green-100 text-green-700 border-green-300", 
        label: "Finalizado"
      },
      "EM ANDAMENTO": { 
        color: "bg-yellow-100 text-yellow-700 border-yellow-300", 
        label: "Em Andamento"
      },
      "PENDENTE": { 
        color: "bg-gray-100 text-gray-600 border-gray-300", 
        label: "Pendente"
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["PENDENTE"];

    return (
      <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs`}>
        <span className="font-bold">{config.label}</span>
      </Badge>
    );
  };

  if (!obras || obras.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
            <Building2 className="h-5 w-5 text-[#F5C800]" />
            CONTROLE DE OBRAS
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            Todas as obras vinculadas a este cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">Nenhuma obra cadastrada para este cliente</p>
            <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90">
              <Link href={`/dashboard/obras/novo?cliente_id=${clienteId}`}>
                Cadastrar Primeira Obra
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
              <Building2 className="h-5 w-5 text-[#F5C800]" />
              CONTROLE DE OBRAS
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {obras.length} obra(s) cadastrada(s)
            </CardDescription>
          </div>
          <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 self-start sm:self-auto">
            <Link href={`/dashboard/obras/novo?cliente_id=${clienteId}`}>
              <Building2 className="h-4 w-4 mr-2" />
              Nova Obra
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border-2 border-[#F5C800]/20 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm">CÓD.</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm">STATUS</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">ENDEREÇO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm">DATA</TableHead>
                <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">TERRENO</TableHead>
                <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">ENTRADA</TableHead>
                <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">FINANCIADO</TableHead>
                <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">SUBSÍDIO</TableHead>
                <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">TOTAL</TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3 text-xs sm:text-sm">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obras.map((obra) => (
                <TableRow key={obra.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-semibold text-xs sm:text-sm">
                    #{String(obra.codigo || 0).padStart(3, '0')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(obra.status || "PENDENTE")}
                  </TableCell>
                  <TableCell>{obra.endereco || '-'}</TableCell>
                  <TableCell>
                    {obra.data_inicio 
                      ? new Date(obra.data_inicio).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {obra.valor_terreno 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.valor_terreno)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {obra.entrada 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.entrada)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {obra.valor_financiado 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.valor_financiado)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {obra.subsidio 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.subsidio)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {obra.valor_total 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.valor_total)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/obras/${obra.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
