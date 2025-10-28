import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Building2, 
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
  
  // Valor da Obra (custo real) = soma de terreno + entrada + subsidio
  const valorDaObra = obras?.reduce((sum, obra) => {
    const terreno = obra.valor_terreno || 0;
    const entrada = obra.entrada || 0;
    const subsidio = obra.subsidio || 0;
    return sum + terreno + entrada + subsidio;
  }, 0) || 0;

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
            {/* DADOS PRINCIPAIS - Destacados */}
            <div className="mb-6 p-4 rounded-lg bg-[#F5C800]/5 border border-[#F5C800]/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Código */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">CÓDIGO</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 w-fit">
                    #{String(cliente.codigo).padStart(3, '0')}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">STATUS</span>
                  <ClienteStatusBadge cliente={cliente} />
                </div>

                {/* Nome */}
                <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">NOME</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 w-fit">
                    {cliente.nome}
                  </Badge>
                </div>

                {/* Data de Cadastro */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">DATA DE CADASTRO</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 w-fit">
                    {cliente.data_cadastro 
                      ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')
                      : "Não informado"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* DADOS COMPLEMENTARES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Responsável */}
              {cliente.responsavel_contato && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">RESPONSÁVEL</span>
                  <p className="text-sm text-foreground">{cliente.responsavel_contato}</p>
                </div>
              )}

              {/* CPF/CNPJ */}
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

              {/* Email */}
              {cliente.email && (
                <div className="flex flex-col gap-2 col-span-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">EMAIL</span>
                  <p className="text-sm text-foreground break-all">{cliente.email}</p>
                </div>
              )}

              {/* Endereço */}
              {cliente.endereco && (
                <div className="flex flex-col gap-2 col-span-2">
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

              {/* CEP */}
              {cliente.cep && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">CEP</span>
                  <p className="text-sm font-mono text-foreground">{cliente.cep}</p>
                </div>
              )}

              {/* Observações */}
              {cliente.observacoes && (
                <div className="flex flex-col gap-2 col-span-full">
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">OBSERVAÇÕES</span>
                  <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
                </div>
              )}
            </div>
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
            {/* Grid com 6 cards de valores financeiros - Mais compacto */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Card 1: Valor Contratual */}
              <Card className="border border-blue-300 bg-blue-50">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-blue-900 uppercase">VALOR CONTRATUAL</p>
                    <p className="text-sm sm:text-base font-bold text-blue-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorContratual)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Valor da Obra */}
              <Card className="border border-green-300 bg-green-50">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-green-900 uppercase">VALOR DA OBRA</p>
                    <p className="text-sm sm:text-base font-bold text-green-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorDaObra)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Terreno */}
              <Card className="border border-amber-300 bg-amber-50">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-amber-900 uppercase">TERRENO</p>
                    <p className="text-sm sm:text-base font-bold text-amber-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.valor_terreno || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Entrada */}
              <Card className="border border-cyan-300 bg-cyan-50">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-cyan-900 uppercase">ENTRADA</p>
                    <p className="text-sm sm:text-base font-bold text-cyan-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.entrada || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 5: Valor Financiado */}
              <Card className="border border-indigo-300 bg-indigo-50">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-indigo-900 uppercase">VALOR FINANCIADO</p>
                    <p className="text-sm sm:text-base font-bold text-indigo-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format((obras || []).reduce((acc, obra) => acc + (obra.valor_financiado || 0), 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 6: Subsídio */}
              <Card className="border border-rose-300 bg-rose-50">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-rose-900 uppercase">SUBSÍDIO</p>
                    <p className="text-sm sm:text-base font-bold text-rose-700">
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

        {/* Seção de Gestão de Obras - Tabela com Novas Colunas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
              <Building2 className="h-5 w-5 text-[#F5C800]" />
              CONTROLE DE OBRAS
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Todas as obras vinculadas a este cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {obras && obras.length > 0 ? (
              <div className="rounded-md border-2 border-[#F5C800]/20 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                      <TableHead className="text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs">CÓD.</TableHead>
                      <TableHead className="text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">NOME</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">EMPREITEIRO</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">TERCEIRIZADO</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">MATERIAL</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">MÃO-DE-OBRA</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">PINTOR</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">ELETRICISTA</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">GESSEIRO</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">AZULEJISTA</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">MANUTENÇÃO</TableHead>
                      <TableHead className="text-right text-[#F5C800] font-bold py-2 text-[10px] sm:text-xs whitespace-nowrap">VALOR TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obras.map((obra) => (
                      <TableRow key={obra.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-semibold text-[10px] sm:text-xs py-2">
                          #{String(obra.codigo || 0).padStart(3, '0')}
                        </TableCell>
                        <TableCell className="font-medium text-[10px] sm:text-xs py-2">{obra.nome}</TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.empreiteiro 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.empreiteiro)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.terceirizado 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.terceirizado)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.material 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.material)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.mao_de_obra 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.mao_de_obra)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.pintor 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.pintor)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.eletricista 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.eletricista)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.gesseiro 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.gesseiro)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.azulejista 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.azulejista)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs py-2">
                          {obra.manutencao 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.manutencao)
                            : 'R$ 0,00'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[10px] sm:text-xs py-2">
                          {obra.valor_total 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.valor_total)
                            : 'R$ 0,00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Nenhuma obra cadastrada para este cliente</p>
                <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90">
                  <Link href={`/dashboard/obras/novo?cliente_id=${id}`}>
                    Cadastrar Primeira Obra
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
