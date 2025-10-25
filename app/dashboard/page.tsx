import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Bem-vindo ao sistema de gestão de engenharia
        </p>
      </div>

      {/* Main Content - Em Manutenção */}
      <div className="flex items-center justify-center min-h-[60vh]">
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
              Estamos trabalhando para melhorar sua experiência. 
              Por favor, acesse a seção de <strong>Clientes</strong> através do menu lateral.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
