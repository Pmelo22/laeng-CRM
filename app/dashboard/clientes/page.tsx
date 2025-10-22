import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plus, ArrowLeft, Users, Building2, DollarSign, AlertCircle, List, LayoutGrid } from "lucide-react"
import { ClientesTable } from "@/components/clientes-table"
import { ClientesCards } from "@/components/clientes-cards"
import type { ClienteComResumo } from "@/lib/types"

export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar clientes com resumo de obras (usando a view)
  const { data: clientesResumo } = await supabase
    .from("vw_clientes_resumo")
    .select("*")
    .order("nome", { ascending: true })

  const clientes = (clientesResumo as unknown as ClienteComResumo[]) || []

  // Calcular totais gerais
  const totais = {
    clientes: clientes.length,
    obras: clientes.reduce((sum, c) => sum + (c.total_obras || 0), 0),
    faturamento: clientes.reduce((sum, c) => sum + (c.valor_total_obras || 0), 0),
    pendente: clientes.reduce((sum, c) => sum + (c.saldo_pendente || 0), 0),
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header com identidade visual - Compacto e responsivo */}
      <div className="bg-[#1E1E1E] border-b-4 border-[#F5C800]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-[#F5C800]">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Clientes</h1>
                <p className="text-[#F5C800] font-medium text-sm">Gerencie seus clientes e suas obras</p>
              </div>
            </div>
            <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold shadow-lg">
              <Link href="/dashboard/clientes/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">

        {/* Cards de Resumo Geral - Estilo com identidade visual */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-[#F5C800] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <div className="rounded-full bg-[#F5C800] p-2">
                <Users className="h-4 w-4 text-[#1E1E1E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E1E1E]">{totais.clientes}</div>
              <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F5C800] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Obras</CardTitle>
              <div className="rounded-full bg-[#F5C800] p-2">
                <Building2 className="h-4 w-4 text-[#1E1E1E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E1E1E]">{totais.obras}</div>
              <p className="text-xs text-muted-foreground mt-1">Obras de todos os clientes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F5C800] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <div className="rounded-full bg-[#F5C800] p-2">
                <DollarSign className="h-4 w-4 text-[#1E1E1E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E1E1E]">{formatCurrency(totais.faturamento)}</div>
              <p className="text-xs text-muted-foreground mt-1">Soma de todas as obras</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F5C800] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
              <div className="rounded-full bg-[#F5C800] p-2">
                <AlertCircle className="h-4 w-4 text-[#1E1E1E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E1E1E]">{formatCurrency(totais.pendente)}</div>
              <p className="text-xs text-muted-foreground mt-1">Obras em andamento</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-t-4 border-t-[#F5C800]">
          <CardHeader className="bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] text-white rounded-t-lg py-6">
            <CardTitle className="text-2xl font-bold">Lista de Clientes</CardTitle>
            <CardDescription className="text-[#F5C800] font-medium text-base mt-2">
              {clientes.length} cliente(s) com resumo de obras
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="lista" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-[#1E1E1E] p-1">
                <TabsTrigger 
                  value="lista" 
                  className="flex items-center gap-2 data-[state=active]:bg-[#F5C800] data-[state=active]:text-[#1E1E1E] data-[state=active]:font-bold text-white"
                >
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
                <TabsTrigger 
                  value="cards" 
                  className="flex items-center gap-2 data-[state=active]:bg-[#F5C800] data-[state=active]:text-[#1E1E1E] data-[state=active]:font-bold text-white"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="lista">
                <ClientesTable clientes={clientes} />
              </TabsContent>
              
              <TabsContent value="cards">
                <ClientesCards clientes={clientes} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
