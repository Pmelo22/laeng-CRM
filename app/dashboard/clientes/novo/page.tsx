import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { ClienteForm } from "@/components/cliente-form";

export default async function NovoClientePage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/clientes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Novo Cliente</h1>
          <p className="text-muted-foreground">Cadastre um novo cliente no sistema</p>
        </div>

        <ClienteForm />
      </div>
    </div>
  );
}
