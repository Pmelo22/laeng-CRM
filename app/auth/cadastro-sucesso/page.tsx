import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from 'lucide-react';

export default function CadastroSucessoPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Conta Criada!</CardTitle>
            <CardDescription>
              Verifique seu email para confirmar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enviamos um link de confirmação para o seu email. 
              Clique no link para ativar sua conta e fazer login.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Voltar para Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
