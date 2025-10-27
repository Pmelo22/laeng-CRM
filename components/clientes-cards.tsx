"use client"

import { ClienteComResumo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, CheckCircle2, Clock, DollarSign, Edit, MapPin, Trash2, User } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ClientesCardsProps {
  clientes: ClienteComResumo[]
}

export function ClientesCards({ clientes }: ClientesCardsProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${nome}? Todas as obras vinculadas também serão excluídas.`)) return

    const { error } = await supabase.from("clientes").delete().eq("id", id)

    if (error) {
      alert("Erro ao excluir cliente: " + error.message)
    } else {
      router.refresh()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clientes.map((cliente) => (
        <Card key={cliente.id} className="hover:shadow-xl transition-all border-t-4 border-t-[#F5C800] hover:scale-[1.02]">
          <CardHeader className="pb-3 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] text-white rounded-t-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="font-mono text-xs bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold">
                    #{String(cliente.codigo).padStart(3, '0')}
                  </Badge>
                  {cliente.responsavel_contato && (
                    <Badge className="text-xs bg-white/20 text-white hover:bg-white/30 border-0">
                      {cliente.responsavel_contato}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2 text-white">
                  {cliente.nome}
                </CardTitle>
                {cliente.cidade && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#F5C800]">
                    <MapPin className="h-3 w-3" />
                    {cliente.cidade}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Obras */}
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Obras</span>
              </div>
              <span className="text-sm font-bold">{cliente.total_obras}</span>
            </div>

            {/* Status das Obras */}
            <div className="flex gap-2">
              {cliente.obras_finalizadas > 0 && (
                <div className="flex-1 p-2 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{cliente.obras_finalizadas} Concluída(s)</span>
                  </div>
                </div>
              )}
              {cliente.obras_em_andamento > 0 && (
                <div className="flex-1 p-2 bg-orange-50 rounded-md border border-orange-200">
                  <div className="flex items-center gap-1 text-xs text-orange-700">
                    <Clock className="h-3 w-3" />
                    <span>{cliente.obras_em_andamento} Andamento</span>
                  </div>
                </div>
              )}
            </div>

            {/* Financeiro */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Faturamento</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(cliente.valor_total_obras)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Pago</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(cliente.total_pago)}
                </span>
              </div>

              {cliente.saldo_pendente > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pendente</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCurrency(cliente.saldo_pendente)}
                  </span>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" className="flex-1 bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold">
                <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(cliente.id, cliente.nome)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
