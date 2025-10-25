import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Plus, ArrowLeft, Building2, User } from "lucide-react"
import { ObrasTable } from "@/components/obras-table"
import type { ObraComCliente } from "@/lib/types"

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar obras com informações do cliente usando a view
  const { data: obras } = await supabase
    .from("vw_obras_detalhadas")
    .select("*")
    .order("codigo", { ascending: false })

  const obrasComCliente = (obras as unknown as ObraComCliente[]) || []

  // Agrupar obras por cliente
  const obrasPorCliente = obrasComCliente.reduce((acc, obra) => {
    const clienteNome = obra.cliente_nome || "Sem Cliente"
    if (!acc[clienteNome]) {
      acc[clienteNome] = []
    }
    acc[clienteNome].push(obra)
    return acc
  }, {} as Record<string, ObraComCliente[]>)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Obras</h1>
              <p className="text-muted-foreground">
                Obras organizadas por cliente
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 text-black">
              <Link href="/dashboard/obras/novo">
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </Link>
            </Button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Obras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{obrasComCliente.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Clientes com Obras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{Object.keys(obrasPorCliente).length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {formatCurrency(obrasComCliente.reduce((sum, o) => sum + o.valor_total, 0))}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Obras Agrupadas por Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Obras por Cliente</CardTitle>
            <CardDescription>
              {Object.keys(obrasPorCliente).length} cliente(s) com {obrasComCliente.length} obra(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(obrasPorCliente)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([clienteNome, obrasDoCliente]) => {
                  const totalObras = obrasDoCliente.length
                  const valorTotal = obrasDoCliente.reduce((sum, o) => sum + o.valor_total, 0)
                  const finalizadas = obrasDoCliente.filter(o => o.status === 'FINALIZADO').length
                  const emAndamento = obrasDoCliente.filter(o => o.status === 'EM ANDAMENTO').length

                  return (
                    <AccordionItem key={clienteNome} value={clienteNome}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                              <div className="font-semibold">{clienteNome}</div>
                              <div className="text-xs text-muted-foreground">
                                {obrasDoCliente[0]?.cliente_cidade || obrasDoCliente[0]?.cliente_endereco}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {finalizadas > 0 && (
                                <Badge variant="outline" className="text-green-600">
                                  {finalizadas} Finalizadas
                                </Badge>
                              )}
                              {emAndamento > 0 && (
                                <Badge variant="outline" className="text-orange-600">
                                  {emAndamento} Em Andamento
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{formatCurrency(valorTotal)}</div>
                              <div className="text-xs text-muted-foreground">{totalObras} obras</div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4">
                          <ObrasTable obras={obrasDoCliente} showCliente={false} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
