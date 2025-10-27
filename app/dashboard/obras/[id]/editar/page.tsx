import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ObraForm } from "@/components/obra-form";

export const dynamic = 'force-dynamic';

interface EditarObraPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarObraPage({ params }: EditarObraPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: obra } = await supabase
    .from("obras")
    .select("*")
    .eq("id", id)
    .single();

  if (!obra) {
    redirect("/dashboard/obras");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/obras">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Obras
          </Link>
        </Button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Editar Obra</h1>
          <p className="text-muted-foreground">Atualize as informações da obra</p>
        </div>
        <ObraForm obra={obra} />
      </div>
    </div>
  );
}
