"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface Obra {
  id: string
  codigo: number | null
  cliente_nome: string
  responsavel: string
  status: string
  empreiteiro: number | null
  empreiteiro_nome: string | null
  terceirizado: number | null
  material: number | null
  valor_total: number | null
}

interface ObrasTableClienteProps {
  obras: Obra[]
}

export function ObrasTableCliente({ obras }: ObrasTableClienteProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "FINALIZADO": { 
        color: "bg-green-100 text-green-700 border-green-300", 
        label: "Finalizado"
      },
      "EM ANDAMENTO": { 
        color: "bg-orange-100 text-orange-700 border-orange-300", 
        label: "Em Andamento"
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["EM ANDAMENTO"]

    return (
      <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs`}>
        <span className="font-bold">{config.label}</span>
      </Badge>
    )
  }

  const handleVerObra = (obraId: string) => {
    // Redireciona para a página de obras com a obra específica em destaque
    router.push(`/dashboard/obras?highlight=${obraId}`)
  }

  if (obras.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma obra cadastrada para este cliente.
      </div>
    )
  }

  return (
    <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#1E1E1E]">
            <TableRow className="hover:bg-[#1E1E1E]">
              <TableHead className="text-[#F5C800] font-bold py-3">CÓD.</TableHead>
              <TableHead className="text-[#F5C800] font-bold py-3">CLIENTE</TableHead>
              <TableHead className="text-[#F5C800] font-bold py-3">STATUS</TableHead>
              <TableHead className="text-center text-[#F5C800] font-bold py-3">EMPREITEIRO</TableHead>
              <TableHead className="text-center text-[#F5C800] font-bold py-3">MATERIAL (R$)</TableHead>
              <TableHead className="text-center text-[#F5C800] font-bold py-3">TERCEIRIZADO (R$)</TableHead>
              <TableHead className="text-center text-[#F5C800] font-bold py-3">VALOR TOTAL (R$)</TableHead>
              <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obras.map((obra) => {
              const valorEmpreiteiro = obra.empreiteiro || 0
              const totalTerceirizado = obra.terceirizado || 0
              const valorTotalObra = valorEmpreiteiro + (obra.material || 0) + totalTerceirizado
              
              return (
                <TableRow key={obra.id} className="hover:bg-[#F5C800]/5 border-b">
                  <TableCell className="py-3">
                    <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                      #{String(obra.codigo || 0).padStart(3, '0')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium py-3">
                    <span className="font-semibold text-sm">{obra.cliente_nome}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(obra.status)}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="text-left">
                      <div className="text-sm font-semibold">{obra.empreiteiro_nome || 'SEM EMPREITEIRO'}</div>
                      <div className="text-xs font-bold text-black">{formatCurrency(valorEmpreiteiro)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold">
                    <span className="text-sm text-black">{formatCurrency(obra.material || 0)}</span>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <span className="text-sm font-bold text-black">{formatCurrency(totalTerceirizado)}</span>
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold">
                    <span className="text-sm text-green-700">{formatCurrency(valorTotalObra)}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center justify-center">
                      <Button
                        size="sm"
                        onClick={() => handleVerObra(obra.id)}
                        className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 px-3 gap-2 transition-colors"
                        title="Ver obra completa"
                      >
                        <ExternalLink className="h-4 w-4 text-[#1E1E1E]" />
                        <span className="text-[#1E1E1E] font-semibold text-xs">Ver Obra</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
