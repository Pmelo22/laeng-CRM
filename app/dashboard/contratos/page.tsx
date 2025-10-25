import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { ContratosTable } from "@/components/contratos-table"

export const dynamic = 'force-dynamic';

export default async function ContratosPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: contratos } = await supabase
    .from("contratos")
    .select(`
      *,
      clientes (
        id,
        nome
      )
    `)
    .order("created_at", { ascending: false })

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
              <h1 className="text-3xl font-bold">Contratos</h1>
              <p className="text-muted-foreground">Gerencie seus contratos e obras</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/contratos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Contratos</CardTitle>
            <CardDescription>{contratos?.length || 0} contrato(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <ContratosTable contratos={contratos || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
