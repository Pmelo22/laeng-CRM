import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="max-w-md w-full border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-orange-100 rounded-full">
                  <Construction className="h-12 w-12 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Em Manutenção</CardTitle>
              <CardDescription className="text-base mt-2">
                Esta página está temporariamente indisponível
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Estamos trabalhando para melhorar esta funcionalidade.
                Por favor, acesse a seção de <strong>Clientes</strong> através do menu lateral.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
