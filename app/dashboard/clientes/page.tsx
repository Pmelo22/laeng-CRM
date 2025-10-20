import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { ClientesTable } from "@/components/clientes-table"

export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: clientes } = await supabase.from("clientes").select("*").order("created_at", { ascending: false })

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
              <h1 className="text-3xl font-bold">Clientes</h1>
              <p className="text-muted-foreground">Gerencie seus clientes cadastrados</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/clientes/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>{clientes?.length || 0} cliente(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientesTable clientes={clientes || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
