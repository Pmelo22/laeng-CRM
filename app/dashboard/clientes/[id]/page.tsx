import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Building2, 
  DollarSign, 
  CheckCircle2,
  Clock,
  Edit
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ClientePerfilPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Buscar dados do cliente
  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (clienteError || !cliente) {
    notFound();
  }

  // Buscar obras do cliente
  const { data: obras } = await supabase
    .from("obras")
    .select("*")
    .eq("cliente_id", params.id)
    .order("created_at", { ascending: false });

  // Calcular estatísticas
  const totalObras = obras?.length || 0;
  const obrasFinalizadas = obras?.filter(o => o.status === "FINALIZADO").length || 0;
  const obrasEmAndamento = obras?.filter(o => o.status === "EM ANDAMENTO").length || 0;
  const valorTotal = obras?.reduce((sum, obra) => sum + (obra.valor_total || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "FINALIZADO": { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
      "EM ANDAMENTO": { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Clock },
      "PENDENTE": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["PENDENTE"];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Perfil do Cliente</h1>
            <p className="text-muted-foreground">Visualize todas as informações do cliente</p>
          </div>
        </div>
        <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90">
          <Link href={`/dashboard/clientes/${params.id}/editar`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Cliente
          </Link>
        </Button>
      </div>

      {/* Informações Principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#F5C800]" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Código</p>
              <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-base">
                #{String(cliente.codigo).padStart(3, '0')}
              </Badge>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nome</p>
              <p className="text-lg font-semibold">{cliente.nome}</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              {getStatusBadge(cliente.status || "PENDENTE")}
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                <p className="font-medium">{cliente.endereco || "Não informado"}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Data de Cadastro</p>
                <p className="font-medium">
                  {cliente.data_cadastro 
                    ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')
                    : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#F5C800]" />
              Estatísticas
            </CardTitle>
            <CardDescription>Resumo das obras do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-[#F5C800]/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-[#F5C800]" />
                    <p className="text-3xl font-bold">{totalObras}</p>
                    <p className="text-sm text-muted-foreground">Total de Obras</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-3xl font-bold text-green-600">{obrasFinalizadas}</p>
                    <p className="text-sm text-muted-foreground">Finalizadas</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-3xl font-bold text-orange-600">{obrasEmAndamento}</p>
                    <p className="text-sm text-muted-foreground">Em Andamento</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorTotal)}
                    </p>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Obras */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#F5C800]" />
                Obras do Cliente
              </CardTitle>
              <CardDescription>
                Histórico de todas as obras relacionadas a este cliente
              </CardDescription>
            </div>
            <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90">
              <Link href={`/dashboard/obras/novo?cliente_id=${params.id}`}>
                Nova Obra
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {obras && obras.length > 0 ? (
            <div className="space-y-4">
              {obras.map((obra) => (
                <Card key={obra.id} className="border-2 hover:border-[#F5C800]/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{obra.nome}</h3>
                          {getStatusBadge(obra.status || "PENDENTE")}
                        </div>
                        {obra.descricao && (
                          <p className="text-sm text-muted-foreground">{obra.descricao}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {obra.data_inicio 
                                ? new Date(obra.data_inicio).toLocaleDateString('pt-BR')
                                : "Sem data"}
                            </span>
                          </div>
                          {obra.valor_total && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {new Intl.NumberFormat('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                }).format(obra.valor_total)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/obras/${obra.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhuma obra cadastrada para este cliente</p>
              <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90">
                <Link href={`/dashboard/obras/novo?cliente_id=${params.id}`}>
                  Cadastrar Primeira Obra
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
