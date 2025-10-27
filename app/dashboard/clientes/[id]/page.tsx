import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Edit,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import { ClienteActions, ClienteStatusBadge } from "./cliente-actions";

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
        icon: CheckCircle2,
        label: "Finalizado"
      },
      "EM ANDAMENTO": { 
        color: "bg-red-500 text-white border-red-600 hover:bg-red-600", 
        icon: Clock,
        label: "Em Andamento"
      },
      "PENDENTE": { 
        color: "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600", 
        icon: Clock,
        label: "Pendente"
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["PENDENTE"];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} border font-medium px-2 py-0.5 transition-colors text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold uppercase">PERFIL DO CLIENTE</h1>
            <p className="text-muted-foreground">Visualize todas as informações do cliente</p>
          </div>
        </div>
        <ClienteActions cliente={cliente} />
      </div>

      {/* Grid de 2 Colunas - Dados e Valores (cards soltos) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1: Dados do Cliente */}
        <Card className="border-2 border-[#F5C800]/30 overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg uppercase">
              <User className="h-5 w-5 text-[#F5C800]" />
              DADOS DO CLIENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 overflow-visible">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Código - sempre aparece */}
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground font-semibold uppercase">CÓDIGO</span>
                <div>
                  <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs">
                    #{String(cliente.codigo).padStart(3, '0')}
                  </Badge>
                </div>
              </div>

              {/* Nome - sempre aparece */}
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground font-semibold uppercase">NOME</span>
                <p className="text-sm text-foreground">{cliente.nome}</p>
              </div>

              {/* Responsável - condicional */}
              {cliente.responsavel_contato && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase">RESPONSÁVEL</span>
                  <p className="text-sm text-foreground">{cliente.responsavel_contato}</p>
                </div>
              )}

              {/* Status - sempre aparece */}
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground font-semibold uppercase">STATUS</span>
                <div>
                  <ClienteStatusBadge cliente={cliente} />
                </div>
              </div>

              {/* CPF/CNPJ - condicional */}
              {cliente.cpf_cnpj && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase">CPF/CNPJ</span>
                  <p className="text-sm text-foreground">{cliente.cpf_cnpj}</p>
                </div>
              )}

              {/* Telefone - condicional */}
              {cliente.telefone && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    TELEFONE
                  </span>
                  <p className="text-sm text-foreground">{cliente.telefone}</p>
                </div>
              )}

              {/* Email - condicional */}
              {cliente.email && (
                <div className="space-y-1.5 col-span-2">
                  <span className="text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    EMAIL
                  </span>
                  <p className="text-sm text-foreground">{cliente.email}</p>
                </div>
              )}

              {/* Endereço - condicional */}
              {cliente.endereco && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    ENDEREÇO
                  </span>
                  <p className="text-sm text-foreground">{cliente.endereco}</p>
                </div>
              )}

              {/* Cidade - condicional */}
              {cliente.cidade && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase">CIDADE</span>
                  <p className="text-sm text-foreground">{cliente.cidade}</p>
                </div>
              )}

              {/* Estado - condicional */}
              {cliente.estado && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase">ESTADO</span>
                  <p className="text-sm text-foreground">{cliente.estado}</p>
                </div>
              )}

              {/* CEP - condicional */}
              {cliente.cep && (
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground font-semibold uppercase">CEP</span>
                  <p className="text-sm text-foreground">{cliente.cep}</p>
                </div>
              )}

              {/* Data de Cadastro - sempre aparece */}
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  DATA DE CADASTRO
                </span>
                <p className="text-sm text-foreground">
                  {cliente.data_cadastro 
                    ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')
                    : "Não informado"}
                </p>
              </div>

              {/* Observações - condicional */}
              {cliente.observacoes && (
                <div className="space-y-1.5 col-span-2">
                  <span className="text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    OBSERVAÇÕES
                  </span>
                  <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Valor Contratual x Valor da Obra */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg uppercase">
              <DollarSign className="h-5 w-5 text-blue-600" />
              VALOR CONTRATUAL X VALOR DA OBRA
            </CardTitle>
            <CardDescription>Resumo das obras do cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Grid 2x2 - 4 Cards de Valores */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Valor Contratual (Superior Esquerdo) */}
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <p className="text-xs font-medium text-blue-900 uppercase">VALOR CONTRATUAL</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorContratual)}
                    </p>
                    <p className="text-xs text-blue-600">Total de {totalObras} obra(s)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Valor da Obra (Superior Direito) */}
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-xs font-medium text-green-900 uppercase">VALOR DA OBRA</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(valorDaObra)}
                    </p>
                    <p className="text-xs text-green-600">Custo total das obras</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Retorno em % (Inferior Esquerdo) */}
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <p className="text-xs font-medium text-orange-900 uppercase">RETORNO EM %</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                      {retornoPercent.toFixed(2).replace('.', ',')}%
                    </p>
                    <p className="text-xs text-orange-600">Margem de lucro</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Retorno em R$ (Inferior Direito) */}
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <p className="text-xs font-medium text-purple-900 uppercase">RETORNO EM R$</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl uppercase">
                <Building2 className="h-5 w-5 text-[#F5C800]" />
                CONTROLE DE OBRAS
              </CardTitle>
              <CardDescription className="mt-1">
                Todas as obras vinculadas a este cliente
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
            <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                    <TableHead className="text-[#F5C800] font-bold py-3">CÓD.</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3">NOME</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3">STATUS</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3">ENDEREÇO</TableHead>
                    <TableHead className="text-[#F5C800] font-bold py-3">DATA</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3">TERRENO (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3">ENTRADA (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3">VALOR FINANCIADO (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3">SUBSÍDIO (R$)</TableHead>
                    <TableHead className="text-right text-[#F5C800] font-bold py-3">VALOR TOTAL (R$)</TableHead>
                    <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obras.map((obra) => (
                    <TableRow key={obra.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-semibold">
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
