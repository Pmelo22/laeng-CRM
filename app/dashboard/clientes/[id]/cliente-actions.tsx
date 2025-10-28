"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Loader2, Trash2, AlertCircle, DollarSign } from "lucide-react";
import { Cliente } from "@/lib/types";

interface Obra {
  id: string;
  codigo: number;
  valor_terreno: number;
  entrada: number;
  valor_financiado: number;
  subsidio: number;
  valor_total: number;
}

interface ObraData {
  valor_terreno: number;
  entrada: number;
  valor_financiado: number;
  subsidio: number;
  valor_total: number;
}

interface ClienteActionsProps {
  cliente: Cliente;
}

// ============================================
// MODAL DE EDIÇÃO
// ============================================
export function ClienteActions({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);

  const [formData, setFormData] = useState({
    nome: cliente.nome || "",
    cpf_cnpj: cliente.cpf_cnpj || "",
    telefone: cliente.telefone || "",
    email: cliente.email || "",
    status: cliente.status || "PENDENTE",
    endereco: cliente.endereco || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
    cep: cliente.cep || "",
    responsavel_contato: cliente.responsavel_contato || "",
    observacoes: cliente.observacoes || "",
    data_cadastro: cliente.data_cadastro || new Date().toISOString().split('T')[0],
  });

  const [obrasData, setObrasData] = useState<Record<string, ObraData>>({});

  const [loadingCep, setLoadingCep] = useState(false);

  // Buscar obras do cliente quando o modal abrir
  useEffect(() => {
    if (isModalOpen) {
      buscarObras();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const buscarObras = async () => {
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("id, codigo, valor_terreno, entrada, valor_financiado, subsidio, valor_total")
        .eq("cliente_id", cliente.id);

      if (error) throw error;

      setObras(data || []);
      
      // Inicializar obrasData com os valores das obras
      const initialObrasData: Record<string, ObraData> = {};
      (data || []).forEach((obra: Obra) => {
        initialObrasData[obra.id] = {
          valor_terreno: obra.valor_terreno || 0,
          entrada: obra.entrada || 0,
          valor_financiado: obra.valor_financiado || 0,
          subsidio: obra.subsidio || 0,
          valor_total: obra.valor_total || 0,
        };
      });
      setObrasData(initialObrasData);
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
    }
  };

  // Auto-calcular valor total para cada obra (não usado, cálculo inline)
  // const calcularValorTotal = (obraId: string) => {
  //   const obra = obrasData[obraId];
  //   if (!obra) return 0;
  //   return (
  //     Number(obra.valor_terreno || 0) +
  //     Number(obra.entrada || 0) +
  //     Number(obra.valor_financiado || 0) +
  //     Number(obra.subsidio || 0)
  //   );
  // };

  // Atualizar valor total automaticamente (removido - cálculo inline nos handlers)
  // useEffect(() => {
  //   const newObrasData = { ...obrasData };
  //   Object.keys(newObrasData).forEach(obraId => {
  //     newObrasData[obraId].valor_total = calcularValorTotal(obraId);
  //   });
  //   setObrasData(newObrasData);
  // }, [obras.map(o => o.id).join(',')]);

  // Função para formatar valores em reais
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para buscar endereço pelo CEP
  const buscarCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        // Atualiza apenas os campos vazios ou se o usuário permitir
        setFormData(prev => ({
          ...prev,
          endereco: prev.endereco || data.logradouro || "",
          cidade: prev.cidade || data.localidade || "",
          estado: prev.estado || data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value;
    setFormData({ ...formData, cep: newCep });
    
    // Busca automática quando CEP tiver 8 dígitos
    const cepLimpo = newCep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(newCep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Atualizar dados do cliente
      const { error: clienteError } = await supabase
        .from("clientes")
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq("id", cliente.id);

      if (clienteError) throw clienteError;

      // Atualizar valores financeiros de cada obra
      for (const obraId of Object.keys(obrasData)) {
        const obraValues = obrasData[obraId];
        const { error: obraError } = await supabase
          .from("obras")
          .update({
            valor_terreno: obraValues.valor_terreno,
            entrada: obraValues.entrada,
            valor_financiado: obraValues.valor_financiado,
            subsidio: obraValues.subsidio,
            valor_total: obraValues.valor_total,
            updated_at: new Date().toISOString()
          })
          .eq("id", obraId);

        if (obraError) throw obraError;
      }

      router.refresh();
      setIsModalOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar dados";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
      >
        <Edit className="mr-2 h-4 w-4" />
        Editar Cliente
      </Button>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* CPF/CNPJ e Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Status e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "PENDENTE" | "EM ANDAMENTO" | "FINALIZADO") => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <span>PENDENTE</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EM ANDAMENTO">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span>EM ANDAMENTO</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="FINALIZADO">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span>FINALIZADO</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_cadastro">Data de Cadastro *</Label>
                <Input
                  id="data_cadastro"
                  type="date"
                  required
                  value={formData.data_cadastro}
                  onChange={(e) => setFormData({ ...formData, data_cadastro: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* CEP, Endereço */}
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={handleCepChange}
                disabled={isLoading}
                placeholder="00000-000"
                maxLength={9}
              />
              {loadingCep && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                required
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                disabled={isLoading}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            {/* Cidade, Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  maxLength={2}
                  disabled={isLoading}
                  placeholder="UF"
                />
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsavel_contato">Responsável pelo Contato</Label>
              <Input
                id="responsavel_contato"
                value={formData.responsavel_contato}
                onChange={(e) => setFormData({ ...formData, responsavel_contato: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* VALORES FINANCEIROS DAS OBRAS */}
            {obras.length > 0 && (
              <>
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#F5C800]" />
                    <h3 className="text-lg font-semibold">Valores Financeiros das Obras</h3>
                  </div>

                  {obras.map((obra) => (
                    <div key={obra.id} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                      <div className="font-semibold text-sm text-slate-600">
                        Obra #{String(obra.codigo).padStart(3, '0')}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Valor do Terreno */}
                        <div className="space-y-2">
                          <Label htmlFor={`valor_terreno_${obra.id}`}>Valor do Terreno</Label>
                          <Input
                            id={`valor_terreno_${obra.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={obrasData[obra.id]?.valor_terreno || 0}
                            onChange={(e) => {
                              const newValue = Number(e.target.value) || 0;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  valor_terreno: newValue,
                                  valor_total: newValue + (prev[obra.id]?.entrada || 0) + (prev[obra.id]?.valor_financiado || 0) + (prev[obra.id]?.subsidio || 0)
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-[#F5C800]/30 focus:border-[#F5C800]"
                          />
                        </div>

                        {/* Entrada */}
                        <div className="space-y-2">
                          <Label htmlFor={`entrada_${obra.id}`}>Entrada</Label>
                          <Input
                            id={`entrada_${obra.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={obrasData[obra.id]?.entrada || 0}
                            onChange={(e) => {
                              const newValue = Number(e.target.value) || 0;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  entrada: newValue,
                                  valor_total: (prev[obra.id]?.valor_terreno || 0) + newValue + (prev[obra.id]?.valor_financiado || 0) + (prev[obra.id]?.subsidio || 0)
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-[#F5C800]/30 focus:border-[#F5C800]"
                          />
                        </div>

                        {/* Valor Financiado */}
                        <div className="space-y-2">
                          <Label htmlFor={`valor_financiado_${obra.id}`}>Valor Financiado</Label>
                          <Input
                            id={`valor_financiado_${obra.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={obrasData[obra.id]?.valor_financiado || 0}
                            onChange={(e) => {
                              const newValue = Number(e.target.value) || 0;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  valor_financiado: newValue,
                                  valor_total: (prev[obra.id]?.valor_terreno || 0) + (prev[obra.id]?.entrada || 0) + newValue + (prev[obra.id]?.subsidio || 0)
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-[#F5C800]/30 focus:border-[#F5C800]"
                          />
                        </div>

                        {/* Subsídio */}
                        <div className="space-y-2">
                          <Label htmlFor={`subsidio_${obra.id}`}>Subsídio</Label>
                          <Input
                            id={`subsidio_${obra.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={obrasData[obra.id]?.subsidio || 0}
                            onChange={(e) => {
                              const newValue = Number(e.target.value) || 0;
                              setObrasData(prev => ({
                                ...prev,
                                [obra.id]: {
                                  ...prev[obra.id],
                                  subsidio: newValue,
                                  valor_total: (prev[obra.id]?.valor_terreno || 0) + (prev[obra.id]?.entrada || 0) + (prev[obra.id]?.valor_financiado || 0) + newValue
                                }
                              }));
                            }}
                            disabled={isLoading}
                            className="border-[#F5C800]/30 focus:border-[#F5C800]"
                          />
                        </div>
                      </div>

                      {/* Valor Total (Calculado) */}
                      <Card className="bg-[#F5C800]/10 border-[#F5C800]">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-[#F5C800]" />
                              <span className="font-semibold text-lg">Valor Total</span>
                            </div>
                            <span className="text-2xl font-bold text-[#F5C800]">
                              {formatCurrency(obrasData[obra.id]?.valor_total || 0)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Calculado automaticamente: Terreno + Entrada + Financiado + Subsídio
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Atualizar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// BOTÃO DE DELETAR COM CONFIRMAÇÃO DUPLA
// ============================================
export function DeleteClienteButton({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isFirstConfirmOpen, setIsFirstConfirmOpen] = useState(false);
  const [isSecondConfirmOpen, setIsSecondConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFirstConfirm = () => {
    setIsFirstConfirmOpen(false);
    setIsSecondConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (confirmText !== "EXCLUIR") {
      setError("Digite exatamente 'EXCLUIR' para confirmar");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id);

      if (deleteError) throw deleteError;

      // Redireciona para a lista de clientes após exclusão
      router.push("/dashboard/clientes");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir cliente";
      setError(errorMessage);
      setIsDeleting(false);
    }
  };

  const resetSecondConfirm = () => {
    setIsSecondConfirmOpen(false);
    setConfirmText("");
    setError(null);
  };

  return (
    <>
      <Button
        onClick={() => setIsFirstConfirmOpen(true)}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir Cliente
      </Button>

      {/* Primeiro diálogo de confirmação */}
      <AlertDialog open={isFirstConfirmOpen} onOpenChange={setIsFirstConfirmOpen}>
        <AlertDialogContent className="max-w-md !z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-800 pt-2">
              Você está prestes a excluir o cliente: <strong className="text-black font-bold">{cliente.nome}</strong>
              <br />
              <span className="text-red-600 font-semibold block mt-2">
                ⚠️ Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg my-4">
            <div className="font-bold text-red-900 text-lg">{cliente.nome}</div>
            <div className="text-sm text-red-700 font-medium mt-1">
              Código: #{String(cliente.codigo).padStart(3, '0')}
            </div>
          </div>
          <AlertDialogFooter className="flex flex-row gap-2 justify-end">
            <AlertDialogCancel className="m-0 w-auto">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              onClick={handleFirstConfirm}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white m-0 w-auto"
            >
              Sim, Continuar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Segundo diálogo de confirmação com digitação */}
      <AlertDialog open={isSecondConfirmOpen} onOpenChange={resetSecondConfirm}>
        <AlertDialogContent className="max-w-md !z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Confirmação Final
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-800 pt-2">
              Esta é sua última chance de cancelar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border-2 border-yellow-500 p-3 rounded-lg text-center">
              <span className="text-yellow-900 font-bold text-sm">⚠️ ÚLTIMA CHANCE DE CANCELAR ⚠️</span>
            </div>
            
            <div className="text-sm text-gray-800">
              Para confirmar a exclusão permanente de <strong className="text-red-600 font-bold">{cliente.nome}</strong>, digite exatamente:
            </div>
            
            <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg text-center">
              <span className="font-mono font-bold text-2xl text-red-700">EXCLUIR</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="font-semibold text-gray-900">
                Digite EXCLUIR para confirmar:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Digite EXCLUIR"
                disabled={isDeleting}
                className="font-mono text-base border-2 focus:border-red-500 bg-white"
                autoComplete="off"
              />
              {error && (
                <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter className="flex flex-row gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting} className="m-0 w-auto">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== "EXCLUIR"}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed m-0 w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Permanentemente
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================
// BADGE DE STATUS CLICÁVEL
// ============================================
export function ClienteStatusBadge({ cliente }: ClienteActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);

    try {
      // Ciclo: PENDENTE -> EM ANDAMENTO -> FINALIZADO -> PENDENTE
      let newStatus: "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE";
      
      if (cliente.status === "PENDENTE") {
        newStatus = "EM ANDAMENTO";
      } else if (cliente.status === "EM ANDAMENTO") {
        newStatus = "FINALIZADO";
      } else {
        newStatus = "PENDENTE";
      }

      const { error } = await supabase
        .from("clientes")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq("id", cliente.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = {
    "FINALIZADO": { 
      color: "bg-green-500 hover:bg-green-600 text-white", 
      label: "Finalizado"
    },
    "EM ANDAMENTO": { 
      color: "bg-red-500 hover:bg-red-600 text-white", 
      label: "Em Andamento"
    },
    "PENDENTE": { 
      color: "bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E]", 
      label: "Pendente"
    }
  };

  const config = statusConfig[cliente.status as keyof typeof statusConfig] || statusConfig["PENDENTE"];

  return (
    <Badge 
      className={`${config.color} font-semibold text-sm px-3 py-1.5 cursor-pointer transition-all border-0 inline-block ${isUpdating ? 'opacity-50' : ''}`}
      onClick={handleClick}
      title="Clique para alterar o status"
    >
      {isUpdating ? (
        <span className="font-bold">Atualizando...</span>
      ) : (
        <span className="font-bold">{config.label}</span>
      )}
    </Badge>
  );
}

