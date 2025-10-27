import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Building2, 
  DollarSign, 
  CheckCircle2,
  Clock,
  Edit,
  Phone,
  Mail,
  FileText
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
  const totalObras = obras?.length || 0;
  
  // Valor Contratual = soma dos valores totais das obras
  const valorContratual = obras?.reduce((sum, obra) => sum + (obra.valor_total || 0), 0) || 0;
  
  // Valor da Obra (custo real) = soma de terreno + entrada + subsidio
  const valorDaObra = obras?.reduce((sum, obra) => {
    const terreno = obra.terreno || 0;
    const entrada = obra.entrada || 0;
    const subsidio = obra.subsidio || 0;
    return sum + terreno + entrada + subsidio;
  }, 0) || 0;
  
  // Retorno em R$ = Valor Contratual - Valor da Obra
  const retornoRS = valorContratual - valorDaObra;
  
  // Retorno em % = (Retorno R$ / Valor Contratual) * 100
  const retornoPercent = valorContratual > 0 ? (retornoRS / valorContratual) * 100 : 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "FINALIZADO": { 
        color: "bg-green-500 text-white border-green-600 hover:bg-green-600", 
        label: "Finalizado"
      },
      "EM ANDAMENTO": { 
        color: "bg-red-500 text-white border-red-600 hover:bg-red-600", 
        label: "Em Andamento"
      },
      "PENDENTE": { 
        color: "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600", 
        label: "Pendente"
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["PENDENTE"];

    return (
      <Badge variant="outline" className={`${config.color} border font-medium px-2 py-0.5 transition-colors text-xs`}>
        <span className="font-bold">{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase">PERFIL DO CLIENTE</h1>
            <p className="text-sm text-muted-foreground">Visualize todas as informações do cliente</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ClienteActions cliente={cliente} />
          <DeleteClienteButton cliente={cliente} />
        </div>
      </div>

      {/* Grid responsivo - Cards crescem dinamicamente */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1: Dados do Cliente */}
        <Card className="border-2 border-[#F5C800]/30 overflow-visible lg:col-span-2 xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg uppercase">
              <User className="h-5 w-5 text-[#F5C800]" />
              DADOS DO CLIENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 overflow-visible">
            {/* Dados Essenciais - Layout otimizado para mobile */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-6 pb-6 border-b-2 border-[#F5C800]/20 mb-6">
              {/* Código e Status lado a lado em mobile */}
              <div className="grid grid-cols-2 gap-3 sm:contents">
                {/* Código */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">CÓDIGO</span>
                  <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 text-center">
                    #{String(cliente.codigo).padStart(3, '0')}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">STATUS</span>
                  <ClienteStatusBadge cliente={cliente} />
                </div>
              </div>

              {/* Nome - largura total */}
              <div className="flex flex-col gap-1.5 sm:min-w-fit sm:flex-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">NOME</span>
                <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 text-center">
                  {cliente.nome}
                </Badge>
              </div>

              {/* Data de Cadastro - largura total */}
              <div className="flex flex-col gap-1.5 sm:min-w-fit">
                <span className="text-xs text-muted-foreground font-semibold uppercase">DATA DE CADASTRO</span>
                <Badge className="font-sans bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-sm px-3 py-1.5 text-center">
                  {cliente.data_cadastro 
                    ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')
                    : "Não informado"}
                </Badge>
              </div>
            </div>

            {/* Informações Complementares - Grid que cresce para direita */}
            {(cliente.responsavel_contato || cliente.cpf_cnpj || cliente.telefone || cliente.email || cliente.endereco || cliente.cidade || cliente.estado || cliente.cep || cliente.observacoes) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Responsável */}
                {cliente.responsavel_contato && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">RESPONSÁVEL</span>
                    <p className="text-sm text-foreground">{cliente.responsavel_contato}</p>
                  </div>
                )}

                {/* CPF/CNPJ */}
                {cliente.cpf_cnpj && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">CPF/CNPJ</span>
                    <p className="text-sm text-foreground font-mono">{cliente.cpf_cnpj}</p>
                  </div>
                )}

                {/* Telefone */}
                {cliente.telefone && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      TELEFONE
                    </span>
                    <p className="text-sm text-foreground">{cliente.telefone}</p>
                  </div>
                )}

                {/* Email */}
                {cliente.email && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      EMAIL
                    </span>
                    <p className="text-sm text-foreground break-all">{cliente.email}</p>
                  </div>
                )}

                {/* Endereço */}
                {cliente.endereco && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      ENDEREÇO
                    </span>
                    <p className="text-sm text-foreground">{cliente.endereco}</p>
                  </div>
                )}

                {/* Cidade */}
                {cliente.cidade && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">CIDADE</span>
                    <p className="text-sm text-foreground">{cliente.cidade}</p>
                  </div>
                )}

                {/* Estado */}
                {cliente.estado && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">ESTADO</span>
                    <p className="text-sm text-foreground">{cliente.estado}</p>
                  </div>
                )}

                {/* CEP */}
                {cliente.cep && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase block">CEP</span>
                    <p className="text-sm text-foreground">{cliente.cep}</p>
                  </div>
                )}

                {/* Observações - ocupa toda largura */}
                {cliente.observacoes && (
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      OBSERVAÇÕES
                    </span>
                    <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Valor Contratual x Valor da Obra */}
        <Card className="border-2 border-blue-200 lg:col-span-2 xl:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg uppercase">
            <DollarSign className="h-5 w-5 text-blue-600" />
            VALOR CONTRATUAL X VALOR DA OBRA
          </CardTitle>
          <CardDescription className="text-sm">Resumo das obras do cliente</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Grid 2x2 - 4 Cards de Valores - Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Valor Contratual */}
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                      <p className="text-xs font-medium text-blue-900 uppercase">VALOR CONTRATUAL</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorContratual)}
                    </p>
                    <p className="text-xs text-blue-600">Total de {totalObras} obra(s)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Valor da Obra */}
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                      <p className="text-xs font-medium text-green-900 uppercase">VALOR DA OBRA</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorDaObra)}
                    </p>
                    <p className="text-xs text-green-600">Custo total das obras</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Retorno em % */}
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600" />
                      <p className="text-xs font-medium text-orange-900 uppercase">RETORNO EM %</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-orange-700">
                      {retornoPercent.toFixed(2).replace('.', ',')}%
                    </p>
                    <p className="text-xs text-orange-600">Margem de lucro</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Retorno em R$ */}
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                      <p className="text-xs font-medium text-purple-900 uppercase">RETORNO EM R$</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-purple-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(retornoRS)}
                    </p>
                    <p className="text-xs text-purple-600">Lucro total obtido</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gestão de Obras - Tabela Padronizada */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-xl uppercase">
                <Building2 className="h-5 w-5 text-[#F5C800]" />
                CONTROLE DE OBRAS
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Todas as obras vinculadas a este cliente
              </CardDescription>
            </div>
            <Button asChild className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 self-start sm:self-auto">
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {obras && obras.length > 0 ? (
            <div className="rounded-md border-2 border-[#F5C800]/20 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                    <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm">CÓD.</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">NOME</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm">STATUS</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">ENDEREÇO</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3 text-xs sm:text-sm">DATA</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">TERRENO (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">ENTRADA (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">VALOR FINANCIADO (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">SUBSÍDIO (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3 text-xs sm:text-sm whitespace-nowrap">VALOR TOTAL (R$)</TableHead>
                    <TableHead className="text-center text-[#F5C800] font-bold py-3 text-xs sm:text-sm">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obras.map((obra) => (
                    <TableRow key={obra.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-semibold text-xs sm:text-sm">
                        #{String(obra.codigo || 0).padStart(3, '0')}
                      </TableCell>
                      <TableCell className="font-medium">{obra.nome}</TableCell>
                      <TableCell>
                        {getStatusBadge(obra.status || "PENDENTE")}
                      </TableCell>
                      <TableCell>{obra.endereco || '-'}</TableCell>
                      <TableCell>
                        {obra.data_inicio 
                          ? new Date(obra.data_inicio).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {obra.terreno 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.terreno)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {obra.entrada 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.entrada)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {obra.valor_financiado 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.valor_financiado)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {obra.subsidio 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.subsidio)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {obra.valor_total 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.valor_total)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/obras/${obra.id}/editar`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
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
  );
}
