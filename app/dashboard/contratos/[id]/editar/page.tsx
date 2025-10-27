import { redirect, notFound } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { ContratoForm } from "@/components/contrato-form";

export const dynamic = 'force-dynamic';

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: contrato } = await supabase
    .from("contratos")
    .select("*")
    .eq("id", id)
    .single();

  if (!contrato) {
    notFound();
  }

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .order("nome");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/contratos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Editar Contrato</h1>
          <p className="text-muted-foreground">Atualize os dados do contrato</p>
        </div>

        <ContratoForm contrato={contrato} clientes={clientes || []} />
      </div>
    </div>
  );
}
