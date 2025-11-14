import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  DollarSign
} from "lucide-react";
import { ClienteActions, ClienteStatusBadge, DeleteClienteButton } from "./cliente-actions";

export const dynamic = 'force-dynamic';

export default async function ClientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Buscar dados do cliente
  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (clienteError || !cliente) {
    notFound();
  }

  // Buscar obras do cliente
  const { data: obras } = await supabase
    .from("obras")
    .select("*")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  // Calcular estatísticas
  // Valor Contratual = soma dos valores totais das obras
  const valorContratual = obras?.reduce((sum, obra) => sum + (obra.valor_total || 0), 0) || 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header com botão de voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Perfil do Cliente</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <ClienteActions cliente={cliente} />
          <DeleteClienteButton cliente={cliente} />
        </div>
      </div>

      {/* Layout vertical - Cards empilhados */}
      <div className="space-y-6">
        {/* Card 1: Dados do Cliente - Aumentado com Destaque */}
        <Card className="border-2 border-[#F5C800]/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
              <User className="h-5 w-5 text-[#F5C800]" />
              DADOS DO CLIENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {/* DADOS PRINCIPAIS */}
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Código */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">CÓDIGO</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 w-fit">
                    #{String(cliente.codigo).padStart(3, '0')}
                  </Badge>
                </div>

                {/* Nome */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">NOME</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 w-fit">
                    {cliente.nome}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">STATUS</span>
                  <ClienteStatusBadge cliente={cliente} />
                </div>

                {/* Data de Contrato */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">DATA</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 w-fit">
                    {cliente.data_cadastro 
                      ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')
                      : "Não informado"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* LINHA 2: CPF e Telefone */}
            {(cliente.cpf_cnpj || cliente.telefone) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-4">
                {cliente.cpf_cnpj && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">CPF/CNPJ</span>
                    <p className="text-sm font-mono text-foreground">{cliente.cpf_cnpj}</p>
                  </div>
                )}

                {/* Telefone */}
                {cliente.telefone && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">TELEFONE</span>
                    <p className="text-sm text-foreground">{cliente.telefone}</p>
                  </div>
                )}
              </div>
            )}

            {/* LINHA 3: CEP, Endereço, Cidade e Estado */}
            {(cliente.cep || cliente.endereco || cliente.cidade || cliente.estado) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-4">
                {/* CEP */}
                {cliente.cep && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">CEP</span>
                    <p className="text-sm font-mono text-foreground">{cliente.cep}</p>
                  </div>
                )}

                {/* Endereço */}
                {cliente.endereco && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">ENDEREÇO</span>
                    <p className="text-sm text-foreground">{cliente.endereco}</p>
                  </div>
                )}

                {/* Cidade */}
                {cliente.cidade && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">CIDADE</span>
                    <p className="text-sm text-foreground">{cliente.cidade}</p>
                  </div>
                )}

                {/* Estado */}
                {cliente.estado && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">ESTADO</span>
                    <p className="text-sm text-foreground">{cliente.estado}</p>
                  </div>
                )}
              </div>
            )}

            {/* LINHA 4: Observações */}
            {cliente.observacoes && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase block">OBSERVAÇÕES</span>
                <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Dados Financeiros - Compacto */}
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base uppercase">
              <DollarSign className="h-4 w-4 text-green-600" />
              DADOS FINANCEIROS
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            {/* Grid com 5 cards de valores financeiros - Mais compacto */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Card 1: Valor Contratual */}
              <Card className="border border-[#F5C800] bg-[#F5C800]">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#1E1E1E] uppercase">VALOR CONTRATUAL</p>
                    <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorContratual)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Terreno */}
              <Card className="border border-yellow-200 bg-yellow-200">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#1E1E1E] uppercase">TERRENO</p>
                    <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.valor_terreno || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Entrada */}
              <Card className="border border-yellow-200 bg-yellow-200">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#1E1E1E] uppercase">ENTRADA</p>
                    <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.entrada || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Valor Financiado */}
              <Card className="border border-yellow-200 bg-yellow-200">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#1E1E1E] uppercase">VALOR FINANCIADO</p>
                    <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.valor_financiado || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 5: Subsídio */}
              <Card className="border border-yellow-200 bg-yellow-200">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#1E1E1E] uppercase">SUBSÍDIO</p>
                    <p className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.subsidio || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
